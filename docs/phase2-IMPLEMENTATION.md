# Phase 2: Implementation Plan - Full Lab Integration

**Project:** PediaBrain Lab Lookup Enhancement  
**Date:** 2026-09-11  
**Status:** Ready for Approval  
**Related:** `phase2-lab-integration-PRD.md`  
**Protocol:** All file ops <300 lines (chunked write compliant)

---

## Architecture Decision Summary

**Key insight dari Phase 1:** Hema API (`hema.ark-kay.my.id`) sudah punya SEMUA data yang dibutuhkan:

- `/api/lookup/{norm}?special=1&quick=1&max=3` → quick preview (3 visits)
- `/api/lookup/{norm}?special=1` → FULL data (semua visits + special modules)
- `/api/lookup-job/start/{norm}` → background job untuk fetch lambat
- `/api/lookup-job/status/{id}` → poll progress

**Strategi:** Two-phase loading (sama seperti lookup.html asli):

1. Quick fetch dulu (tampil <3 detik)
2. Full fetch di background (lengkap <30 detik)

---

## Task 1: Upgrade API Proxy Route

**File:** `src/app/api/hema-lookup/route.ts` (98 lines → ~150 lines)  
**Changes:** Surgical patches, bukan rewrite

### 1.1 Tambah parameter `full` dan `job`

```typescript
// Request: GET /api/hema-lookup?norm=1679157&full=1
// Response: semua visits + special modules

// Request: GET /api/hema-lookup?job={jobId}
// Response: status background job
```

### 1.2 Tambah job proxy endpoints

```typescript
// Full fetch pakai job system (hindari timeout 10s):
// 1. POST-like: start job → /api/hema-lookup?norm=X&full=1
//    → panggil /api/lookup-job/start/{norm}
//    → return { job_id }
// 2. GET: /api/hema-lookup?job={id}
//    → panggil /api/lookup-job/status/{id}
//    → return result kalau done
```

### 1.3 Update types untuk special modules

```typescript
type SpecialResult = {
  pa?: { tgl: string; jenis: string; kesimpulan: string }[];
  rad?: { tgl: string; jenis: string; kesan: string }[];
  bmp?: { tgl: string; hasil: string; kesimpulan: string }[];
  lcs?: { tgl: string; params: LabParam[] }[];
};

type HemaAPIResponse = {
  success: boolean;
  norm?: string;
  name?: string;
  visits?: LabVisit[];
  special?: SpecialResult; // NEW
  error?: string;
  cached?: boolean;
};
```

**Verification:**

```bash
curl "localhost:3000/api/hema-lookup?norm=1679157&full=1"
curl "localhost:3000/api/hema-lookup?job=<jobId>"
```

---

## Task 2: Abnormal Value Detection Utility

**File:** `src/lib/lab-utils.ts` (NEW, ~120 lines)

### 2.1 Reference range parser

```typescript
// Input:  normal="4.00 - 10.0", hasil="15.70"
// Output: { status: 'high' | 'low' | 'critical' | 'normal' | 'unknown' }

export function parseRange(normal: string): { min?: number; max?: number } {
  // Handle: "4.00 - 10.0", "12.0 - 16.0 ", "(L <10, P <20 )", "-"
  // Return null-safe result
}

export function evaluateParam(
  name: string,
  hasil: string,
  normal: string,
): ParamStatus {
  // 1. Parse hasil jadi number (kalau gagal → 'unknown')
  // 2. Parse range
  // 3. Bandingkan → low / normal / high
  // 4. Cek critical thresholds (pediatric)
}
```

### 2.2 Pediatric critical thresholds

```typescript
const CRITICAL: Record<string, { low?: number; high?: number }> = {
  HGB: { low: 7.0 }, // severe anemia → transfusi
  PLT: { low: 50 }, // bleeding risk
  WBC: { low: 1.0, high: 30.0 }, // neutropenia / leukocytosis
  K: { low: 2.5, high: 6.5 }, // arrhythmia risk
  NA: { low: 120, high: 160 }, // seizure risk
  CA: { low: 1.9 },
  GLUKOSA: { low: 2.2 }, // hypoglycemia neonatal
};
```

**Catatan klinis:** Threshold ini dari standar umum pediatri. **Lu yang approve final numbers** — ini bukan pengganti judgment lu.

### 2.3 Trend extraction

```typescript
export function extractTrend(
  visits: LabVisit[],
  paramName: string,
): { date: string; value: number }[] {
  // Chronological (oldest → newest)
  // Skip non-numeric
  // Merge duplicate dates (avg)
}
```

**Tests:** Unit test manual via dev console dulu (no test framework di repo).

---

## Task 3: LabTrendChart Component

**File:** `src/components/lab-trend-chart.tsx` (NEW, ~180 lines)

### 3.1 Spec

- Library: **Recharts** (sudah ada di dependencies, no install baru)
- Charts default: **HGB, PLT, WBC** (3 chart kecil grid 1 kolom, mobile-friendly)
- Data: dari `extractTrend()` utility
- Reference range: shaded area (ReferenceArea component)
- Tooltip: tanggal + nilai + flag
- Empty state: <2 data points → "Data belum cukup untuk trend"

### 3.2 Structure

```tsx
export function LabTrendChart({ visits }: { visits: LabVisit[] }) {
  const hgb = extractTrend(visits, 'HGB');
  const plt = extractTrend(visits, 'PLT');
  const wbc = extractTrend(visits, 'WBC');

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <TrendCard title="Hemoglobin" unit="g/dL" data={hgb} ref={{min:12,max:16}} critical={7} />
      <TrendCard title="Trombosit" unit="/uL" data={plt} ... />
      <TrendCard title="Leukosit" unit="/uL" data={wbc} ... />
    </div>
  );
}
```

