# Phase 3: Implementation Plan — Multi-RM + Search + Trend Removal

**Related:** `phase3-multi-rm-search-PRD.md`  
**Date:** 2026-09-12 | **Branch:** `feature/lab-lookup-phase3` → PR → main  
**Protocol:** all writes <300 lines, surgical patches only

---

## 0. Audit of Current State (what exists today)

| File                                                | Lines | State                                          | Phase-3 action        |
| --------------------------------------------------- | ----- | ---------------------------------------------- | --------------------- |
| `src/app/lab-lookup/page.tsx`                       | 339   | single-RM, two-phase, trend import             | **heavy refactor**    |
| `src/app/lab-lookup/types.ts`                       | 48    | shared types                                   | extend (PatientState) |
| `src/app/lab-lookup/components/visit-card.tsx`      | 96    | collapsible visit                              | keep + add copy btn   |
| `src/app/lab-lookup/components/special-section.tsx` | 89    | PA/Rad/BMP                                     | keep as-is            |
| `src/components/lab-trend-chart.tsx`                | 142   | Recharts trends                                | **DELETE**            |
| `src/lib/lab-utils.ts`                              | 74    | parseRange, flagValue, extractTrend, lastNDays | trim to 2 fns         |
| `src/app/api/hema-lookup/route.ts`                  | ~150  | quick/full-job/job-status                      | **NO CHANGE**         |
| Hema server (VPS)                                   | —     | parallel fetch + job cache                     | **NO CHANGE**         |

**Key simplification found:** the API layer already supports everything
multi-RM needs. Multi-RM is a **pure frontend concern** (client fan-out),
mirroring how Hema's own lookup.html does it. Zero server risk this phase.

---

## 1. Component Architecture

```
page.tsx (orchestrator, ~200 lines after refactor)
 │  state: queries: PatientState[]  + gen token
 │  parse input → spawn per-RM fetchers (parallel, capped 4)
 │
 ├─ PatientResultCard (NEW ~220 lines) ← the big one
 │    collapsible patient header (name/RM/status/badges/expand)
 │    ParamSearch (NEW ~40 lines, inside card or own file)
 │      mode search → SearchResultsTable (NEW ~70 lines)
 │      mode list  → VisitCard[] (existing, +copy) + Load More
 │                   + SpecialSection (existing)
 │
 └─ (existing) VisitCard, SpecialSection, Badge rows
```

**PatientState (in-memory per RM):**

```typescript
type PatientState = {
  norm: string;
  loading: boolean; // quick in flight
  fullLoading: boolean; // job polling
  data: APIResponse | null; // latest known (quick or full)
  error: string | null; // localized failure
  opened: boolean; // patient card expand
  fullNote?: string;
};
```

**Search state stays LOCAL to PatientResultCard** (useState there), so one
patient's search doesn't touch others — matches FR-4 scoping.

---

## 2. The Generation-Token Problem (multi-RM race, must solve)

Old search pollers must die when a new search starts. Approach:

```typescript
const genRef = useRef(0);          // in page.tsx
async function searchAll(norms) {
  const gen = ++genRef.current;    // this run's id
  setQueries(norms.map(...init...));
  await Promise.all(norms.map(n => runOne(n, gen)));
}
async function runOne(norm, gen) {
  ... await quick ...
  if (genRef.current !== gen) return;   // aborted — bail silently
  ... setState(patchPatient(norm, ...)) ...
  ... start job, poll loop ...
  if (genRef.current !== gen) return;   // checked each poll tick
}
```

All state updates go through a functional `setQueries(prev => ...)` updater
keyed by norm — no stale closures.

**Concurrency cap:** simple queue — run first 4 `runOne()` immediately,
chain remaining via awaited slots (array of promises + index counter).
`quick` endpoint hits SIMRS (6h cache per-NORM server-side still applies),
so cap protects both.

---

## 3. Task Breakdown

### T1 — Remove trend charts (15m) [independent]

- `git rm src/components/lab-trend-chart.tsx`
- page.tsx: delete `dynamic` import block (lines 4, 14-17) + `<LabTrendChart …/>` usage
- lab-utils.ts: delete `extractTrend`, `lastNDays`, `TrendPoint`
  (keep `parseRange`, `flagValue` — VisitCard + search need them)
- Check no other file imports lab-trend-chart:
  `grep -r lab-trend-chart src/` → must be empty

### T2 — Param search utility + types (20m) [independent]

- `types.ts`: add `PatientState`
- `src/lib/lab-utils.ts`: add
  ```typescript
  export type SearchRow = {
    tgl: string;
    name: string;
    hasil: string;
    normal: string;
    satuan: string;
  };
  export function searchParams(visits: LabVisit[], q: string): SearchRow[] {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const rows: SearchRow[] = [];
    for (const v of visits)
      for (const p of v.params)
        if (p.name.toLowerCase().includes(term))
          rows.push({ tgl: v.tgl.slice(0, 16), ...p });
    return rows.sort((a, b) => b.tgl.localeCompare(a.tgl));
  }
  ```
  (pure port of Hema `searchParams` match rule — substring only, no regex)

