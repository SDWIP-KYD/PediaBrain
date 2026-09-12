# HANDOVER → commandcode — PediaBrain "My Patients" Rework

**Date:** 2026-09-13 | **From:** Kreya (Hermes VPS) | **To:** commandcode (dev lanjutan)
**Repo:** https://github.com/SDWIP-KYD/PediaBrain (branch `main` auto-deploy Vercel)
**Status:** SEMUA pekerjaan Fase 1–3 + Radiologi state SUDAH LIVE di production.
Dokumen ini = context lengkap + rencana rework yang belum dieksekusi.

---

## 1. Apa yang Baru Saja Dibangun (baca sebelum sentuh apa pun)

### Timeline commit (semua merged & production-ready)

```
1f8cd16  feat: Lab Lookup standalone page, remove AI Toolbox
d57c2ce  feat: Phase 2 — two-phase loading, collapsible visits, special modules (#1)
8c0e7b4  fix: polling window 3 min
09a9395  feat: Phase 3 — multi-RM (cap 100), param search, TREND CHARTS DIHAPUS (#2)
3e25d29  perf: proxy timeout 10s→25s
4c4f725  feat: auto-retry 2x + maxDuration=60
427135c  feat: radiologi state badges (port sirs-web _rad_merge) (#3)
f1ef44e  chore: sidebar & dashboard declutter (lihat §1.3)
```

### 1.1 Fitur intinya: `/lab-lookup`

Input satu/banyak nomor RM (pisah `;` koma spasi/enter, cap 100) → hasilnya
per pasien dalam **kartu collapsible** (Patient → Visit → Params):

- Two-phase: quick preview 3 kunjungan (<3s, termasuk data radiologi) →
  riwayat LENGKUP menyusul via background job Hema (poll 2s, cap 3 menit)
- Pencarian parameter per pasien, lintas semua kunjungan ("hb" → tabel flat)
- Copy kunjungan format konsul, tombol Refetch (bypass cache 6h),
  Expand/Collapse all
- Radiologi badge: ✅ terbaca · 🟡 gambaran basah · ⏳ menunggu · ✖ batal
  - 🔥 CITO + link "🖼️ Buka Gambar" → PACS Oviyam

### 1.2 Arsitektur data (WAJIB PAHAM)

```
Browser ─ /lab-lookup (client, state PatientState[] per NORM,
          genRef token buat abort pencarian lama, CONCURRENCY=6 queue)
   │ fetch /api/hema-lookup?norm=|&full=1|&job=|&refresh=1
   ▼
Next.js route src/app/api/hema-lookup/route.ts  (proxy, in-memory cache 5m)
   │ HTTPS + retry 2×20s (timeout/5xx/429/network only; 4xx langsung)
   ▼
Hema VPS  hema.ark-kay.my.id → Caddy → localhost:8788
   hemato_notes_server.py (ThreadingHTTPServer) — JANGAN balik ke HTTPServer
   hematology_lookup.py: fetch_lab_quick_fast / fetch_lab_data
      (page paralel, TiAP worker session sendiri — SIMRS me-serialise per
       cookie PHP, satu session dipakai bareng = antre)
      + disk cache /tmp/hema_lookup_cache/{norm}_{special}_{mode}.json, TTL 6 jam
      + background job /api/lookup-job/start|status (full fetch ~40s cold)
   ▼  (service account SIMRS_LOGIN di /opt/hema/hema.env, BUKAN hardcoded lagi)
SIMRS RSWS via FRP tunnel localhost:8080/webservice
```

### 1.3 Yang BARU dihapus (jangan "restore" tanpa tanya user)

- **AI Toolbox** — total (page, sidebar, navbar, shortcut)
- **Trend chart** — lab-trend-chart.tsx + extractTrend/lastNDays (user request;
  pengganti fungsionalnya = param search lintas kunjungan)
- **Sidebar shortcut**: Lab Browser, Tambah Pasien, Jadwal DPJP (route-nya
  masih hidup: /lab /pasien /jadwal-dpjp → 200)
- **Widget Jadwal DPJP dari dashboard** (`DashboardJadwalDPJP` dihapus dari
  page.tsx; file component-nya MASIH ADA src/components/dashboard-jadwal-dpjp.tsx
  — belum dihapus fisik, tunggu keputusan)

---

## 2. ATURAN MAIN (langgar = deploy mati / data salah)

