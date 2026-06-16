# PediaBrain Deep Audit — 2026-06-16

> Update dari GitHub: ✅ `origin/main` up to date, `npm install` 817 packages clean.
> Build check: ✅ `tsc --noEmit` bersih (0 error).
> Production check: ✅ Vercel API called — lihat data real di bawah.

---

## 📋 P1 — CRITICAL (Fix ASAP)

### 1.1 ✅ AI Env Vars — SEJARAH (Dicek via Vercel API)

**Update dari production:** Ternyata semua 3 SET env var ADA di Vercel:

| Set | Key di Vercel | Status |
|-----|--------------|--------|
| Set 1 | `TIANYUAI_API_KEY` + `TIANYUAI_BASE_URL` (`https://tianyuai.lol/v1`) | ✅ Ada |
| Set 2 | `AI_API_KEY` + `AI_BASE_URL` (`https://api.minimax.io/v1`) | ✅ Ada |
| Set 3 | `AI_API_URL` (`https://api.minimax.io/v1`) | ✅ Ada |
| Model | `AI_MODEL = MiniMax-M3` | ✅ Ada |

**Route chat & lab-extract → PAKAI TIANYUAI_*, yang ADA di Vercel → OK!**
**Route vision-extract → PAKAI AI_API_URL, yang ADA di Vercel → OK!**

→ **Item ini diturunkan ke P3** (mubazir tapi jalan). Fix nanti bersamaan refactor AI routing.

---

### 1.2 SSE Handling Hilang di 2 Routes (MASIH BERLAKU)

Routes `/api/ai/chat` dan `/api/ai/lab-extract` pakai `stream: false` dan `res.json()` langsung. Sementara 9router backend return `text/event-stream`.

Routes `/api/ai/soap` dan `/api/ai/kanban-parse` sudah punya helper `callAI()` yang handle SSE — tinggal copy pattern itu.

**Impact:** chat & lab extract bisa return 503 atau garbage kalau backend pake streaming.

**Files affected:**
- `src/app/api/ai/chat/route.ts` — line 28: `stream: false`
- `src/app/api/lab-extract/route.ts` — line 66: `stream: false`

---

### 1.3 Model Names — AMAN (Update dari Vercel)

| Route | Model Terpakai | Catatan |
|-------|----------------|---------|
| `/api/ai/chat` | `gpt-5.4-mini` (hardcoded) | Ke `https://tianyuai.lol/v1` — 9router maps alias ✅ |
| `/api/lab-extract` | `gpt-5.4-mini` (hardcoded) | Ke `https://tianyuai.lol/v1` — 9router maps alias ✅ |
| `/api/ai/soap` | `MiniMax-M3` (dari AI_MODEL env) | Ke `https://api.minimax.io/v1` — model real ✅ |
| `/api/ai/kanban-parse` | `MiniMax-M3` (dari AI_MODEL env) | Ke `https://api.minimax.io/v1` — model real ✅ |
| `/api/vision-extract` | `MiniMax-M3` (dari AI_MODEL env) | Ke `https://api.minimax.io/v1` — model real ✅ |

**Semua model names cocok dengan backend masing-masing.** Item ini diturunkan ke P3 — mau dirapihin boleh (standarisasi ke env var aja), tapi gak urgent.

---

### 1.5 🔴 Vercel: API Keys Diset Sebagai "plain" (BARU)

**2 API keys** terlihat di response Vercel API sebagai `type: "plain"` (bukan `"sensitive"`):

```
TIANYUAI_API_KEY → "type": "plain"  ← OPEN!
AI_API_KEY      → "type": "plain"  ← OPEN!
```

Artinya: kalau ada org lain yang bisa akses Vercel dashboard team ini, mereka bisa lihat API keys. Perbaiki jadi `type: "sensitive"` via Vercel UI atau CLI.

**Fix:** `vercel env rm TIANYUAI_API_KEY production` lalu `vercel env add TIANYUAI_API_KEY production --sensitive`