### T3 — SearchResultsTable + ParamSearch components (40m) [needs T2]

- `components/search-results.tsx`: summary line + 5-col table, ↓/↑ markers
  via flagValue, empty state "❌ Parameter 'x' tidak ditemukan…"
- `components/param-search.tsx`: Input (debounce 250ms via useEffect timer),
  Reset button, holds `search` state + renders table OR children (slot)
  ```tsx
  <ParamSearch visits={visits}>
    {visitsArea} // rendered when search empty
  </ParamSearch>
  ```

### T4 — PatientResultCard (60m) [needs T3]

- Header row: expand chevron, name, RM badge, counts
  ("N sesi · M di luar range"), status badge (⏳ quick / ⏳ full / ✅ / ❌
  - cached), Refetch button (spawns refresh=1 job for this norm),
    error text zone
- Body (when open): ParamSearch → (table | VisitCards+LoadMore+Special)
- All state callbacks passed from page (patchPatient by norm)

### T5 — Page orchestration rewrite (75m) [needs T4]

- Input: parseMultiNorms (new util in lab-utils — port Hema regex,
  - dedupe + cap 10 with warning banner)
- searchAll + gen token + capped-parallel + runOne lifecycle (quick →
  full job → poll, per §2)
- Replace single `data/loading/error/fullNote/showAll` states with
  `queries: PatientState[]`
- Toolbar above results: "N pasien · Expand all / Collapse all"
- Info card: update wording (multi-RM hint in placeholder)
- External links buttons stay (SIMRS Live/Hema use 1st RM of list)

### T6 — Copy per visit (20m) [needs T4 layout stable]

- visit-card.tsx: add 📋 button (header row) → clipboard text:
  ```
  (2026-09-05 00:42)
  HGB : 8.5 g/dL
  PLT : 46
  ```
- Inline "tersalin ✓" 2s toggle (no alert())
- navigator.clipboard with textarea fallback (mobile Safari http case)

### T7 — Build, test matrix, deploy (45m) [needs all]

- `npx tsc --noEmit` **AND** `npm run build` (lesson: tsc alone missed
  Vercel-breaking error)
- Local dev: single RM / 2 RM / 10 RM / invalid mixed / search "hb" /
  expand-collapse / copy / refetch
- Commit → push branch → PR → CI green → merge → production curl checks:
  - `/api/hema-lookup?norm=` ×2 still fine
  - page 200, no `lab-trend-chart` chunk in build manifest
- CHANGELOG.md entry (v0.2.0)

**Estimate: ~4.5h focused work.** Order: T1 → T2 → T3 → T4 → T5 → T6 → T7.
T1 is independent + reduces page.tsx size before the heavy T5 edits.

---

## 4. API Contract (unchanged, documented for the record)

```
GET /api/hema-lookup?norm={n}              → quick {visits≤3, is_partial, special?}
GET /api/hema-lookup?norm={n}&full=1       → {job_id}            (uses 6h cache)
GET /api/hema-lookup?job={id}              → {status: running|done|error, result}
refresh job (bypass cache): route change needed? — see §4.1
```

### 4.1 Refetch (FR: per-patient 🔄) — ONE tiny server addition

Current proxy has no refresh passthrough. Option chosen: extend start-job in
`route.ts` to accept `&refresh=1` → forward to
`/api/lookup-job/start/{norm}?special=1&refresh=1` (Hema side ALREADY
supports it — patched last night). ~6-line surgical patch to route.ts.
Server hema-repo: **no changes needed.**

---

## 5. Risks

| Risk                                           | Mitigation                                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------------------------- |
| 100 RM × SIMRS load = slow tunnel congestion   | cap 100, concurrency 6, 6h cache per NORM makes repeats free                          |
| Poller leak on abandoned searches              | gen token check at every await boundary (§2)                                          |
| page.tsx refactor breaks working Phase-2 flows | branch + PR + CI + test matrix §3/T7; VisitCard/SpecialSection untouched              |
| Search feels broken with only-preview loaded   | summary line says "di N kunjungan" — user sees scope; full upgrade re-renders same UI |
| Clipboard blocked on http/mobile               | textarea+execCommand fallback                                                         |

## 6. Done Criteria

- [ ] No trend chart anywhere (code + build output + UI)
- [ ] "1679157; 1469712" → 2 independent collapsible cards, both upgrade to full
- [ ] Search "hb" in expanded patient → cross-visit flat table w/ counts
- [ ] Failing RM shows ❌ in its card only; others unaffected
- [ ] Refetch one patient → bypasses cache, others keep cached view
- [ ] Copy visit → pastes Hema-format block into WA draft
- [ ] PRD + IMPLEMENTATION docs committed
- [ ] Production verified with curl + live page smoke test

**AWAITING: user approval of this plan + PRD before any code.**
