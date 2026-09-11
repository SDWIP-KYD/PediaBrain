# Lab Lookup Integration - SIMPLE REALISTIC PLAN

**Reality Check:** API sudah jalan di VPS, tinggal expose ke PediaBrain.

---

## Actual Working System

### Hema Lab Server (Port 8788)

- Running: `/opt/hema/venv/bin/python /opt/hema/hemato_notes_server.py`
- Frontend: `http://localhost:8788/lookup.html`
- API Endpoints (SUDAH JALAN):
  ```
  GET /api/lookup/{norm}?special=1&quick=1&max=3
  GET /api/lookup-job/start/{norm}?special=1
  GET /api/lookup-job/status/{job_id}
  ```

### Backend Logic

- File: `/home/ubuntu/hema-repo/server/hematology_lookup.py`
- Function: `lookup(norm, include_special, quick, use_cache)`
- Direct call ke SIMRS: `http://localhost:8080/webservice`

### SIMRS Web (Port 8099)

- Running: `/opt/sirs/venv/bin/python -m uvicorn main:app --port 8099`
- FastAPI server
- Session-based auth

---

## REVISED Simple Plan

### Option A: Proxy via Caddy (EASIEST) ⭐

**Idea:** Expose Hema API via subdomain dengan Caddy reverse proxy + token header.

**Steps:**

1. Add Caddy config untuk `hema-api.kay.web.id`
2. Reverse proxy ke `localhost:8788/api/lookup`
3. Add header validation untuk token
4. PediaBrain call `https://hema-api.kay.web.id/api/lookup/{norm}?token=xxx`

**Pros:**

- No code changes di server
- Caddy handle SSL automatically
- Easy rollback

**Cons:**

- Need DNS setup (5 min)
- Token di URL (tapi HTTPS encrypted)

---

### Option B: Add Auth Wrapper (MEDIUM)

**Idea:** Tambah middleware di `hemato_notes_server.py` untuk validate token.

**Steps:**

1. Add token check di `do_GET` untuk `/api/lookup`
2. Token from header atau query param
3. Deploy & restart service

**Pros:**

- More control
- Token in header (cleaner)

**Cons:**

- Need restart production service
- Code modification

---

### Option C: Keep Redirect (NO WORK)

**Idea:** Gak usah integrate, user tetap redirect ke tab baru.

**Pros:**

- Zero work
- Zero risk

**Cons:**

- User experience sama seperti sekarang

---

## Recommendation: Start with Option A

### Step 1: Test Existing API (2 min)

```bash
# Test with valid NORM (butuh contoh dari lu)
curl "http://localhost:8788/api/lookup/VALID_NORM?special=1&quick=1"
```

### Step 2: Add Caddy Config (5 min)

```bash
sudo nano /etc/caddy/Caddyfile
```

Add:

```
hema-api.kay.web.id {
    @authorized {
        header Authorization "Bearer SECRET_TOKEN_HERE"
    }

    handle @authorized {
        reverse_proxy localhost:8788
    }

    handle {
        respond "Unauthorized" 401
    }
}
```

Reload:

```bash
sudo systemctl reload caddy
```

### Step 3: PediaBrain API Proxy (10 min)

**File:** `src/app/api/hema-lookup/route.ts`

```typescript
export async function GET(req: NextRequest) {
  const norm = req.nextUrl.searchParams.get("norm");
  if (!norm)
    return NextResponse.json({ error: "NORM required" }, { status: 400 });

  const res = await fetch(
    `https://hema-api.kay.web.id/api/lookup/${norm}?special=1&quick=1`,
    {
      headers: {
        Authorization: `Bearer ${process.env.HEMA_API_TOKEN}`,
      },
    },
  );

  return NextResponse.json(await res.json());
}
```

### Step 4: Update Frontend (15 min)

Update Lab Lookup page untuk fetch dari `/api/hema-lookup?norm=xxx`

---

## Total Time: 30-45 minutes

Compare dengan planning lama: 6-8 hours. This is MUCH simpler.

---

## Questions for You

1. **Lu punya valid NORM untuk testing?** (kasih 2-3 contoh)
2. **DNS access?** (untuk setup hema-api.kay.web.id)
3. **Prefer Option A (Caddy) atau B (code wrapper)?**

Jawab dulu, baru gua execute.
