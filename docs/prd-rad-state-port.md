# PRD: Radiologi State Merge untuk PediaBrain (Port SIMRS Web)

**Project:** PediaBrain Lab Lookup — Radiologi lengkap (basah/batal/menunggu)  
**Date:** 2026-09-13  
**Author:** Kreya (Hermes VPS)  
**Status:** DRAFT — menunggu approval  
**Related:** sesi Telegram `20260912_144731_88b4287a` (implementasi asli di SIMRS Web), `har-api-integration` skill

---

## 1. Ringkasan Eksekutif

Sesi "mission control" kemarin mengimplementasikan **merge orderrad + hasilrad**
di SIMRS Web (`sirs.kay.web.id`) dengan hasil: setiap baris radiologi kini punya
state — `read` / `unread` (gambaran basah) / `menunggu` / `batal` — plus tombol
buka viewer PACS (Oviyam), termasuk order dari kunjungan LAIN milik pasien yang
sama (kasus fix: RM 1706242 dibuka dari IGD, order NICU tetap muncul).

**Gap PediaBrain:** jalur datanya beda. PediaBrain ← Hema
(`fetch_special_15agustus.fetch_rad`) ← **hanya `hasilrad`**. Konsekuensi:

| Skenario klinis                                | SIMRS Web (baru)               | PediaBrain (sekarang)   |
| ---------------------------------------------- | ------------------------------ | ----------------------- |
| Rontgen sudah dibaca radiolog                  | ✅ tampil + state read         | ✅ tampil (tanpa state) |
| Order dibuat, gambar di PACS, **belum dibaca** | ✅ **gambaran basah** (unread) | ❌ **HILANG**           |
| Order **dibatalkan**                           | ✅ tampil badge batal          | ❌ HILANG               |
| Order dibuat, belum dikerjakan                 | ✅ menunggu                    | ❌ HILANG               |
| Order di kunjungan lain (IGD vs NICU)          | ✅ ke-scan (multi-kunjungan)   | ❌ ikut hilang          |

**Use case nyata:** lu lagi rounding → buka PediaBrain di HP → mau tahu
"thorax si X yang subuh tadi udah dibaca belum?" → hari ini jawabannya
"nggak ada data", padahal gambar sudah di PACS.

**Solusi:** port logika merge ke jalur Hema (satu function), PediaBrain UI
cuma perlu render badge + link viewer. Bukan fitur baru — **sinkronisasi
kompetensi** supaya dua sistem yang sama-sama lu pakai tidak beda "kebutaan".

---

## 2. User Stories

**S-1 (utama):** Sebagai residen yang lagi dinas, saya ingin melihat status
radiologi pasien (belum dibaca / sudah / batal) langsung dari PediaBrain
tanpa buka sirs.kay.web.id, supaya satu aplikasi cukup di RS.

**S-2:** Sebagai dokter yang tracking hasil cito, saya ingin order yang
gambarannya sudah ada di PACS tapi belum ada kesan, ditandai jelas (basah) —
bukan diam-diam tidak tampil, karena "tidak ada data" ≠ "belum dibaca".

**S-3:** Saya ingin bisa langsung klik buka gambar PACS (viewer Oviyam) dari
baris radiologi di PediaBrain untuk baca sendiri gambaran basahnya.

---

## 3. Arsitektur — Di Mana Perubahan Terjadi

```
Browser/HP
  └─ PediaBrain (Vercel)
       ├─ page /lab-lookup  …………………… [FE-2] render state badge + tombol viewer
       ├─ /api/hema-lookup  ………………… [FE-1] type extension (pass-through, no logic)
       └────────────── HTTPS ──────────────
  Hema (VPS :8788, hematology_lookup.py)
       └─ fetch_rad() → GANTI dengan port
         fetch_rad_merged() ………………… [BE-1] inti perubahan
         (login SIMRS pakai service account yang sudah ada)
             └──── HTTP tunnel ────
  SIMRS RSWS (:8080 via FRP)
       layanan/hasilrad?NORM            (sudah dipakai)
       layanan/orderrad?KUNJUNGAN       (BARAT di jalur ini — port dari _rad_merge)
       layanan/orderdetilrad?ORDER_ID   (BARAT)
       pendaftaran/kunjungan?NORM       (BARAT — resolve semua kunjungan)
```

**Prinsip port (dari implementasi asli, jangan "improve" seenaknya):**

1. `orderrad` TIDAK bisa per-NORM (keterbatasan upstream) → resolve daftar
   kunjungan via `pendaftaran/kunjungan?NORM=&STATUS=1,2` dulu, scan maks **4
   kunjungan terbaru**, selected-first
