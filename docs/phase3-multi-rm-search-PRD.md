# Phase 3: Multi-RM Search + Lab Result Search — PRD

**Project:** PediaBrain Lab Lookup v3  
**Date:** 2026-09-12  
**Author:** Kreya (Hermes Agent)  
**Status:** Planning — awaiting approval  
**Version:** 3.0

---

## 1. Scope Changes from Phase 2

| Change    | Detail                                                         |
| --------- | -------------------------------------------------------------- |
| ❌ REMOVE | Trend charts (HGB/PLT/WBC graph cards) — deleted entirely      |
| ✨ NEW    | Multi-RM lookup: input many NORMs at once                      |
| ✨ NEW    | Full collapsible hierarchy: Patient → Visit → Params           |
| ✨ NEW    | Search within lab results (parameter search across all visits) |

**Rationale:** trend visualization didn't earn its screen space for the
actual workflow (rounds + konsul prep); breadth (many patients at once)
and findability (locate one parameter fast) do.

---

## 2. Reference Behavior Studied (Hema lookup.html — source of truth)

Inspected `/home/ubuntu/hema-repo/server/lookup.html` (909 lines). Key mechanics we mirror:

### 2.1 Multi-RM parsing (line 301-315)

```javascript
// Split by ; , / newline or whitespace — keep pure digits only
var norms = input
  .split(/[;,/\n\s]+/)
  .map(trim)
  .filter((s) => /^\d+$/.test(s));
norms.forEach(lookupOne); // every RM fetched INDEPENDENTLY & in parallel
```

- 1 RM → single card; N RM → N cards, each with own lifecycle
- No server-side "multi" endpoint exists — pure client fan-out

### 2.2 Per-patient lifecycle (lookupOne, line 318+)

- Quick preview (3 visits, ~1s) → card renders immediately
- If `is_partial` → background job → poll → card upgrades to full data
- Per-RM autosave in localStorage → instant re-render + silent refresh
  (PediaBrain: we skip localStorage, we have server 6h cache instead)

### 2.3 Parameter search (searchParams, line 478+)

- Input per patient: "🔍 Cari parameter… contoh: ureum, albumin, RET, hb"
- **Cross-visit scan**: matches param NAME (substring, case-insensitive)
  across ALL that patient's visits
- Result = flat table (Tanggal | Parameter | Hasil | Normal | Satuan),
  sorted newest-first, replacing the visit list while search is active
- Summary line: "N hasil untuk 'q' di M kunjungan"
- Reset button returns to normal visit view
- Hema colors criticals red/abnormal orange — **we do NOT replicate
  critical alerting** (Phase 2 decision: only ↓/↑ markers, reference
  values always shown; clinical judgment stays with the physician)

### 2.4 Copy per visit (copyVisit, line 545+)

- One click copies a visit as plain text block:
  `(2026-09-05 00:42)\nHGB : 8.5\nPLT : 46 ...` — used to paste into WA/konsul

**Hierarchy in Hema:** patient card (collapsible) → per-visit tabs → tables.
We flatten the tabs into stacked collapsible cards (Phase 2 VisitCard, kept).

---

## 3. Target UX — PediaBrain v3