**File:** `src/components/note-popup.tsx` (line 109-122)

```tsx
export function useNoteFromUrl(notes: NoteRow[]) {
  const params = useSearchParams();
  const openId = params.get("open");
  const [note, setNote] = useState<NoteRow | null>(null);
  useEffect(() => {
    if (openId) {
      const found = notes.find((n) => n.id === openId);
      setNote(found ?? null);
    } else {
      setNote(null);
    }
  }, [openId, notes]);  // ← DEPENDENCY PADA notes ARRAY
  return note;
}
```

**Root Cause:** `useEffect` depends on `notes` array reference. Kalau parent komponen belum selesai fetch, `notes.find()` return undefined → user lihat dialog kosong → klik kedua baru muncul.

**Fix:**
- Option A: Jangan depend pada `notes` array — fetch note by ID langsung di hook
- Option B: Tambah loading state, jangan render dialog sampe notes ready

---

## 📋 P2 — HIGH PRIORITY

### 2.1 58 Unused Exports (knip)

**Pattern dominan:**
- **Type interfaces** diexport tapi dipakai internal: `CalculatorDef` (neonatologi, picu), `DrugCalcDef`, `GrowthDataset`, `LMSRecord`, `DivisionSection`
- **UI components** diexport dari barrel files: `CardAction`, `CardDescription`, `CardFooter`, `DialogOverlay`, `DialogPortal`, `DialogTrigger`, `SelectGroup`, `SelectLabel`, `TableCaption`, `TableFooter`
- **Functions** yang mungkin dead code: `saveStickyNote`, `updateStickyNote`, `admitPatient`, `generateSecret` (hanya dipakai internal?)
- **Data** yang mungkin duplikat: `headCircForAgeBoys`, `headCircForAgeGirls`

**Saran:** Cek manual fungsi-fungsi berikut:
- `saveStickyNote`, `updateStickyNote` — apakah masih dipakai atau duplicate dari `createOrUpdateSticky`?
- `generateSecret` — utility untuk generate SESSION_SECRET, bukan untuk runtime
- `admitPatient` — apakah ada UI yang panggil ini?
- Semua `CalculatorDef` interfaces — apakah memang perlu re-export?

---

### 2.2 Loading & Error States Coverage Gaps

**Hanya 2 route groups yang punya loading/error:** `follow-ups/` dan `notes/`.

**Routes 100% MISSING loading.tsx + error.tsx:**
- `src/app/pasien/` + `src/app/pasien/[id]/` + `src/app/pasien/kanban/` + `src/app/pasien/list/`
- `src/app/ai-toolbox/`
- `src/app/soap/`
- `src/app/jadwal-dpjp/`
- `src/app/tools/` dan semua sub-routes (neonatologi, nephro, picu, sepsis, gizi, dll)
- `src/app/login/`

**Impact:** Kalau query database gagal di page server, user bisa liat white screen atau error mentah. Page perlu error boundaries.

---

### 2.3 Any Types (19 occurrences)

Tersebar di 10 file. Yang paling kritis:
- `src/app/actions.ts` line 653, 811: `updateData as any` di Drizzle — rawan runtime error kalau field name typo
- `src/app/pasien/kanban/patient-kanban.tsx` line 734: `useState<any[] | null>` — parsed patients tanpa type safety
- `src/app/api/micromedex/`: 5 file pakai `catch (e: any)` — kehilangan type info
- `src/app/ai-toolbox/laporan-tool.tsx`: type `Data` mixed dengan `Record<string, string | null>` dan `any[]`

**Fix:** Ganti dengan proper types atau `unknown` + narrowing.

---

### 2.4 UX: Global Search XSS Risk

**File:** `src/app/tools/catatan-klinis/catatan-klinis-client.tsx` line 181-182

```tsx
dangerouslySetInnerHTML={{ __html: highlightText(r.title, terms) }}
dangerouslySetInnerHTML={{ __html: highlightText(r.body.slice(0, 140) + "…", terms) }}
```