**Dynamic import:** `next/dynamic` dengan `ssr: false` (charts client-only, kurangi bundle).

---

## Task 4: Enhanced Visit Cards + Highlighting

**File:** `src/app/lab-lookup/page.tsx` (291 lines → refactor ke components)

### 4.1 Extract components (biar file kecil semua)

```
src/app/lab-lookup/components/
├── visit-card.tsx        (~120 lines) - collapsible per visit
├── param-row.tsx         (~60 lines)  - 1 baris lab + highlight logic
└── special-section.tsx   (~100 lines) - PA/Rad/BMP/LCS display
```

### 4.2 VisitCard behavior

- Default: 3 visit terbaru expanded, sisanya collapsed
- Header: tanggal + badge jumlah nilai abnormal (misal "⚠️ 4 abnormal")
- Table rows pakai `evaluateParam()` → warna + icon
- "Load More" button kalau visits >10

### 4.3 ParamRow styling

```typescript
const styles = {
  critical: "bg-red-500/10 text-red-400 font-bold", // ⚠️ prefix
  high: "bg-orange-500/10 text-orange-300", // ↑ suffix
  low: "bg-blue-500/10 text-blue-300", // ↓ suffix
  normal: "text-foreground",
  unknown: "text-muted-foreground",
};
```

### 4.4 SpecialSection

- Tabs: PA | Radiologi | BMP | LCS (hanya tab yang ada datanya)
- Format: tanggal → jenis pemeriksaan → KESIMPULAN (bold, preserve whitespace)
- Collapsible per item

---

## Task 5: Two-Phase Loading UX (Frontend)

**File:** `src/app/lab-lookup/page.tsx` (surgical patches)

### 5.1 Flow

```
User input NORM + Enter
  ↓
[PHASE 1] fetch /api/hema-lookup?norm=X (quick, 3 visits)
  → render: patient header + trend charts + visit cards (3)
  → status: "Menampilkan 3 kunjungan terakhir..."
  ↓
[PHASE 2] fetch /api/hema-lookup?norm=X&full=1 → dapat job_id
  → poll /api/hema-lookup?job={id} tiap 2 detik (max 60s)
  → saat done: replace visits dengan FULL data + special modules
  → status: "✅ Lengkap: N kunjungan + penunjang khusus"
```

### 5.2 State additions

```typescript
const [fullLoading, setFullLoading] = useState(false);
const [fullError, setFullError] = useState("");
// quick data = `data`, full data merge ke `data` saat job done
```

### 5.3 Fallback

- Job gagal/timeout → tetap tampilkan quick data + tombol "Coba lagi"
- External links (SIMRS Live / Hema Lab) selalu tersedia sebagai escape hatch

---

## Task 6: Integration & Deploy

### 6.1 Local verification

```bash
cd /home/ubuntu/PediaBrain
npx tsc --noEmit          # zero errors (WAJIB - lesson Phase 1)
npm run build             # clean build
PORT=3001 npm run dev     # manual test NORM 1679157
```

**Test matrix:**
| Case | NORM | Expected |
|------|------|----------|
| Ada lab rutin | 1679157 | visits + trend charts |
| Ada special (PA/BMP) | (lu kasih 1 contoh) | special section muncul |
| Tidak ada data | 999999999 | error message rapi |
| Input invalid | "abc" | validation, no API call |

### 6.2 Deploy (chunked, safe)

```bash
git add -A && git commit -m "feat: phase2 full lab integration..."
git push https://$(gh auth token)@github.com/SDWIP-KYD/PediaBrain.git main
# JANGAN langsung --prod; tunggu auto-deploy, cek status:
vercel ls pedia-brain --limit 1
# Kalau Ready → test production endpoint
curl -s "https://pedia-brain.vercel.app/api/hema-lookup?norm=1679157" | jq '.success'
```

**Lesson Phase 1:** build error lolos ke Vercel karena `tsc --noEmit` lokal pakai config beda.
**Fix:** jalankan `npm run build` FULL sebelum commit, bukan cuma tsc.

---

## Execution Order & Estimates

| #   | Task                                  | Files     | Est. | Depends |
| --- | ------------------------------------- | --------- | ---- | ------- |
| 1   | API proxy upgrade (full + job)        | route.ts  | 30m  | -       |
| 2   | lab-utils (parser, thresholds, trend) | NEW lib   | 45m  | -       |
| 3   | LabTrendChart component               | NEW comp  | 60m  | 2       |
| 4   | VisitCard + ParamRow + SpecialSection | NEW comps | 60m  | 2       |
| 5   | Page integration (two-phase loading)  | page.tsx  | 45m  | 1,3,4   |
| 6   | Build test + deploy + verify          | -         | 30m  | 5       |

**Total: ~4.5 jam kerja**

---

## Chunked Write Protocol (compliance)

- Semua file baru: <250 lines per write
- page.tsx (291 lines): HANYA surgical patches, no rewrite
- route.ts: surgical patches
- Commit per task (6 commits kecil, gampang rollback)

---

## Multi-Agent Note (AGENTS.md)

File yang disentuh Phase 2 sebagian besar wilayah **OpenCode** (`src/app/**`, `src/components/**`).
Sesuai Golden Rules: coordinate dulu (Telegram) atau pakai branch `feature/lab-lookup-phase2`.
**Quyết định:** lu yang putuskan — langsung main (cepat, solo session) atau branch (aman buat agent lain).

---

**END OF IMPLEMENTATION PLAN**