1. **Sebelum kerja:** `git pull origin main` (multi-agent — aturan AGENTS.md).
   Setelah kerja: branch → PR → `gh pr checks` hijau → squash merge.
2. **Sebelum push WAJIB:** `npx tsc --noEmit` **DAN** `npm run build`.
   Pelajaran nyata: error `catch(error: unknown){error.name}` lolos tsc lokal,
   MATIKAN build Vercel 2 deploy berturut-turut.
3. **Chunked write protocol:** satu operasi tulis file maks <300 baris.
   Edit = surgical patch, JANGAN rewrite file utuh. Tulis >350 baris = timeout.
4. **Deployed files DRIFT dari repo:**
   - `/opt/hema/*.py` = runtime Hema (punya fix `_clean_path` dll)
   - `hematology_lookup.py` runtime meng-IMPORT `/home/lenovo/fetch_special_15agustus.py`
     (`sys.path.insert(0,'/home/lenovo')`) — file root-owned, patch via sudo tee,
     backup ke /opt/hema/backups/ DULU
   - Repo twin: `hema-repo/pipeline/fetch_special_15agustus.py`
   - **Selalu diff deployed vs repo sebelum copy; jangan timpa membabi buta**
5. **Setelah ubah logika fetch:** `rm -f /tmp/hema_lookup_cache/*.json`
   - `sudo systemctl restart hema.service`. Cache lama tanpa field baru =
     fitur "kelihatan gak jalan" (kejadian nyata di sesi 88b4287a).
6. **NO critical-value alerting.** Keputusan user 2×: hanya tampilkan nilai
   normal + penanda ↓/↑. Interpretasi klinis = wewenang dokter. Jangan "improve".
7. **Auth PediaBrain:** single password (lihat env deploy Vercel), session
   cookie 30m — JANGAN login ke-apply ke Hema API (public by design, MVP).
8. **Vercel:** project `sdwip-s-projects/pedia-brain`, cek `vercel ls
pedia-brain --limit 1` → ● Ready, lalu verify endpoint production via curl
   SEBELUM klaim selesai.
9. **git push dari VPS pakai:** `git push https://$(gh auth token)@github.com/SDWIP-KYD/<repo>.git main`
   (SSH key GitHub tidak ada di VPS). hema-repo remote-nya `SDWIP-KYD/ark`.

---

## 3. DATA & SKEMA SAAT INI

- **DB Neon: KOSONG** (`/api/stats` → total 0, sejak reset akhir Juni; sync
  manual via script per-tanggal udah ditinggal). → **tidak ada risiko migrasi,
  tapi semua halaman lama berbasis DB (kanban/list/detail) praktis mati suri.**
- `src/lib/db/schema.ts`: `patients` (medicalRecordNo varchar(50) NULLABLE,
  name NOT NULL, birthDate, sex, room/bed, dpjp, status default rawat_inap...),
  `patientVisits` (SOAP + antropometri, FK cascade), `patientLabResults`,
  `patientMedications`, `notes`, `followUps`, `stickyNotes`.
- Server actions `src/app/actions.ts` (use server, drizzle): `createPatient`
  (273), `updatePatient`, `deletePatient`, `createVisit`, `bulkSyncPatients`
  (544), `movePatientToRoom`, `dischargePatient`, `createPatientWithVisit` (842)…
  **Action CRUD masih bisa dipakai — bukan target penghapusan.**
- Data klinis yang SELAMAT = live dari SIMRS via jalur §1.2 (lab, rad, PA, BMP).

---

## 4. REWORK YANG DIMINTA USER (belum dieksekusi — ini tugasmu)

### 4.1 Vision user (bahasa user: "rombak total")

Workflow masa depan PediaBrain = **SIMRS-first, bottom-up**:

```
1. Buka /lab-lookup → ketik NORM → hasil lab + rad tampil (SUDAH JADI ✅)
2. Di kartu hasil itu ada tombol [＋ Tambah ke Pasien Saya] / "Add to my patients"
3. Klik → pasien tsb masuk DB Neon jadi "My Patient" (snapshot demografi +
   RM + tanggal masuk akal), BUKAN entri manual kayak sistem lama
4. Tab Pasien (§pasien) dirombak total, berpusat di "My Patients":
   - daftar = pasien yang LU TAMPILIN sendiri dari lookup (bukan sensus manual)
   - kartu/detail pasien = gabungan data lokal + LIVE SIMRS (lab/rad/PA/BMP
     tetap real-time, bukan salinan basi)
   - layer lokal yang memang milik PediaBrain: catatan pribadi, follow-up,
     SOAP buatan user, lab hasil vision-extract (lab-extract API sudah ada)
```