`highlightText` wrapping dengan `<mark>` tag. Kalau input user mengandung HTML injection, ini bisa jadi XSS vector. Meskipun content dari database (low risk), perlu sanitasi.

---

## 📋 P3 — MEDIUM PRIORITY

### 3.1 Security: Auth & Session

✅ **Already good:**
- Constant-time password comparison (`src/lib/auth.ts` line 85-92)
- HMAC-SHA256 session signature
- HttpOnly + SameSite=Lax cookies
- 30-minute sliding window refresh

⚠️ **Dashboard leaks SESSION_SECRET check:**
`src/app/page.tsx` line 32: `process.env.SESSION_SECRET` dipanggil di server component — ini aman (server-only), tapi kalau isLoggedIn() dipindah ke client component, secret bisa bocor.

### 3.2 Dependencies

**6 vulnerabilities:**
| Package | Severity | Issue | Fix |
|---------|----------|-------|-----|
| esbuild (via drizzle-kit) | 🔴 HIGH | Dev server RCE | `npm audit fix --force` (breaking) |
| esbuild (via drizzle-kit) | 🔴 HIGH | Missing binary integrity | Tunggu patch drizzle-kit |
| postcss (via next) | 🟡 MODERATE | XSS via unescaped CSS | Update next (16.3+) |

**Taze check:** blocked by auto-mode, tapi deps kelihatan reasonable untuk proyek Next.js 16.

### 3.3 DB: Connection Pool

`src/lib/db.ts` pakai `pg.Pool` dengan default config — tidak ada idle timeout, max connections, atau retry logic. Untuk Neon (serverless) mungkin wasteful:

```ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,           // ← tidak ada
  idleTimeoutMillis: 30000,  // ← tidak ada
});
```

### 3.4 Multi-Agent Rules (AGENTS.md)

File `AGENTS.md` ada — mendefinisikan 3 agent (OpenCode, Hermes Laptop, Hermes HP) dengan file ownership. Tapi beberapa aturan udah outdated:
- Masih referensi "Next.js 15" padahal di package.json Next.js 16.2.7
- File ownership `src/lib/db/schema.ts` disebut di Hermes HP, tapi juga bakal dipake OpenCode
- Branch strategy belum diterapkan (semua push langsung ke main)

### 3.5 Missing Tests

Tidak ada test files sama sekali (0 test files, tidak ada jest/vitest di devDeps).

---

## 📋 RECAP — PRIORITY ORDER (Setelah Cek Production)

| # | Item | Dim | Status di Prod | Effort |
|---|------|-----|---------------|--------|
| 🔴 P1 | Fix SSE handling di chat & lab-extract | AI | ⚠️ Masih broken | ~30 menit |
| 🔴 P1 | Fix `useNoteFromUrl` double-click bug | UX | ⚠️ Masih broken | ~20 menit |
| 🔴 P1 | API Keys jadi "sensitive" di Vercel | Security | ⚠️ Dua keys "plain" | ~5 menit |
| 🟡 P2 | Loading & error states coverage | UX | ❌ 12 routes missing | ~1 jam |
| 🟡 P2 | `any` types cleanup (19 occurrences) | Code | ⚠️ Tersebar | ~2 jam |
| 🟡 P2 | Sanitasi dangerouslySetInnerHTML | Security | ⚠️ Ada 2 lokasi | ~15 menit |
| 🟡 P3 | Standardisasi AI env vars (3→1) | AI | ✅ Jalan semua | ~30 menit |
| 🟡 P3 | Rapihin model names pake env var | AI | ✅ Jalan semua | ~15 menit |
| 🟡 P3 | 58 unused exports cleanup | Code | ⚠️ Mubazir | ~1 jam |
| 🟡 P3 | DB pool config | DB | ⚠️ Defaut saja | ~5 menit |
| 🟡 P3 | Update AGENTS.md (Next.js 16) | Docs | ⚠️ Outdated | ~5 menit |

---

*Audit completed 2026-06-16 by Claude Code — code review + file audit mode*
