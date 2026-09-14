# SIRS (sirs.kay.web.id) — Deep Analysis & Flaws

**Date:** 2026-09-13
**Scope:** `/opt/sirs/main.py` (1996 lines), `/opt/hema/` (VPS proxy)
**Goal:** Understand architecture, test endpoints, identify flaws

---

## 1. Architecture Overview

```
Browser (dokter)
  │ HTTPS
  ▼
SIRS Web (FastAPI, port 8099, /opt/sirs/main.py)
  │ PHPSESSID cookie (server-side SESSIONS dict)
  │ per-DPJP session (login ke SIMRS backend)
  ▼
SIMRS Backend (port 8080, PHP)
  │ /webservice/general/pasien/{norm}
  │ /webservice/medicalrecord/cppt
  │ /webservice/pendaftaran/kunjungan
  │ /webservice/layanan/tindakanmedis
  │ ... etc
  ▼
Hospital DB (PostgreSQL/MySQL)
```

### Key Components:

- **SIRS (`/opt/sirs/main.py`):** FastAPI web UI + API proxy. 1996 lines.
- **Accounts (`accounts.json`):** DPJP credentials (login + password), 0600 perms.
- **SESSIONS dict:** In-memory session store, 8h TTL, no persistence.
- **SIMRS Backend:** The actual hospital system at `localhost:8080`.

### Auth Flow:

1. POST `/api/login` with `{mode: "select", account_index: N}` or `{mode: "manual", login, password}`
2. `simrs_login()` → POST to `SIMRS_BASE/authentication/login` with `{LOGIN, PASSWORD, CAPTCHA: "x"}`
3. Server stores `requests.Session` (with PHPSESSID cookie) in `SESSIONS[sid]`
4. Browser gets `sid` cookie (HttpOnly, 8h)
5. Every API call → `get_simrs(request)` → retrieves session from SESSIONS

---

## 2. CPPT Endpoint Analysis

**Endpoint:** `GET /api/cppt?norm={norm}` or `GET /api/cppt?kunjungan={id}`

**Code path:**

```python
elif norm:
    r = sess.get(f"{BASE}/webservice/medicalrecord/cppt",
                  params={"HISTORY": 1, "NORM": norm, "limit": 3000,
                          "sort": json.dumps({"property": "TANGGAL", "direction": "DESC"})}, timeout=30)
    rows = r.json().get("data", []) if r.json().get("success") else []
```

**Response format:**

```json
{
  "ok": true,
  "total": N,
  "cppt": [
    {
      "tanggal": "2026-09-13 08:30:00",
      "kunjungan": "NICU",
      "penulis": "dr. X (Sp.A)",
      "subjektif": "...",
      "objektif": "...",
      "assesment": "...",
      "terapi": "...",
      "planning": "..."
    }
  ]
}
```

**Access control:** Relies on SIMRS backend — the logged-in DPJP's session determines which patients they can see. SIRS itself does NOT filter by DPJP.

---

## 3. Flaws & Issues Found

### CRITICAL

| #   | Flaw                                     | Impact                                                                                                               | Location        |
| --- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------- |
| 1   | **Plaintext passwords in accounts.json** | All DPJP passwords stored in plaintext (`sirs123`, `12345`, etc). File is 0600 but still readable by root/VPS admin. | `accounts.json` |
| 2   | **No rate limiting**                     | `/api/cppt`, `/api/lab/*`, etc. have no rate limiting. A buggy client or script can overwhelm SIMRS backend.         | All endpoints   |
| 3   | **SESSIONS dict lost on restart**        | All logged-in users get logged out when SIRS restarts. No session persistence.                                       | `SESSIONS = {}` |

### HIGH

| #   | Flaw                                    | Impact                                                                                                              | Location                  |
| --- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 4   | **strip_html is fragile**               | Regex-based HTML stripping can break on nested tags, produces inconsistent output (e.g., "mmHgNormal" split logic). | `strip_html()` ~30 lines  |
| 5   | **Lab search 113+ keywords × parallel** | `/api/lab/index` fires 113+ parallel requests to SIMRS with different keywords. Can overwhelm backend under load.   | `LAB_KEYWORDS` list       |
| 6   | **No CSRF protection**                  | State-changing endpoints (`/api/login`, `/api/switch`) don't validate CSRF tokens.                                  | `api_login`, `api_switch` |
| 7   | **DEBUG_LOG grows unbounded**           | Global list appends on every error, never cleared. Memory leak over time.                                           | `DEBUG_LOG = []`          |