2. Join order↔hasil 2 tingkat: exact `detil.REF == hasil.TINDAKAN_MEDIS`,
   fallback `hasil.TM.REF.KUNJUNGAN == order.NOMOR` (aksesion bisa beda —
   terbukti di kasus thorax 11/09)
3. Anti-regresi: interpretasi tanpa order-match tetap dirender (rawat jalan/GD)
4. Status dikenal: 0 = batal, 2 = selesai→(detil menentukan read/unread);
   status lain skip (YAGNI — sama seperti asli)
5. Sort tanggal desc
6. Viewer: `https://rad.kay.web.id/oviyam3/viewer.html?accessionNumber={acc}`

**Kenapa di Hema, bukan bikin route PediaBrain → SIMRS Web langsung:**

- Jalur PediaBrain→SIMRS Web butuh switch akun per-DPJP (login-gated cookies) —
  berat dan rapuh; Hema sudah punya service account + cache 6 jam + background
  job yang teruji semalam
- Satu sumber kebenaran: lookup.html Hema DAN PediaBrain dapat data yang sama
- Reuse penuh pipeline two-phase (quick + full) yang sudah jalan

---

## 4. Spesifikasi Kebutuhan Fungsional

### BE-1 — `fetch_rad_merged(s, norm)` di jalur Hema

**Lokasi:** `hema-repo/server/fetch_special_15agustus.py` (function baru) +
switch pemanggil di `hematology_lookup.py`.

- Input: session SIMRS, NORM. Output: list dict radiologi (bentuk baru):

```json
{
  "tanggal": "2026-09-11",
  "jenis": "Radiologi",
  "jaringan": "Radiografi Thorax 1 Proyeksi",
  "kesimpulan": "- Cor: CTR 0.55 ...",
  "detail": { "Indikasi": "...", "Hasil": "...", "Kesan": "..." },
  "nomor_order": "000123456",
  "indikasi": "...",
  "keterangan": "",
  "cito": true,
  "state": "read|unread|menunggu|batal",
  "accession": "202611090001",
  "viewer_url": "https://rad.kay.web.id/oviyam3/viewer.html?accessionNumber=..."
}
```

- **Backward compatible:** field lama (`tanggal, klinis, kesan, hasil`) TETAP
  diisi — lookup.html Hema yang lama gak boleh rusak
- Sumber state: port verbatim `_rad_merge` SIMRS Web (session 88b4287a)
- Cache: otomatis ikut mekanik `use_cache` Hema (file per NORM, 6 jam) —
  hasil lama tanpa field `state` = stale-by-TTL, bukan bug (pelajaran sesi itu:
  purge cache pasca-deploy, lihat §7)

### FE-1 — Type pass-through PediaBrain

`src/app/lab-lookup/types.ts`: `SpecialItem` += `state?, accession?,
viewer_url?, cito?, nomor_order?`. Route proxy: no logic change (sudah
pass-through JSON).

### FE-2 — Render di SpecialSection

`src/app/lab-lookup/components/special-section.tsx`:

- Badge state per baris radiologi:
  `read` → hijau "✅ terbaca" · `unread` → amber "🟡 gambaran basah" ·
  `menunggu` → abu "⏳ menunggu" · `batal` → merah-line-through "✖ batal"
- Baris `unread`/`menunggu`: tampilkan "Cheker: …" (indikasi) + `cito` badge
  "🔥 CITO" kalau true
- Link **"🖼️ Buka Gambar"** (target \_blank, rel noopener) → `viewer_url`
  (tampil untuk read & unread; accession tersedia)
- Modul lain (PA/BMP/dst) gak berubah — kalau `state` undefined, render lama

### FE-3 — Ringkasan di header pasien (opsional, murah)

Badge agregat kecil di `PatientResultCard`: "Rad: 4 🟡2" (4 item, 2 belum
dibaca) — sinyal cepat sebelum expand. **Tandai bisa di-skip kalau lu mau
paling kecil.**

---

## 5. Performa & Beban SIMRS

Hema sekarang: 1 panggilan per pasien untuk rad (`hasilrad`). Setelah port:
+1 `kunjungan` resolve + maks 4× `orderrad` + 1 `orderdetilrad` per order
status-2 (biasanya ≤3 per pasien). Worst case ≈ **+8 panggilan SIMRS/pasien**.

**Mitigasi (semua sudah terbukti dipakai SIMRS Web / semalam):**

- Cold fetch jalan di **background job** (frontend gak nunggu — dua fase
  sudah live) → latency user-visible ≈ nol
- Cache 6 jam per NORM di Hema → panggilan ulang = 0
- Cap 4 kunjungan + limit 25 order = bounded, identik dengan SIMRS Web yang
  sudah produksi