Inti filosofi: **data RS jangan pernah disalin-into-DB untuk hal yang bisa
di-fetch live; DB cuma buat yang bikin nilainya (user's own notes/curated list).**

### 4.2 Yang harus dibuat (urutan disarankan)

**Tahap A — "Add to my patients" dari lookup (1–2 jam)**

1. `src/app/api/patients/from-norm/route.ts` (POST):
   body `{norm}` → ambil demografi → upsert `patients`:
   - `medicalRecordNo = norm` (bikin UNIQUE partial index di Neon:
     `ALTER TABLE patients ADD CONSTRAINT patients_mr_unique UNIQUE (medical_record_no)` —
     NULL aman karena PostgreSQL mengizinkan banyak NULL di UNIQUE)
   - name/sex/birthDate/phone ← dari demografi (lihat T4 bawah)
   - `notes` kosong, `status` = 'rawat_inap' (default) — biarkan user edit
2. Frontend `PatientResultCard.tsx`: tombol `＋ Tambah ke Pasien` di header
   (dekat Refetch). State per kartu: `added | adding | error`. Setelah sukses →
   tombol jadi `✓ Di My Patients` + link `/pasien/[id]`.
3. Deteksi "sudah pernah ditambah": response quick lookup perlu flag.
   CARA PALING MURAH: endpoint baru `GET /api/patients/exists?norms=a,b,c`
   → `select medical_record_no from patients where medical_record_no in (...)`.
   Panggil sekali per pencarian (batch) di `searchAll` page.tsx.

**Tahap B — Halaman "My Patients" baru (2–3 jam)** 4. `src/app/pasien/page.tsx` dirombak: bukan kanban sensus lagi, tapi list
`patients` dari DB (semua punya medicalRecordNo) — nama, RM, umur,
badge statistik lokal (n catatan, n lab extract). Hapus/sembunyikan dulu:
drag-drop antar ruangan, view /pasien/list, filter DPJP (data kosong).
→ Tab lama: simpan sebagai `/pasien/kanban` (route terpisah, udah ada!)
jadi user masih bisa akses kalau kangen. Halaman utama = My Patients. 5. Sidebar: tambah lagi shortcut "My Patients" → `/pasien`
(lu baru hapus "Tambah Pasien" yang ke halaman dialog; yang ini beda).

**Tahap C — Detail pasien hybrid (3–4 jam)** 6. `src/app/pasien/[id]/page.tsx`: header demografi (DB) + **bagian
"Data RS Live" = komponen hasil lookup (reuse PatientResultCard!)** yang
fetch on-mount pakai `medicalRecordNo`. Jadi lab/rad selalu fresh,
zero-sync. 7. Bagian lokal di detail: My Notes, My SOAP (patientVisits existing),
lab-extract results existing — tidak berubah skema. 8. Tombol "Segarkan dari SIMRS" di demografi = re-fetch T4 → update
birthDate/sex/phone/room kalau berubah.

**Tahap D — Bersih-bersih (setelah A–C stabil)** 9. Hapus fisik widget/file tak terpakai: `dashboard-jadwal-dpjp.tsx`
(putuskan bersama user dulu — route /jadwal-dpjp-nya masih hidup),
dialog CreatePatientDialogWrapper "Tambah Pasien" manual (atau repurpose
jadi form isian manual untuk kasus pasien tanpa RM SIMRS — tanya user). 10. script sync-pasien-\*.ts: arsipkan (legacy).

### 4.3 Sumber demografi pasien (T4) — BELUM TERSEDIA, bikin dulu

`/api/demografi/1679157` di Hema **404** (dicek langsung) — route
`/api/patient/<norm>` ada di hemato_notes_server tapi tergantung pickle lama.
Yang reliable: **`GET /api/pasien?norm=X` di SIMRS Web (sirs.kay.web.id,
port 8099, FastAPI)** — return `{nama, tgl_lahir, jk, alamat, no_hp}` tapi
**butuh cookie login sid** (tidak bisa dari Vercel).
→ **Tugasmu pertama:** tambahkan jalur publik di Hema (VPS):
`GET /api/demografi/{norm}` yang login service-account sendiri via
`hematology_lookup.make_session()` + hit
`http://localhost:8080/webservice/general/pasien/{norm}` → respons sama
format SIMRS Web + 6h cache (pattern lookup). ~40 baris di
`hemato_notes_server.py` do_GET. Setelah itu dari commandcode tinggal:
`fetch('https://hema.ark-kay.my.id/api/demografi/'+norm)`.
**Jangan lupa:** purge cache tidak perlu (route baru), tapi restart service +
update test matrix; dan sinkronkan file repo `hema-repo/server/` ↔ deployed.

### 4.4 Keputusan yang masih terbuka (tanya user dulu, jangan asumsikan)

- [ ] "Tambah manual" (pasien tanpa RM SIMRS / data dari sensus WA):
      masih perlu? Kalau ya, tetap di form lama atau jadi dialog kecil di My Patients?
- [ ] Setelah rework: halaman /pasien/kanban + /pasien/list + /jadwal-dpjp +
      /lab — hapus total atau diparkir (route tetap ada, nav gak nyebut)?
- [ ] Widget dashboard Jadwal DPJP: file component ikut dihapus fisik atau
      disimpan buat nanti?
- [ ] Nama menu: "My Patients" / "Pasien Saya" / "Pasienku"? (UI bahasa Indonesia)

---

## 5. Data Uji & Cara Verifikasi Cepat

| RM                                              | Kenapa dipakai                           | Yang harus muncul                                |
| ----------------------------------------------- | ---------------------------------------- | ------------------------------------------------ |
| `1679157`                                       | ISMAHUL JANNAH, 43 kunjungan             | preview 3 → full 43 + 3 Rad(read)                |
| `1041752`                                       | kasus radiologi lengkap                  | 3 read + **1 MRI unread (basah)** + 1 batal      |
| `1706242`                                       | multi-kunjungan IGD vs NICU              | 4 read + 1 batal (bukti resolve semua kunjungan) |
| `1291325;1601400;1612764;1522855;863659;854526` | burst 6-RM (regresi ThreadingHTTPServer) | 6 kartu, 0 error                                 |
| `999999999`                                     | tidak ada                                | error terisolasi di kartunya sendiri             |

```bash
# API production sanity
curl -s "https://pedia-brain.vercel.app/api/hema-lookup?norm=1041752" \
  | jq '[.special.rad[] | {state, viewer:(.viewer_url!=null)}]'
# deploy status
vercel ls pedia-brain --limit 1
# server hema
systemctl is-active hema.service   # jangan pakai sudo buat cek status; restart pakai sudo
```

## 6. Known Quirks / Pain Points (biar gak kaget)

1. `npm run build` di VPS ±30–60s; dev server: `PORT=3001 npm run dev`
   (background + jangan pakai `&` di command tool).
2. `middleware` convention deprecated di Next 16 (warning, biarin).
3. Cache in-memory proxy Next hilang tiap cold start Vercel — normal.
4. SIMRS kadang login lama (>5s) saat RS sibuk; retry 2x menangani ini.
5. `patients.medical_record_no` belum unique di DB (constraint baru di plan
   §4.2.1 — jalankan sekali di Neon, cek duplikat dulu: kosong kok, aman).
6. UI badge belum sempat diverifikasi visual via browser automation di VPS
   (infra browser sesi Kreya mati) — data-layer verified, visual = test manual
   user. Kalau commandcode punya akses browser, screenshot /lab-lookup 1041752.
7. AGENTS.md file-ownership lama (OpenCode/Kayden/Zai) — koordinasikan via
   Telegram kalau agent lain masih aktif, atau user bilang solo sekarang.

## 7. Definisi "Selesai" (Definition of Done) untuk Rework §4

- [ ] Lookup → klik "Tambah ke Pasien" → kartu jadi "✓ My Patient" + link detail
- [ ] RM yang sama muncul lagi → tombol sudah "✓" (deteksi exists, tanpa duplikat DB)
- [ ] /pasien (My Patients) listing beneran dari DB Neon production (bukan mock)
- [ ] Detail pasien: demografi (DB) + Data RS Live (fresh) + layer lokal jalan
- [ ] `npm run build` bersih, PR merged, ● Ready production, data uji §5 lulus
- [ ] User approval visual (dia yang pakai di RS)