### MEDIUM

| #   | Flaw                                           | Impact                                                                                                                                 | Location          |
| --- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 8   | **\_cache eviction is TTL-only**               | `_cache` grows until TTL expires. No LRU/size limit. Under heavy use with many NORMs, memory grows.                                    | `_cache = {}`     |
| 9   | **CPPT doesn't validate DPJP ownership**       | If SIMRS backend returns data for any NORM, SIRS will display it. No server-side check that the patient belongs to the logged-in DPJP. | `api_cppt`        |
| 10  | **accounts.json has hardcoded weak passwords** | `sirs123`, `12345` — easily guessable. No password policy.                                                                             | `accounts.json`   |
| 11  | **api_lab_special is 200+ lines**              | Massive function with sequential + parallel chains. Hard to debug, maintain, or optimize.                                              | `api_lab_special` |
| 12  | **No structured logging**                      | Uses `DEBUG_LOG` list + `print()`. No log levels, no rotation, no external aggregation.                                                | Global            |

### LOW

| #   | Flaw                                                   | Impact                                                                              | Location          |
| --- | ------------------------------------------------------ | ----------------------------------------------------------------------------------- | ----------------- |
| 13  | **Hardcoded CAPTCHA: "x"**                             | SIMRS accepts `"x"` as captcha — this is a SIMRS-side issue, but SIRS relies on it. | `simrs_login()`   |
| 14  | **No request ID / tracing**                            | Hard to debug which request caused an error across the proxy chain.                 | All endpoints     |
| 15  | **ThreadPoolExecutor max_workers=6 for patient fetch** | Could be tuned higher for large patient lists.                                      | `api_ranap_aktif` |

---

## 4. Integration Points for PediaBrain

### Current (Lab Lookup):

```
PediaBrain → hema.ark-kay.my.id/api/lookup/{norm} → SIMRS (service account)
```

### Proposed (CPPT):

```
PediaBrain → /api/cppt/{norm} (Vercel) → hema.ark-kay.my.id/api/cppt/{norm} → SIMRS (per-DPJP)
```

**Problem:** Hema VPS uses a service account (`SIMRS_LOGIN` env), which won't have per-DPJP CPPT access.

**Solution options:**

1. **Hema VPS adds CPPT endpoint** that accepts per-DPJP credentials (complex — needs multi-user support)
2. **PediaBrain calls SIRS directly** — but SIRS requires login session (not stateless API)
3. **SIRS exposes a token-based endpoint** for external services (new development)
4. **PediaBrain uses the existing lab-lookup pattern** but CPPT data goes into `patientVisits` table in Neon, populated by a background sync job

**Simplest path:** Option 4 — PediaBrain creates a background job (or manual sync) that pulls CPPT via Hema VPS using a single DPJP credential, caches it in Neon DB. Not real-time, but works without multi-user auth complexity.

---

## 5. Recommendations

### For SIRS (if you control it):

1. Hash passwords in `accounts.json` (bcrypt)
2. Add rate limiting (slowapi or similar)
3. Persist SESSIONS to disk/Redis
4. Replace `strip_html` with a proper HTML parser (BeautifulSoup)
5. Add CSRF tokens to state-changing endpoints
6. Add structured logging (Python `logging` module)

### For PediaBrain CPPT integration:

1. **Start with Hema VPS endpoint** using service account — test if it can access CPPT for all patients
2. **If not**, use a single DPJP credential for sync (store in Vercel env)
3. **Cache in Neon DB** (`patientVisits` table already exists) — not real-time but reliable
4. **Add manual "Sync CPPT" button** in patient detail page
5. **Never store DPJP passwords in browser** — use server-side env only

---

## 6. Testing Notes

- CPPT endpoint: `GET /api/cppt?norm=1679157` — returns "Not authenticated" without session
- Demografi endpoint: doesn't exist in SIRS (404)
- All endpoints require `sid` cookie from `/api/login`
- Cannot test locally without going through full login flow (browser required)
