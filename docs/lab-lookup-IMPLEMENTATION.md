# Lab Lookup Integration - Implementation Plan

**Project:** PediaBrain Lab Lookup API Integration  
**Date:** 2026-09-11  
**Status:** Ready to Execute  
**Estimated Duration:** 1-2 weeks  
**Related:** See `lab-lookup-integration-PRD.md`

---

## Overview

This document provides step-by-step technical implementation for integrating SIMRS and Hema Lab APIs into PediaBrain.

**Architecture Summary:**

```
PediaBrain (Vercel) → Next.js API Proxy → VPS SIMRS API → Hospital SIMRS
```

---

## Prerequisites Checklist

- [x] VPS SSH access (ubuntu@43.156.9.123)
- [x] SIMRS Web running on port 8099
- [x] PediaBrain GitHub access (SDWIP-KYD/PediaBrain)
- [x] Vercel deployment access
- [ ] SIMRS service account credentials (need to create)
- [ ] Shared secret token for API auth (need to generate)

---

## Phase 1: VPS Public API Endpoint

**Goal:** Add public lookup endpoint to SIMRS Web FastAPI server  
**Duration:** 2-3 hours  
**Risk:** Low

### Step 1.1: Generate API Token

```bash
# SSH to VPS
ssh ubuntu@43.156.9.123

# Generate secure token
openssl rand -hex 32 > /opt/sirs/api_token.txt
chmod 600 /opt/sirs/api_token.txt
cat /opt/sirs/api_token.txt  # Copy this for later
```

### Step 1.2: Add Environment Variable

```bash
# Edit environment file
sudo nano /opt/sirs/sirs.env

# Add line:
# PUBLIC_API_TOKEN=<paste_token_here>

# Restart service
sudo systemctl restart sirs-web
```

### Step 1.3: Backup Existing Code

```bash
cd /home/ubuntu/hema-repo/sirs-web
cp main.py main.py.backup-$(date +%Y%m%d)
git add -A
git commit -m "backup: before public API addition"
```

### Step 1.4: Add Public API Endpoint

**File:** `/home/ubuntu/hema-repo/sirs-web/main.py`

**Insert after line 192 (after `/api/pasien` endpoint):**