- Estimasi cold full fetch naik ~3–6 detik dari baseline 40s pasien terbesar
  (RM 1679157) — acceptable, masih di bawah budget polling 3 menit

## 6. Security & Privasi

- Tidak ada kredensial baru (service account Hema existing, env file)
- URL viewer PACS mengandung accessionNumber — sama persis dengan yang sudah
  dipakai SIMRS Web ke user browser; akses viewer tetap login rad.kay.web.id
- PHI tidak menambah permukaan baru: data radiologi memang sudah mengalir di
  jalur yang sama (hasilrad), hanya bertambah field status

## 7. Kesalahan yang Harus Diulang (lesson learned sesi 88b4287a)

1. **Stale cache = fitur "gak jalan".** Implementasi asli sudah deploy tapi
   pasien lama serve dari disk cache pra-deploy tanpa field `state` → tombol
   gak muncul. **Wajib: purge cache rad/Hema pasca-deploy** (list di §Impl-6)
2. **Asumsi param upstream salah = data hilang senyap.** orderrad tidak
   support NORM — sudah dibuktikan di sesi itu; port pakai pola resolve
   kunjungan, jangan "coba-coba NORM param"
3. **Verifikasi pakai kasus konkret**, bukan happy-path: RM 1706242 (multi-
   kunjungan IGD/NICU) + satu pasien batal + satu pasien belum-adakeRad

## 8. Testing Matrix

| #   | Skenario                  | Data uji                              | Expected                                     |
| --- | ------------------------- | ------------------------------------- | -------------------------------------------- |
| 1   | Rad terbaca normal        | RM yang ada hasilrad                  | state=read + kesan + link viewer             |
| 2   | **Gambaran basah**        | RM dengan order status2 tanpa kesan   | state=unread, badge 🟡, link viewer ada      |
| 3   | Batal                     | dari kasus sesi: norm dengan batal    | state=batal, tetap tampil                    |
| 4   | Multi-kunjungan           | RM 1706242                            | order NICU muncul saat di-query via NORM     |
| 5   | Rawat jalan tanpa order   | hasilrad tanpa orderrad-match         | tetap tampil (anti-regresi)                  |
| 6   | Backward Hema lookup.html | buka hema.ark-kay.my.id lookup RM uji | render lama gak rusak                        |
| 7   | PediaBrain full flow      | /lab-lookup RM uji                    | badge state muncul di Special                |
| 8   | Cache warm                | RM uji ke-2 kali                      | <1s, state tetap benar                       |
| 9   | Fallback                  | SIMRS down/slow                       | error terisolasi, quick preview tetap render |

## 9. Rollout

1. BE di VPS: patch repo `hema-repo` → sync `/opt/hema` (diff-first, file
   deployed bisa drift) → purge cache → restart `hema.service` → test curl
2. FE di PediaBrain: branch → tsc+build → PR → CI → squash merge → verify
   production
3. Verifikasi akhir: lu sendiri buka 1 pasien basah dari HP (user acceptance)
4. Rollback: revert function + purge cache (data balik ke bentuk lama, field
   baru di-ignore UI lama)

## 10. Out of Scope

- Tombol "tandai sudah dibaca" (tidak ada API upstream-nya)
- Push notif "hasil rad sudah keluar" (kandidat fase berikutnya)
- Port state merge ke modul PA/BMP/LCS (upstream-nya sudah NORM-based)
- Viewer embedded di PediaBrain (iframe PACS = kompleksitas SSO; link-tab cukup)
- Autocomplete/daftar pasien per DPJP (sudah kita putuskan: belum perlu)

## 11. Keputusan yang Dibutuhkan dari Lu

- [ ] FE-3 (badge ringkasan "Rad: 4 🟡2" di header pasien): **eksekusi / skip?**
- [ ] Purge cache Hema seluruhnya saat deploy (disarankan — bersih, konsekuensi
      cold-fetch lagi semua pasien) vs cuma RM uji
- [ ] Cap kunjungan scan tetap 4 (sama dengan SIMRS Web) atau 6 buat PediaBrain
      (pasien lama dengan banyak episode IGD)? **Saran: tetap 4, konsisten.**

## 12. Estimasi

| Task                                     | Waktu          |
| ---------------------------------------- | -------------- |
| BE: fetch_rad_merged + wiring + uji curl | 1.5–2 jam      |
| FE: types + special-section badges + uji | 1 jam          |
| Deploy + purge + verifikasi matrix       | 45 menit       |
| **Total**                                | **±3–3.5 jam** |

---

**DRAFT — tunggu approval §11 sebelum eksekusi.**