```
┌ Input: NORM (bisa multi: "1679157; 1469712, 917718" atau paste per baris) ┐
│ [🔍 Cari Data Lab]                                                        │
├───────────────────────────────────────────────────────────────────────────┤
│ ▾ ISMAHUL JANNAH · RM 1679157 · 43 sesi · ⚠ 12 di luar range · 🔄 Refetch │
│   [🔍 Cari parameter… ureum, albumin, RET, hb]  [✖ Reset]                 │
│   ── mode search aktif: ──                                                │
│   🔎 8 hasil untuk "hb" di 43 kunjungan                                   │
│   2026-09-05 | HGB  | 8.5 ↓ | 12.0-16.0 |                                │
│   2026-09-01 | HGB  | 9.1 ↓ | 12.0-16.0 |                                │
│   …                                                                       │
│   ── mode normal: ──                                                      │
│   ▾ 2026-09-05 14:16 · 3 param · [📋 copy]                                │
│     Parameter | Hasil | Nilai Normal                                      │
│   ▸ 2026-09-05 00:42 · 21 param · ⚠4 di luar range · [📋 copy]            │
│   ▸ 2026-08-28 …                                                          │
│   ▾ Hasil Penunjang Khusus (rad ×3)                                       │
├───────────────────────────────────────────────────────────────────────────┤
│ ▸ AHMAD RIANTO · RM 1469712 · ⏳ memuat data lengkap...                   │
│ ▸ RM 999999 — ❌ tidak ditemukan                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### Hierarchy rules

1. **Patient card**: collapsed/expanded. Default: first patient open, rest
   collapsed (compact list of headers). Header always shows status:
   `⏳ preview 3 kunjungan` → `✅ 43 kunjungan` or `❌ error`
2. **Visit cards** (inside patient): reuse Phase 2 VisitCard. Default:
   latest 3 open, rest collapsed. Load More at 20 visits.
3. **Param search** (per patient, mirrors Hema): live filter, cross-visit,
   flat newest-first table. Visits with zero matches hidden while searching.
   Match count badge in patient header. Clear search → restore visit view.
4. **Special section**: unchanged (collapsible modules).
5. **Per-patient Refetch button**: `?refresh=1` job (bypass 6h cache).
6. **Copy visit** button: plain text block for konsul/WA paste.

---

## 4. Functional Requirements

### FR-1 Multi-RM input

- Parse: split `/[;,/\n\r\s]+/`, keep `^\d{3,8}$`, dedupe preserving order
- Cap: **max 100 NORMs** per query. Over cap →
  warn + take first 100
- Enter key triggers search
- Input stays visible during/after search (edit → new search)

### FR-2 Parallel independent fetching

- Each NORM runs existing lifecycle in parallel:
  quick (`/api/hema-lookup?norm=`) → if `is_partial` → job start → poll
- Concurrency cap: **4 in-flight SIMRS-hitting requests** (quick endpoint
  hits SIMRS directly; full jobs are server-cached already). Queue extras.
- One RM's failure NEVER blocks others (error state localized to its card)
- Polling: per-RM, 2s interval, 3-min cap per RM (same as Phase 2)
- Cancel: starting a new search abandons outstanding pollers of old search
  (guard via generation token — see Implementation §5)

### FR-3 Patient-level collapsible

- Header: name, RM, visit count, out-of-range count badge, status badge
- All-headers list keeps multi-RM scannable; expanded shows content
- "Expand all / Collapse all" control in results toolbar

### FR-4 Parameter search

- Per-patient input (placeholder with examples, like Hema)
- Match rule: `param.name.toLowerCase().includes(query)` (substring,
  case-insensitive, no regex)
- Scope: that patient's ALL visits (quick preview → searches 3; full →
  all 43). Works with whatever data is loaded; count hint shows which.
- Debounce 250ms
- Results: flat table newest-first (Tanggal | Parameter | Hasil | Normal |
  Satuan) + ↓/↑ markers; summary "N hasil"; Reset restores
- Empty result: "❌ Parameter 'x' tidak ditemukan di M kunjungan"

### FR-5 Trend removal

- Delete `src/components/lab-trend-chart.tsx`
- Remove its dynamic import + usage from page
- Remove `extractTrend`/`lastNDays` from `lab-utils.ts` (keep
  `parseRange`/`flagValue`)
- `recharts` npm dep stays (used by growth charts elsewhere)

### FR-6 Copy visit (small win, same refactor)

- Button per visit card → clipboard:
  `(tgl)\nNAME : hasil unit\n...` (Hema copyVisit format exactly)
- Toast/inline "✅ tersalin" feedback (no alert() spam)

---

## 5. Non-Requirements (explicitly out)

- Multi-RM cross-patient search (one query scanning all patients) —
  v3.1 candidate, not now
- localStorage autosave (server cache covers it)
- Server-side batch endpoint (client fan-out is sufficient & keeps
  per-RM cache semantics)
- Critical alerting (Phase 2 decision stands)
- PDF/export, share links

---