```python
# ====== PUBLIC API (for PediaBrain integration) ======
PUBLIC_TOKEN = os.environ.get("PUBLIC_API_TOKEN", "")

@app.get("/api/public/pasien")
def public_api_pasien(norm: str, token: str):
    """Public lookup endpoint for external integrations (PediaBrain).

    Security: Token-based auth, rate limited, CORS restricted.
    """
    # Auth check
    if not PUBLIC_TOKEN or token != PUBLIC_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid token")

    # Validate NORM
    norm = norm.strip()
    if not norm or not norm.isdigit() or len(norm) < 3:
        return JSONResponse(
            {"ok": False, "error": "Invalid NORM format", "code": "INVALID_INPUT"},
            status_code=400
        )

    # Check cache
    cache_key = ("public_pasien", norm)
    cached = cache_get(cache_key)
    if cached:
        return JSONResponse({**cached, "cached": True})

    # Create service session (reuse logic from existing endpoints)
    try:
        # Get service account credentials
        service_login = os.environ.get("SIMRS_SERVICE_LOGIN", "")
        service_pass = os.environ.get("SIMRS_SERVICE_PASS", "")

        if not service_login or not service_pass:
            raise HTTPException(500, detail="Service account not configured")

        sess = simrs_login(service_login, service_pass)
    except Exception as e:
        return JSONResponse(
            {"ok": False, "error": f"SIMRS login failed: {str(e)}", "code": "AUTH_ERROR"},
            status_code=500
        )

    # Fetch patient data
    BASE = "http://127.0.0.1:8080"
    try:
        r = sess.get(f"{BASE}/webservice/general/pasien/{norm}", timeout=20)
        if not r.ok or not r.json().get("success"):
            return JSONResponse(
                {"ok": False, "error": "Patient not found", "code": "NOT_FOUND"},
                status_code=404
            )

        p = r.json().get("data", {})

        # Extract phone number
        hp = ""
        for kt in (p.get("KONTAK") or []):
            if isinstance(kt, dict) and (kt.get("JENIS") in (3, "3") or "08" in str(kt.get("NOMOR", ""))):
                hp = kt.get("NOMOR", "")
                break

        # Calculate age
        tgl_lahir = (p.get("TANGGAL_LAHIR") or "")[:10]
        umur = ""
        if tgl_lahir:
            from datetime import datetime
            try:
                birth = datetime.strptime(tgl_lahir, "%Y-%m-%d")
                now = datetime.now()
                months = (now.year - birth.year) * 12 + (now.month - birth.month)
                years = months // 12
                rem_months = months % 12
                if years > 0:
                    umur = f"{years} tahun"
                    if rem_months > 0:
                        umur += f" {rem_months} bulan"
                elif months > 0:
                    umur = f"{months} bulan"
                else:
                    days = (now - birth).days
                    umur = f"{days} hari"
            except:
                pass

        result = {
            "ok": True,
            "patient": {
                "norm": norm,
                "nama": p.get("NAMA", ""),
                "tgl_lahir": tgl_lahir,
                "jk": "L" if p.get("JENIS_KELAMIN") == 1 else "P" if p.get("JENIS_KELAMIN") == 2 else "",
                "umur": umur,
                "alamat": p.get("ALAMAT", ""),
                "no_hp": hp,
            },
            "cached": False,
            "timestamp": datetime.now().isoformat()
        }

        # Cache for 5 minutes
        cache_set(cache_key, result)
        return JSONResponse(result)

    except requests.Timeout:
        return JSONResponse(
            {"ok": False, "error": "SIMRS timeout", "code": "TIMEOUT"},
            status_code=504
        )
    except Exception as e:
        return JSONResponse(
            {"ok": False, "error": f"Server error: {str(e)}", "code": "SERVER_ERROR"},
            status_code=500
        )
```

### Step 1.5: Add Service Account to Environment

```bash
sudo nano /opt/sirs/sirs.env

# Add lines:
# SIMRS_SERVICE_LOGIN=pediabrain_readonly
# SIMRS_SERVICE_PASS=<secure_password>
```

**Note:** Need to create this account in SIMRS admin panel with read-only permissions.

### Step 1.6: Test Endpoint

```bash
# Get token
TOKEN=$(cat /opt/sirs/api_token.txt)

# Test with sample NORM
curl "http://localhost:8099/api/public/pasien?norm=123456&token=$TOKEN"

# Expected response:
# {"ok": true, "patient": {...}, "cached": false}
```

### Step 1.7: Restart and Verify

```bash
sudo systemctl restart sirs-web
sudo systemctl status sirs-web  # Should be active

# Test again
curl "http://localhost:8099/api/public/pasien?norm=123456&token=$TOKEN" | jq
```

---

## Phase 2: PediaBrain API Proxy

**Goal:** Create Next.js API route to proxy requests to VPS  
**Duration:** 1-2 hours  
**Risk:** Low

### Step 2.1: Add Environment Variable to Vercel

```bash
# Via Vercel CLI
vercel env add SIMRS_API_TOKEN
# Paste token from Step 1.1

vercel env add SIMRS_API_URL
# Value: https://sirs.kay.web.id/api/public/pasien
```

Or via Vercel Dashboard:

- Go to Project Settings → Environment Variables
- Add `SIMRS_API_TOKEN` (production + preview)
- Add `SIMRS_API_URL` (production + preview)

### Step 2.2: Create API Route

