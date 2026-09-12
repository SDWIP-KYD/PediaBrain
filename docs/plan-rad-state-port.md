# Implementation Plan: Radiologi State Merge → PediaBrain

**Related PRD:** `docs/prd-rad-state-port.md`  
**Date:** 2026-09-13 | **Est:** ±3–3.5 jam | **Branch:** `feature/rad-state-port`  
**Protocol:** chunked writes <300 lines, surgical patches, diff-before-copy deployed files

---

## 0. Ground Truth (hasil investigasi, jangan di-guess ulang)

| Fakta                                           | Nilai                                                                                                                             |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| File runtime yang di-import `hematology_lookup` | **`/home/lenovo/fetch_special_15agustus.py`** (`sys.path.insert(0, '/home/lenovo')` di line 302)                                  |
| Copy di repo                                    | `hema-repo/pipeline/fetch_special_15agustus.py` (235L vs 232L, diff = kredensial env vs hardcoded)                                |
| `/opt/hema/` TIDAK punya file ini               | patch di `/home/lenovo/` langsung (writable `ubuntu`, gak perlu sudo)                                                             |
| Fungsi saat ini                                 | `fetch_rad(s, norm)` — hanya `hasilrad?NORM` → tanpa state                                                                        |
| Sumber logika merge (sudah teruji produksi)     | `_rad_merge` di `/opt/sirs/main.py` lines 801–900                                                                                 |
| Endpoint upstream                               | `layanan/orderrad?KUNJUNGAN=&HISTORY=1` (TANPA NORM), `layanan/orderdetilrad?ORDER_ID=`, `pendaftaran/kunjungan?NORM=&STATUS=1,2` |
| Viewer                                          | `https://rad.kay.web.id/oviyam3/viewer.html?accessionNumber={acc}`                                                                |
| Cache Hema                                      | `/tmp/hema_lookup_cache/{norm}_{special}_{mode}.json`, TTL 6 jam                                                                  |
| PediaBrain consumers `special.rad`              | `special-section.tsx` (Hema shape lama: tanggal/klinis/kesan/hasil) + `lookup.html` Hema (jangan dirusak)                         |

**State machine (dari `_rad_merge`, port verbatim):**

```
STATUS orderrad 0 ────────────────→ "batal"
STATUS orderrad 2 → orderdetilrad:
   REF match hasilrad (2-tingkat) ─→ "read"   (+kesimpulan, +detail)
   ada REF, tanpa hasil ───────────→ "unread" (gambaran basah, ada accession)
   tanpa detil/REF ────────────────→ "menunggu"
STATUS lain ──────────────────────→ skip (YAGNI, sama dgn asli)
hasilrad tanpa order-match ───────→ "read" (anti-regresi rawat jalan/GD)
```

---

## Task BE-1 — `fetch_rad_merged` di jalur Hema (~1.5–2 jam)

### BE-1.1 Tambah function baru (jangan hapus yang lama dulu)

**File target:** `/home/lenovo/fetch_special_15agustus.py` (runtime) DAN
`hema-repo/pipeline/fetch_special_15agustus.py` (repo) — isi function identik.

Append function (bukan replace `fetch_rad`):

1. `_rad_hasil_detail(d)` — helper copy dari `_rad_merge`
2. `fetch_rad_merged(s, norm)`:
   - `hasilrad?NORM&limit=50` → index `by_tm` + `by_ordnum` (2-tingkat join)
   - `pendaftaran/kunjungan?NORM&STATUS=1,2&limit=20` → list Nomor, cap 4
   - loop `orderrad?KUNJUNGAN={k}&HISTORY=1&limit=25` per kunjungan
   - state machine per diagram §0; `orderdetilrad?ORDER_ID` utk status-2
   - anti-regresi loop `by_tm` unmatched
   - sort tgl desc
   - **setiap row juga isi key lama:** `klinis` (=indikasi), `kesan`
     (=kesimpulan), `hasil` (=detail.Hasil) → lookup.html & UI lama tetap jalan
3. Ganti pemanggil: `hematology_lookup.py` line ~302:
   ```python
   special['rad'] = FS.fetch_rad_merged(s, norm) or []
   ```
   (via patch kecil di block ThreadPool `_one` — function lookup by name,
   satu baris)

**Uji curl BE-1 (sebelum FE apa pun):**

```bash
rm -f /tmp/hema_lookup_cache/*.json
curl "localhost:8788/api/lookup/1706242?special=1" | jq '.special.rad
  | {n: length, states: [.[].state] | group_by(.) | map({(.[0]//"null"): length})}'
# expected: states lengkap (read + batal dari multi-kunjungan)
curl "localhost:8788/api/lookup/1679157?special=1" | jq '[.special.rad[].state]'
```

**Pass criteria:** RM 1706242 → ≥5 rad rows, ≥1 batal, semua punya `state` != null,
key lama (`klinis/kesan/hasil`) tetap ada (cek `jq '.special.rad[0]|keys'`).

### BE-1.2 Regresi lookup.html Hema

Buka `hema.ark-kay.my.id/lookup.html?norm=1706242` → card radiologi lama
masih render (dia baca `tanggal/klinis/kesan/hasil` — unaffected).

**Commit hema-repo:** `feat: fetch_rad_merged — port orderrad+hasilrad state merge`  
(pull/rebase sebelum push; push pakai HTTPS token — SSH key gak ada di VPS)

**Purge wajib pasca-deploy BE:** `rm -f /tmp/hema_lookup_cache/*.json`
(lesson §7 PRD: cache lama tanpa `state` bikin fitur "kelihatan" gak jalan)

---

## Task FE-1 — Types PediaBrain (~10 menit)

**File:** `src/app/lab-lookup/types.ts` — patch `SpecialItem`:

```typescript
export type SpecialItem = {
  tanggal?: string;
  klinis?: string;
  kesan?: string;
  kesimpulan?: string;
  hasil?: string;
  jenis?: string;
  // radiologi state merge (port PRD 2026-09-13)
  state?: "read" | "unread" | "menunggu" | "batal";
  accession?: string | null;
  viewer_url?: string | null;
  cito?: boolean;
  nomor_order?: string | null;
  indikasi?: string;
  keterangan?: string;
  detail?: Record<string, string>;
};
```

Route `hema-lookup/route.ts`: **no change** (pass-through + cache-indep).

---

## Task FE-2 — Badge + viewer di SpecialSection (~45 menit)

**File:** `src/app/lab-lookup/components/special-section.tsx` (186L → ±240L,
surgical patches):

1. `STATE_UI` map:

```typescript
const STATE_UI = {
  read: { label: "terbaca", cls: "border-green-500/40 text-green-300" },
  unread: {
    label: "gambaran basah",
    cls: "border-amber-500/40 text-amber-300",
  },
  menunggu: { label: "menunggu", cls: "border-gray-500/40 text-gray-300" },
  batal: { label: "batal", cls: "border-red-500/40 text-red-300 line-through" },
} as const;
```

2. Di `ModuleBlock` item row: kalau `item.state` ada → render badge + (cito ?
   "🔥 CITO") + baris "Indikasi: …" kalau `unread/menunggu`;
3. Link `🖼️ Buka Gambar` → `item.viewer_url` (target \_blank rel noopener)
   tampil kalau viewer_url && state ∈ {read, unread}
4. `textOf()` fallback chain tidak berubah → lama tetap normal

**Kompilasi & type-guard:** state di-type union literal (FE-1), switch UI dari
map — `unknown` state = tanpa badge (defensif).

---

## Task FE-3 (menunggu keputusan §11 PRD) — badge ringkasan header

`patient-result-card.tsx`: `Rad: {n} 🟡{belumDibaca}` di header (useMemo atas
`data.special.rad`). **Default: kerjakan** (15 menit) kecuali lu skip.