**File:** `src/app/api/simrs-proxy/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";

const SIMRS_API_URL = process.env.SIMRS_API_URL;
const SIMRS_API_TOKEN = process.env.SIMRS_API_TOKEN;

// In-memory cache (5 min TTL)
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const norm = searchParams.get("norm");

  // Validation
  if (!norm) {
    return NextResponse.json(
      { ok: false, error: "NORM parameter required", code: "INVALID_INPUT" },
      { status: 400 },
    );
  }

  if (!/^\d{3,8}$/.test(norm)) {
    return NextResponse.json(
      { ok: false, error: "NORM must be 3-8 digits", code: "INVALID_INPUT" },
      { status: 400 },
    );
  }

  // Check cache
  const cached = cache.get(norm);
  if (cached && Date.now() < cached.expires) {
    return NextResponse.json({ ...cached.data, cached: true });
  }

  // Fetch from VPS
  try {
    const url = `${SIMRS_API_URL}?norm=${norm}&token=${SIMRS_API_TOKEN}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "PediaBrain/1.0" },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          ok: false,
          error: error.error || "SIMRS request failed",
          code: error.code || "SERVER_ERROR",
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Cache successful response
    if (data.ok) {
      cache.set(norm, { data, expires: Date.now() + CACHE_TTL });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json(
        { ok: false, error: "Request timeout", code: "TIMEOUT" },
        { status: 504 },
      );
    }

    return NextResponse.json(
      { ok: false, error: "Network error", code: "NETWORK_ERROR" },
      { status: 500 },
    );
  }
}
```

### Step 2.3: Test Locally

```bash
cd /home/ubuntu/PediaBrain

# Add env vars to .env.local
echo "SIMRS_API_URL=http://localhost:8099/api/public/pasien" >> .env.local
echo "SIMRS_API_TOKEN=$(ssh ubuntu@43.156.9.123 'cat /opt/sirs/api_token.txt')" >> .env.local

# Run dev server
npm run dev

# Test in another terminal
curl "http://localhost:3000/api/simrs-proxy?norm=123456"
```

---

## Phase 3: Frontend Integration

**Goal:** Update Lab Lookup page to fetch and display data  
**Duration:** 3-4 hours  
**Risk:** Medium

### Step 3.1: Create Patient Info Component

**File:** `src/components/patient-info-card.tsx` (NEW)

```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Phone, MapPin, Activity } from "lucide-react";

type PatientData = {
  norm: string;
  nama: string;
  tgl_lahir: string;
  jk: string;
  umur: string;
  alamat: string;
  no_hp: string;
};