---

## Task INT-1 — Integrasi build & deploy PediaBrain (~45 menit)

```bash
cd /home/ubuntu/PediaBrain
git checkout -b feature/rad-state-port   # dari main yang udah di-pull
# ... patches FE-1/2/3 ...
npx tsc --noEmit && npm run build        # DUA-DUANYA (lesson Vercel)
git add -A && git commit                 # husky eslint jalan
git push --set-upstream https://$(gh auth token)@github.com/SDWIP-KYD/PediaBrain.git feature/rad-state-port
gh pr create ... && gh pr checks         # tunggu hijau
gh pr merge --squash --delete-branch
sleep 80 && vercel ls pedia-brain --limit 1   # ● Ready
```

**Verifikasi production:**

```bash
curl -s "https://pedia-brain.vercel.app/api/hema-lookup?norm=1706242" \
  | jq '[.special.rad[]?.state] // "quick-no-special"'
# quick TIDAK kirim special (max=3 visits only) → cek jalur full:
J=$(curl -s ".../api/hema-lookup?norm=1706242&full=1" | jq -r .job_id)
sleep 15; curl -s ".../api/hema-lookup?job=$J" \
  | jq '[.result.special.rad[] | {t: .tanggal, s: .state, v: (.viewer_url!=null)}]'
```

---

## Test Matrix (jalankan berurutan, catat hasil)

| #   | Check                   | Perintah/aksi                           | Pass bila                           |
| --- | ----------------------- | --------------------------------------- | ----------------------------------- |
| 1   | BE curl read+batal      | `1706242` special=1                     | ≥5 rows, state read&batal ada       |
| 2   | BE curl basah (unread)  | RM dari kasus sesi (1041752)            | ≥1 `unread` + viewer_url            |
| 3   | Backward keys           | jq keys row[0]                          | klinis/kesan/hasil tetap ada        |
| 4   | lookup.html gak rusak   | buka di browser Hema                    | render normal                       |
| 5   | Cache purge efektif     | curl RM uji ke-2                        | cached:true + state tetap ada       |
| 6   | FE badges               | /lab-lookup RM 1706242 → expand Special | badge terbaca/batal muncul          |
| 7   | FE viewer link          | klik "Buka Gambar" (baca=2)             | tab rad.kay.web.id ke-acc benar     |
| 8   | FE-3 header (jika ON)   | RM dengan unread                        | badge ringkas nampilin 🟡n          |
| 9   | Regresi PediaBrain lama | RM 1679157 (rad all-read)               | tampil terbaca semua, gak ada error |
| 10  | Cold-latency            | stopwatch full fetch 1679157            | < 60s (budget polling 3m aman)      |

## Rollback

- FE: `gh pr revert` / revert commit → auto-redeploy
- BE: restore `/home/lenovo/fetch_special_15agustus.py.bak-{ts}` (backup
  sebelum patch) + `hematology_lookup.py` satu baris pemanggil → purge cache →
  restart hema — PediaBrain otomatis balik ke shape lama (field baru di-ignore)

## File Change Summary

| File                                                           | Aksi                       | Perkiraan       |
| -------------------------------------------------------------- | -------------------------- | --------------- |
| `/home/lenovo/fetch_special_15agustus.py`                      | append ~110L (function)    | runtime         |
| `hema-repo/pipeline/fetch_special_15agustus.py`                | sama (repo)                | +1 commit       |
| `hema-repo/server/hematology_lookup.py`                        | 1 baris (switch caller)    | ± sama patch    |
| `/opt/hema/hematology_lookup.py`                               | sync 1 baris (diff-first!) | restart service |
| `types.ts` / `special-section.tsx` / `patient-result-card.tsx` | patches FE                 | 1 PR            |

**STATUS: READY — tunggu keputusan §11 PRD (FE-3 on/off, purge scope, cap 4)
lalu eksekusi.**