export function PatientInfoCard({ patient }: { patient: PatientData }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-4 w-4 text-neon" />
          Data Pasien
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-lg font-bold text-foreground">{patient.nama}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              RM: {patient.norm}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {patient.jk === "L" ? "Laki-laki" : "Perempuan"}
            </Badge>
            {patient.umur && (
              <Badge variant="secondary" className="text-xs">
                {patient.umur}
              </Badge>
            )}
          </div>
        </div>

        {patient.tgl_lahir && (
          <div className="flex items-start gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Tanggal Lahir</p>
              <p className="text-foreground">{patient.tgl_lahir}</p>
            </div>
          </div>
        )}

        {patient.no_hp && (
          <div className="flex items-start gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">No. HP</p>
              <p className="text-foreground">{patient.no_hp}</p>
            </div>
          </div>
        )}

        {patient.alamat && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Alamat</p>
              <p className="text-foreground text-xs leading-relaxed">
                {patient.alamat}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### Step 3.2: Update Lab Lookup Page

This is too long to write in one operation. I'll update in focused patches.

**Patch 1: Add imports and types**

```typescript
// At top of src/app/lab-lookup/page.tsx
import { PatientInfoCard } from "@/components/patient-info-card";
import { Loader2, AlertCircle } from "lucide-react";

type APIResponse = {
  ok: boolean;
  patient?: {
    norm: string;
    nama: string;
    tgl_lahir: string;
    jk: string;
    umur: string;
    alamat: string;
    no_hp: string;
  };
  error?: string;
  code?: string;
  cached?: boolean;
};
```

**Patch 2: Add state management**

```typescript
// Add to component state
const [loading, setLoading] = useState(false);
const [patientData, setPatientData] = useState<APIResponse | null>(null);
const [error, setError] = useState<string>("");
```

**Patch 3: Add fetch function**

```typescript
async function fetchPatientData() {
  if (!mrNumber.trim()) {
    setError("Masukkan nomor rekam medis");
    return;
  }

  setLoading(true);
  setError("");
  setPatientData(null);

  try {
    const res = await fetch(
      `/api/simrs-proxy?norm=${encodeURIComponent(mrNumber.trim())}`,
    );
    const data: APIResponse = await res.json();

    if (data.ok && data.patient) {
      setPatientData(data);
    } else {
      setError(data.error || "Gagal mengambil data pasien");
    }
  } catch (err) {
    setError("Tidak dapat terhubung ke server");
  } finally {
    setLoading(false);
  }
}
```

**Patch 4: Update button handler**

```typescript
// Replace openSIMRS function
function openSIMRS() {
  if (!mrNumber.trim()) {
    alert("Masukkan nomor rekam medis terlebih dahulu");
    return;
  }
  const url = `https://sirs.kay.web.id/testing?norm=${encodeURIComponent(mrNumber.trim())}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

// Add new search function
function handleSearch() {
  fetchPatientData();
}
```

**Patch 5: Add result display section**

```typescript
// Add after existing buttons, before Info card
{loading && (
  <div className="flex items-center justify-center py-8">
    <Loader2 className="h-8 w-8 animate-spin text-neon" />
  </div>
)}

{error && (
  <Card className="border-destructive/50 bg-destructive/10">
    <CardContent className="pt-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-destructive">Error</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    </CardContent>
  </Card>
)}

{patientData?.ok && patientData.patient && (
  <div className="space-y-4">
    <PatientInfoCard patient={patientData.patient} />

    <div className="flex gap-3">
      <Button onClick={openSIMRS} variant="outline" size="sm" className="gap-1.5">
        <Activity className="h-4 w-4" />
        Buka SIMRS Live
      </Button>
      <Button onClick={openHemaLab} variant="outline" size="sm" className="gap-1.5">
        <TestTube className="h-4 w-4" />
        Buka Hema Lab
      </Button>
    </div>
  </div>
)}
```

---

## Phase 4: Testing & Deployment

### Step 4.1: Local Testing Checklist

- [ ] Valid MR number returns data
- [ ] Invalid MR shows error
- [ ] Empty input shows validation
- [ ] Network error handled gracefully
- [ ] Cache works (second request faster)
- [ ] Loading state displays correctly
- [ ] Redirect buttons still work

### Step 4.2: Commit & Push

```bash
cd /home/ubuntu/PediaBrain
git add -A
git commit -m "feat: integrate SIMRS API for in-app lab lookup

- Add /api/simrs-proxy route with caching
- Add PatientInfoCard component
- Update Lab Lookup page with data fetching
- Add loading and error states
- Maintain fallback to external links

by Hermes VPS (Kreya)"

git push origin main
```

### Step 4.3: Verify Deployment

```bash
# Wait for Vercel build (~1 min)
vercel ls pedia-brain --limit 1

# Test production
curl "https://pedia-brain.vercel.app/api/simrs-proxy?norm=123456"
```

### Step 4.4: Production Testing

Test with 5 real patient MR numbers:

1. Active inpatient
2. Recently discharged
3. Old outpatient
4. Invalid/non-existent
5. Edge case (very long history)

---

## Rollback Procedure

If critical issues occur:

```bash
cd /home/ubuntu/PediaBrain
git revert HEAD
git push origin main

# Or restore previous working commit
git reset --hard <previous_commit_sha>
git push origin main --force
```

VPS rollback:

```bash
cd /home/ubuntu/hema-repo/sirs-web
cp main.py.backup-<date> main.py
sudo systemctl restart sirs-web
```

---

## Success Criteria

- [ ] API responds in <3 seconds for cached requests
- [ ] API responds in <5 seconds for uncached requests
- [ ] Error rate <5% over 24 hours
- [ ] No authentication failures
- [ ] User feedback positive

---

## Next Steps After Completion

1. Monitor error logs for 48 hours
2. Collect user feedback
3. Plan Phase 2 (lab results integration)
4. Update documentation

---

**Ready to Execute:** All prerequisites met, proceed with Phase 1.
