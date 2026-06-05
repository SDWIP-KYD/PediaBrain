export interface SectionBlock {
  sub?: string;
  p?: string;
  note?: string;
  formula?: string;
  warn?: string;
  list?: string[];
  table?: { head: string[]; rows: string[][] };
}

export interface DivisionSection {
  title: string;
  blocks: SectionBlock[];
}

export interface DivisionData {
  id: string;
  name: string;
  full: string;
  icon: string;
  sections: DivisionSection[];
}

export const divisionData: DivisionData[] = [
  {
    id: "nicu",
    name: "NICU",
    full: "Neonatal Intensive Care Unit",
    icon: "👶",
    sections: [
      {
        title: "Heparin Flush — Pengenceran",
        blocks: [
          { p: "Tujuan: menjaga kepatenan jalur infus agar tidak tersumbat." },
          { sub: "Larutan Heparin 10 unit/mL" },
          { list: ["Ambil 0,1 mL heparin (konsentrasi 1000 unit/mL)", "Tambahkan 9,9 mL NaCl 0,9%", "Hasil: 10 mL larutan = 10 unit/mL (siap pakai)"] },
        ],
      },
      {
        title: "Koreksi Bikarbonat (Bicnat / Meylon)",
        blocks: [
          { formula: "0,3 × BE × BB → habis dalam 24 jam" },
          { p: "Contoh: BB 2,1 kg, BE 6 → 0,3 × 6 × 2,1 = 3,78 mEq." },
          { list: ["Jika melalui CVC: encerkan 1:1 dengan D5%/D10%"] },
          { formula: "Rumus alternatif NICU: 0,6 × BB × BE dalam D10% (dikali 5) → habis 24 jam" },
        ],
      },
      {
        title: "Koreksi Hiponatremia",
        blocks: [
          { formula: "Rumus cepat: 6 mmol/kgBB dilarutkan dalam 20 mL/kgBB Dextrose 10%" },
          { list: ["2 mL NaCl 3% = 1 mEq Natrium", "Contoh: BB 2,115 kg → koreksi 6 × 2,115 = 12,69 mEq", "Campur ±30 mL NaCl 3% dalam 40 mL D10% → habis dalam 6 jam"] },
          { warn: "Koreksi Na cepat bisa pakai NaCl 3% via PICC. Koreksi JANGAN > 10 mEq/L per 24 jam." },
        ],
      },
      {
        title: "Koreksi Hipoalbuminemia",
        blocks: [
          { formula: "(Target Albumin − Albumin Sekarang) × 0,8 × 4 × BB" },
          { list: ["Plasbumin 25% → kalikan 4", "Plasbumin 5% → kalikan 20"] },
        ],
      },
      {
        title: "Koreksi Magnesium Sulfat 20%",
        blocks: [
          { list: ["Sediaan MgSO4 20% = 200 mg/mL", "Kebutuhan (gram) ÷ 200 = jumlah mL diberikan per 6 jam"] },
        ],
      },
      {
        title: "Transfusi Darah & Komponen Darah",
        blocks: [
          {
            table: {
              head: ["Komponen", "Dosis", "Durasi", "Frekuensi"],
              rows: [
                ["PRC", "20 mL/kgBB", "Sesuai kondisi", "1 kali"],
                ["FFP", "15 mL/kgBB", "Sesuai kondisi", "1 kali"],
                ["TC (Trombosit)", "15 mL/kgBB", "Sesuai kondisi", "3 hari"],
              ],
            },
          },
          { warn: "Transfusi berulang (≥2x) dapat menyebabkan hiperferritinemia → tunda Fe hingga usia 2 bulan, atau periksa ferritin dahulu." },
        ],
      },
      {
        title: "Pemberian Zat Besi (Fe) — Prematur & BBLR",
        blocks: [
          { list: ["Dosis: 3 mg/kgBB/hari oral", "Mulai usia 1 bulan, KECUALI transfusi ≥2x → tunda hingga 2 bulan", "Tanpa fasilitas cek ferritin: tunggu hingga 2 bulan agar ferritin menurun", "Contoh BB 1,3 kg → Ferlin drops (15 mg Fe/mL), hitung sesuai BB"] },
        ],
      },
      {
        title: "Vitamin & Suplemen Rutin",
        blocks: [
          {
            table: {
              head: ["Obat", "Dosis", "Rute", "Keterangan"],
              rows: [
                ["Zamel", "1 mL/24 jam", "Oral", "Vitamin D"],
                ["Apyalis", "0,6 mL/24 jam", "Oral", "Vit D (sesuai target kadar)"],
                ["Ferlin drops", "0,3 mL/24 jam", "Oral", "Zat besi (mulai usia 1 bln)"],
              ],
            },
          },
          { sub: "Vitamin K" },
          { list: ["Injeksi Vit K: 3 hari berturut-turut pada BBL", "Tujuan: mencegah HDN (Hemorrhagic Disease of the Newborn)"] },
          { sub: "Antikoagulan" },
          { list: ["Clopidogrel (CPG): 0,2 mg/kgBB/hari"] },
        ],
      },
      {
        title: "Nutrisi Neonatus — Kalori Susu / mL",
        blocks: [
          {
            table: {
              head: ["Jenis Susu", "Kalori/mL", "Keterangan"],
              rows: [
                ["ASI", "0,67 kkal", "Standar 20"],
                ["Sufor BBLR", "0,8 kkal", "Standar 24, prematur"],
                ["Nutramigen", "—", "BBLR pasca operasi"],
              ],
            },
          },
          { list: ["Kenaikan BB minimal: 15 g/kgBB/hari", "GIR minimal: 4–6 mg/kgBB/menit"] },
        ],
      },
      {
        title: "Menghitung GIR (Glucose Infusion Rate)",
        blocks: [
          { sub: "Dari Infus IV" },
          { formula: "Rumus 1: [0,167 × Kecepatan(mL/jam) × %Dextrose] ÷ BB" },
          { formula: "Rumus 2: [Kecepatan(mL/jam) × %Dextrose] ÷ (6 × BB)" },
          { sub: "Dari Minum Oral" },
          { formula: "(Total minum 24 jam ÷ 24) × 7 (ASI) atau 8 (SF) ÷ BB ÷ 6" },
        ],
      },
      {
        title: "Balance Cairan & IWL",
        blocks: [
          { formula: "IWL = BB × 26 (dalam inkubator/modalitas) atau BB × 20 (tanpa modalitas)" },
          { formula: "Balance = Total masuk − Total keluar − IWL" },
          { list: ["Target balance: ±20 mL/kgBB/24 jam", "< 20 mL/kgBB → risiko AKI", "> 20 mL/kgBB → risiko overload cairan", "Produksi urin normal: 1–3 mL/kgBB/jam (poliuria jika >3)"] },
          { warn: "Untuk menghitung kebutuhan cairan & minum, gunakan berat badan TERBERAT yang pernah tercatat." },
        ],
      },
      {
        title: "Kurva Pertumbuhan Bayi",
        blocks: [
          {
            table: {
              head: ["Kondisi", "Kurva"],
              rows: [
                ["Prematur < 40 minggu", "Fenton (plot tiap minggu)"],
                ["≥ 40 mgg / BBLR / 0–2 bln", "WHO Z-score 0–2 bln (per minggu)"],
                ["Setelah 40 mgg koreksi", "WHO Z-score 0–6 bulan"],
              ],
            },
          },
          { sub: "Cara Plot Fenton" },
          { list: ["Lahir < persentil 10: arahkan BB masuk antara persentil 10–90", "Lahir di persentil 10–90: ikuti alur persentil 50 sebagai target"] },
        ],
      },
      {
        title: "Penurunan BB Fisiologis BBL",
        blocks: [
          {
            table: {
              head: ["Hari ke-", "Penurunan Normal"],
              rows: [
                ["Hari 1", "3–5%"],
                ["Hari 2", "2–3%"],
                ["Hari 3", "Maksimal 10% dari BB lahir"],
              ],
            },
          },
        ],
      },
      {
        title: "Kateter Umbilikus & ETT",
        blocks: [
          {
            table: {
              head: ["Parameter", "Rumus / Target"],
              rows: [
                ["Kedalaman kateter umbilikalis", "1,5 × BB + 5,5 cm"],
                ["Posisi ujung kateter", "Setinggi Thorakal 8–10 (X-ray)"],
                ["Ukuran ETT", "Usia gestasi ÷ 10"],
                ["Kedalaman ETT", "BB + 6 cm"],
              ],
            },
          },
          { sub: "Posisi Ideal Alat (X-ray)" },
          {
            table: {
              head: ["Device", "Posisi Ideal"],
              rows: [
                ["Endotracheal Tube", "T1–T3 (1–2 cm di atas carina)"],
                ["Umbilical venous line", "0,5–1 cm di atas diafragma (IVC–RA)"],
                ["Umbilical arterial (High)", "T6–T10"],
                ["Umbilical arterial (Low)", "L3–L4"],
                ["PICC (Upper limb)", "T3–T5 (SVC–RA)"],
                ["PICC (Lower limb)", "T8–T10 (IVC)"],
              ],
            },
          },
        ],
      },
      {
        title: "Surfaktan",
        blocks: [
          { sub: "Fungsi" },
          { list: ["Menurunkan tegangan permukaan alveoli", "Mencegah kolaps alveoli saat ekspirasi", "Meningkatkan komplians paru", "Memfasilitasi rekrutmen alveolus kolaps", "Menurunkan kebutuhan O₂ & meningkatkan oksigenasi", "Menurunkan kebocoran udara & meningkatkan keselamatan"] },
          { sub: "Waktu Pemberian" },
          { list: ["Idealnya DALAM 8 jam pertama kelahiran", "> 8 jam: sebagian alveolus kolaps, sebagian baik → beda tegangan → risiko PNEUMOTHORAKS"] },
          { warn: "Indikasi profilaksis segera: Down Score tinggi, usia gestasi <32 minggu. Berikan dosis maintenance langsung." },
        ],
      },
      {
        title: "Capneu (Kafein Sitrat)",
        blocks: [
          { formula: "Loading 20 mg/kgBB → maintenance 5 mg/kgBB" },
          { list: ["Indikasi: usia gestasi <32 minggu", "Berikan langsung dosis maintenance (tanpa loading khusus)", "Lanjutkan hingga usia 34–40 minggu PMA", "Efek samping: takikardia, perdarahan"] },
          { sub: "Apnea of Prematurity" },
          { list: ["Definisi: napas berhenti >20 detik, atau <20 detik disertai desaturasi/bradikardia", "Periodic breathing: henti napas <20 detik, tanpa bradikardia/desaturasi (NORMAL pada prematur)", "Penyebab tersering: obstruktif (posisi bayi — midline / semi-ekstensi)"] },
        ],
      },
      {
        title: "Setting Ventilator",
        blocks: [
          { formula: "Delta Support = PIP − PEEP (delta support harus < hasil ini)" },
          { p: "Contoh: PIP 15, PEEP 5 → Delta 10 → delta support harus <10." },
          { list: ["Target PCO₂ anak & bayi: 35–45 mmHg; pH tidak boleh <7,25"] },
          { sub: "Koreksi RR" },
          { formula: "(PCO₂ sebelum ÷ PCO₂ target) × RR saat ini" },
        ],
      },
      {
        title: "Hipoglikemia — 3 Mekanisme",
        blocks: [
          { list: ["Cadangan glikogen kurang (prematur, BBLR)", "Utilisasi glukosa berlebihan (infeksi, hipotermia)", "Hiperinsulinemia (IDM, Beckwith-Wiedemann)"] },
        ],
      },
      {
        title: "Klasifikasi Bayi Prematur",
        blocks: [
          {
            table: {
              head: ["Kategori", "Usia Gestasi"],
              rows: [
                ["Early Preterm", "< 28 minggu"],
                ["Very Preterm", "28–32 minggu"],
                ["Moderately Preterm", "32–34 minggu"],
                ["Late Preterm", "34–36 minggu"],
              ],
            },
          },
        ],
      },
      {
        title: "Deksametason Pra-Ekstubasi",
        blocks: [
          { list: ["Dosis profilaksis: 250 mcg/kgBB/8 jam → 3 dosis", "Tujuan: mengurangi edema subglotis agar ekstubasi berhasil"] },
        ],
      },
      {
        title: "Interpretasi Foto Thoraks Bayi",
        blocks: [
          { sub: "Syarat Layak Dibaca (MIMICS)" },
          { list: ["Marker: identitas & lateralisasi lengkap", "Inspirasi cukup: tampak 7–8 kosta posterior / 5–6 anterior", "Integritas: mengisi seluruh hemitoraks", "Cahaya: tampak vertebra Th3/4, di bawahnya putih", "Simetris kiri & kanan"] },
          { sub: "Urutan Interpretasi (ABCDE)" },
          { list: ["A – Airway: posisi trakea & bronkus", "B – Bones: tulang intak", "C – Cardiac: CTR, bentuk jantung", "D – Diaphragm: bentuk kubah, mendatar?", "E – Else: temuan lain"] },
          { warn: "Foto terlalu terang → infiltrat palsu. Foto terlalu gelap → kelainan tersembunyi." },
        ],
      },
    ],
  },
  {
    id: "picu",
    name: "PICU",
    full: "Pediatric Intensive Care Unit",
    icon: "💊",
    sections: [
      {
        title: "Obat Vasoaktif — Dosis & Pengenceran",
        blocks: [
          {
            table: {
              head: ["Obat", "Rentang Dosis", "Rumus mL/jam"],
              rows: [
                ["Epinefrin (kontinu)", "0,05–0,3 mcg/kgBB/mnt", "Dosis × BB × 60 ÷ 100"],
                ["Norepinefrin", "0,05–0,3 mcg/kgBB/mnt", "Dosis × BB × 60 ÷ 80"],
                ["Dopamin", "2–10 mcg/kgBB/mnt", "Dosis × BB × 60 ÷ 4.000"],
                ["Dobutamin", "5–10 mcg/kgBB/mnt", "Dosis × BB × 60 ÷ 5.000"],
              ],
            },
          },
        ],
      },
      {
        title: "Nikardipin (Hipertensi)",
        blocks: [
          { list: ["Pengenceran: 10 mL Nikardipin + 40 mL NaCl 0,9%"] },
          { formula: "Dosis × BB × 50 × 60 ÷ 10.000 = mL/jam" },
          { p: "Contoh: dosis 2,5 mcg, BB 18 kg → 2,5 × 18 × 50 × 60 ÷ 10.000 = 13,5 mL/jam." },
        ],
      },
      {
        title: "Hiperkalemia",
        blocks: [
          {
            table: {
              head: ["Kadar Kalium", "Tatalaksana"],
              rows: [
                ["> 6,5 mEq/L", "Insulin 0,1 IU/kgBB + D40% 1 mL/kgBB → habis 1 jam"],
                ["6,0–6,5 mEq/L", "Nebulisasi Salbutamol (Ventolin) 3 kali"],
              ],
            },
          },
        ],
      },
      {
        title: "PCO₂ & Koreksi RR di Ventilator",
        blocks: [
          { list: ["Target PCO₂ anak: 35–45 mmHg; pH tidak boleh <7,25"] },
          { formula: "Koreksi RR = (PCO₂ terukur ÷ PCO₂ target) × RR saat ini" },
        ],
      },
      {
        title: "IVIG (Imunoglobulin Intravena)",
        blocks: [
          { list: ["Dosis: 1 g/kgBB IV", "Pengenceran IVIG 5%: 1 g/kgBB = 20 mL/kgBB"] },
          { sub: "Kecepatan Pemberian (Bertahap)" },
          {
            table: {
              head: ["Durasi", "Kecepatan"],
              rows: [
                ["30 menit ke-1", "0,5 mg/kgBB/mnt (0,01 mL/kgBB/mnt)"],
                ["30 menit ke-2", "1 mg/kgBB/mnt (0,02 mL/kgBB/mnt)"],
                ["30 menit ke-3", "2 mg/kgBB/mnt (0,04 mL/kgBB/mnt)"],
                ["30 menit ke-4", "3 mg/kgBB/mnt (0,06 mL/kgBB/mnt)"],
                ["Selanjutnya", "4 mg/kgBB/mnt (0,08 mL/kgBB/mnt) s.d. selesai"],
              ],
            },
          },
        ],
      },
      {
        title: "ARDS pada Anak (Kriteria Berlin)",
        blocks: [
          {
            table: {
              head: ["Parameter", "Non-Invasif", "Invasif (AGD)"],
              rows: [
                ["Rasio", "SF = SaO₂ ÷ FiO₂", "PF = PaO₂ ÷ FiO₂"],
                ["Mild", "SF ≤ 264", "PF ≤ 300"],
              ],
            },
          },
          { sub: "FiO₂ berdasarkan Modalitas" },
          {
            table: {
              head: ["Modalitas", "FiO₂"],
              rows: [
                ["Nasal kanul", "0,3–0,4"],
                ["Simple mask", "0,6"],
                ["Non-rebreather (NRM)", "0,8"],
                ["Jackson-Rees / Sungkup", "0,8"],
                ["Intubasi (ventilator)", "1,0"],
              ],
            },
          },
          { sub: "OSI & OI" },
          { formula: "OSI (tanpa AGD) = FiO₂ × MAP × 100 ÷ SaO₂" },
          { formula: "OI (dengan AGD) = FiO₂ × MAP ÷ PaO₂" },
          {
            table: {
              head: ["Derajat", "OSI", "OI"],
              rows: [
                ["Mild", "5–7,5", "4–8"],
                ["Moderate", "7,5–12,3", "8–16"],
                ["Severe", "≥ 12,3", "> 16"],
              ],
            },
          },
          { formula: "MAP ventilator = [(Ti × PIP) + (Te × PEEP)] ÷ (Ti + Te)" },
        ],
      },
    ],
  },
  {
    id: "hemato",
    name: "Hemato-Onkologi",
    full: "Hematologi & Onkologi",
    icon: "🩸",
    sections: [
      {
        title: "Nilai Normal Hemoglobin per Usia",
        blocks: [
          { p: "Anemia = kadar Hb di bawah nilai normal sesuai usia." },
          {
            table: {
              head: ["Usia", "Hb Normal (g/dL)"],
              rows: [
                ["Tali pusar (BBL)", "13,5 – 18,5"],
                ["1–3 hari", "14,5 – 22,5"],
                ["2–3 bulan", "9,0 – 12,5"],
                ["6 bln – 6 thn", "11,0 – 14,0"],
                ["6–12 tahun", "12,0 – 15,5"],
                ["13–18 tahun", "≥ 13,0"],
              ],
            },
          },
        ],
      },
      {
        title: "Klasifikasi Anemia berdasarkan Penyebab",
        blocks: [
          {
            table: {
              head: ["Mekanisme", "Jenis", "Contoh"],
              rows: [
                ["Kehilangan darah", "Pasca perdarahan", "Perdarahan akut/masif (>30%)"],
                ["Penghancuran SDM", "Hemolitik", "Thalasemia, G6PD, SLE"],
                ["Kegagalan produksi", "Aplastik", "Obat, infeksi, radiasi"],
                ["Desakan sumsum", "Leukemia", "Limfoblastik, mieloblastik"],
                ["Defisiensi bahan baku", "Defisiensi", "Fe, B12, asam folat"],
                ["Penyakit kronik", "APK", "Infeksi kronik, gagal ginjal, PEM"],
              ],
            },
          },
        ],
      },
      {
        title: "Pendekatan Diagnosis (MCV/MCH)",
        blocks: [
          {
            table: {
              head: ["Morfologi", "DD", "Petunjuk"],
              rows: [
                ["Mikrositik hipokrom", "ADB, APK, Thalasemia, Pb", "Ferritin <30 → ADB; >100 → APK"],
                ["Normositik + Ret↑", "Hemolitik", "ADT: fragmentasi, sferosit, normoblast"],
                ["Normositik + Ret↓", "Aplastik, Leukemia", "Cek BMP"],
                ["Makrositik", "Megaloblastik", "Cek B12 & asam folat"],
              ],
            },
          },
          { sub: "Indeks Mentzer (MCV ÷ Eritrosit)" },
          { list: ["> 13 → Anemia Defisiensi Besi (ADB)", "< 13 → Thalasemia atau APK"] },
        ],
      },
      {
        title: "Target Hb untuk Transfusi PRC",
        blocks: [
          {
            table: {
              head: ["Kondisi", "Target Hb (g/dL)"],
              rows: [
                ["APK", "10"],
                ["ADB / Hiperleukositosis", "8"],
                ["Aplastik", "9–9,5"],
                ["CML", "8"],
                ["Persiapan kemoterapi", "9"],
                ["Thalasemia/keganasan", "Sesuai usia (transfusi bila <9)"],
                ["Operasi minor", "10"],
                ["Operasi besar", "12"],
              ],
            },
          },
          { formula: "Volume PRC (mL) = ΔHb × 4 × BB" },
          { p: "Contoh: Hb 6,8 → target 11, BB 12 kg → (11−6,8) × 4 × 12 = 201,6 mL. Berikan bertahap: Tahap I 100 mL, Tahap II sisanya." },
        ],
      },
      {
        title: "Derajat Neutropenia (ANC)",
        blocks: [
          {
            table: {
              head: ["Derajat", "ANC (/mm³)"],
              rows: [
                ["Normal", "> 2.000"],
                ["Ringan", "1.000 – 2.000"],
                ["Sedang", "500 – 1.000"],
                ["Berat", "100 – 500"],
                ["Sangat berat (profound)", "< 100"],
              ],
            },
          },
          { formula: "ANC = Leukosit total × % Neutrofil ÷ 100" },
        ],
      },
      {
        title: "Thalasemia",
        blocks: [
          { list: ["Tersering: Thalasemia Beta (kekurangan rantai globin β)", "Gejala muncul usia 6 bulan (transisi Hb F → Hb A)"] },
          { sub: "Gambaran Khas" },
          { list: ["Anemia mikrositik hipokrom + retikulosit ↑", "Hepatosplenomegali (hipersplenisme)", "Facies Cooley (hidung pesek, pipi menonjol)", "Hair-brush appearance foto tengkorak"] },
          { sub: "Indikasi Kelasi Besi" },
          { list: ["Ferritin >1.000 ng/mL, ATAU saturasi transferin >50%, ATAU transfusi >5 liter"] },
          { sub: "Indikasi Splenektomi" },
          { list: ["Usia >5 tahun, lien >Schufner IV, interval transfusi makin pendek"] },
        ],
      },
      {
        title: "Anemia Aplastik",
        blocks: [
          { list: ["DD utama: Leukemia subleukemik", "Gambaran khas: pansitopenia + BMP hiposeluler", "ADT: normositik, limfositosis relatif, retikulosit ↓"] },
          { sub: "Tata Laksana" },
          { list: ["Tekan limfosit T autoreaktif: Cyclosporin A (Sandimun) 10 mg/kgBB", "Sebelum rujuk: transfusi PRC target Hb 8–9,5", "Transfusi trombosit: BB × 0,4 unit"] },
        ],
      },
      {
        title: "Penyakit Perdarahan — Skrining Lab",
        blocks: [
          {
            table: {
              head: ["Gangguan", "BT", "Trombosit", "PT/APTT", "Rumple Leede"],
              rows: [
                ["Vaskuler", "Normal", "Normal", "Normal", "+"],
                ["Trombositopenia", "↑ memanjang", "↓ turun", "Normal", "+"],
                ["Trombopati", "↑ memanjang", "Normal", "Normal", "+"],
                ["Gangguan pembekuan", "Normal", "Normal", "↑ memanjang", "−"],
              ],
            },
          },
          { list: ["Hemofilia: PT normal, APTT memanjang", "Defisiensi Vit K (HDN): PT & APTT memanjang"] },
          { warn: "Trombosit <20.000 → risiko perdarahan SSP & saluran cerna. <50.000 → tindakan hati-hati." },
        ],
      },
      {
        title: "Hiperleukositosis",
        blocks: [
          { list: ["Definisi: Leukosit >30.000/mm³", "Tatalaksana: hidrasi intensif sampai leukosit minimal 15.000", "Target Hb: 8 g/dL (hindari transfusi berlebih → viskositas ↑)", "Hidrasi 1,5× kebutuhan cairan harian"] },
        ],
      },
    ],
  },
  {
    id: "kardio",
    name: "Kardiologi",
    full: "Kardiologi Anak",
    icon: "❤️",
    sections: [
      {
        title: "Dosis Obat Kardiologi",
        blocks: [
          {
            table: {
              head: ["Obat", "Dosis", "Frekuensi", "Ket"],
              rows: [
                ["Furosemid", "0,5 mg/kgBB/dosis", "Per 8–12 jam", "Diuretik loop"],
                ["Spironolakton", "3,125–25 mg (sesuai BB)", "Per 24 jam", "0–4 kg: 3,125; 5–10 kg: 6,25"],
                ["Captopril", "0,1–0,3 mg/kgBB/dosis", "Per 8–24 jam", "ACE inhibitor"],
                ["Digoxin", "5 mcg/kgBB/dosis", "Per 12 jam", "Bila EF <50%"],
                ["Propranolol", "0,3–0,5 mg/kgBB", "Per 6–8 jam", "Spell ToF"],
                ["Bisoprolol", "0,2–0,4 mg/kgBB", "Per 24 jam (oral)", "Beta-blocker"],
                ["PCT (PDA prematur)", "15 mg/kgBB", "Per 6 jam × 2 siklus", "1 siklus = 3 hari"],
                ["Sildenafil", "0,3–2 mg/kgBB", "Per 3–8 jam", "Hipertensi pulmonal"],
                ["Amiodarone", "15 mg/kgBB", "Infus 4 jam → 1 mL/jam", "Dalam 50 cc D5%"],
                ["Dobutamin", "3–5 mcg → vasodilator; >5 → inotropik", "Infus kontinu", "—"],
              ],
            },
          },
        ],
      },
      {
        title: "Tatalaksana Spell ToF (Hipoksia Sianotik)",
        blocks: [
          { list: ["Posisi knee-chest → meningkatkan SVR", "Bolus NaCl 0,9% 10 mL/kgBB", "Morfin 0,2 mg/kgBB"] },
          { p: "Pencampuran morfin: 1 mg/kgBB dalam 50 mL NaCl 0,9%, kecepatan 1–4 mL/jam." },
          { warn: "Jika bolus: ambil 1 mL dari pencampuran tersebut dan bolus segera." },
        ],
      },
      {
        title: "Tanda Gagal Jantung",
        blocks: [
          {
            table: {
              head: ["Jenis", "Tanda Khas"],
              rows: [
                ["Gagal jantung kanan", "Hepatomegali, edema pretibial"],
                ["Gagal jantung kiri", "Sesak napas, edema paru (ronki basah)"],
              ],
            },
          },
          { note: "Echo khas PJR: Mitral Regurgitasi (MR) / Aortic Regurgitasi (AR). Jarang mengenai trikuspid." },
        ],
      },
      {
        title: "Perhitungan MAP",
        blocks: [
          { formula: "MAP = (Sistolik + 2 × Diastolik) ÷ 3" },
          { list: ["Target MAP anak: sesuai usia", "Neonatus: >40 mmHg", "Anak besar: >65 mmHg"] },
        ],
      },
    ],
  },
  {
    id: "gastro",
    name: "Gastroenterologi",
    full: "Gastroenterologi Anak",
    icon: "🫁",
    sections: [
      {
        title: "Asetilsistein — Gagal Hati / OD Parasetamol",
        blocks: [
          {
            table: {
              head: ["Tahap", "Dosis", "Pelarut", "Durasi"],
              rows: [
                ["Loading", "150 mg/kgBB", "D5% 200 mL", "15–60 mnt (IV)"],
                ["Maintenance 1", "50 mg/kgBB", "D5% 500 mL", "4 jam"],
                ["Maintenance 2", "100 mg/kgBB", "D5% 1000 mL (2 botol)", "16 jam (per 8 jam/botol)"],
              ],
            },
          },
        ],
      },
      {
        title: "Nutrisi Enteral — Holliday-Segar (NWL)",
        blocks: [
          {
            table: {
              head: ["Usia / Triwulan", "NWL (mL/kgBB/hari)"],
              rows: [
                ["Triwulan I (0–3 bln)", "150–175"],
                ["Triwulan II (3–6 bln)", "140–150"],
                ["Triwulan III (6–9 bln)", "125–140"],
                ["Triwulan IV (9–12 bln)", "110–125"],
                ["1–3 tahun", "100"],
                ["4–6 tahun", "90"],
                ["7–9 tahun", "80"],
                ["10–12 tahun", "70"],
                ["13–19 tahun", "60"],
              ],
            },
          },
        ],
      },
      {
        title: "Kebutuhan Cairan pada Diare",
        blocks: [
          { formula: "Dehidrasi = (PWL + NWL + CWL) × BB" },
          { formula: "Tanpa dehidrasi, masih diare = (NWL + CWL) × BB" },
          { formula: "Tanpa dehidrasi, tanpa diare = NWL × BB" },
          {
            table: {
              head: ["Parameter", "Nilai"],
              rows: [
                ["PWL (3–10 kg)", "75 mL/kgBB"],
                ["PWL (10–15 kg)", "50 mL/kgBB"],
                ["PWL (>15 kg)", "30 mL/kgBB"],
                ["CWL", "25 mL/kgBB"],
              ],
            },
          },
        ],
      },
      {
        title: "Konstipasi & Laksatif",
        blocks: [
          { list: ["Lactulosa: 1 mL/kgBB/hari", "Anak >10 kg: Bisacodyl 5 mg / 8 jam", "Konstipasi kronik: Dulcolax / rektal"] },
        ],
      },
    ],
  },
  {
    id: "nutrisi",
    name: "Nutrisi Metabolik",
    full: "Nutrisi & Penyakit Metabolik",
    icon: "🍼",
    sections: [
      {
        title: "Kalori Berbagai Susu Formula",
        blocks: [
          {
            table: {
              head: ["Produk", "Kalori/mL", "1 SDT = ? mL air"],
              rows: [
                ["ASI", "0,67 kkal", "—"],
                ["Infatrini", "1 kkal", "22,5 mL"],
                ["Pediasure", "0,8 kkal", "40 mL"],
                ["Nutridrink", "1,5 kkal", "20 mL"],
                ["Peptamen / Nephrisol / Peptisol", "1 kkal", "40 mL"],
                ["Lactogen", "0,67 kkal", "30 mL"],
                ["Chilmil", "0,64 kkal", "40 mL"],
                ["Lactogrow", "0,66 kkal", "25 mL"],
                ["SGM LLM", "0,66 kkal", "30 mL"],
              ],
            },
          },
          { warn: "Lepas nutrisi parenteral jika sudah terpenuhi 70% kebutuhan kalori via oral/enteral." },
        ],
      },
      {
        title: "Menghitung Kenaikan Berat Badan",
        blocks: [
          { list: ["Hitung kenaikan BB per hari (gram)", "Hitung rata-rata BB awal & akhir", "Bagi kenaikan/hari dengan rata-rata BB → g/kgBB/hari"] },
          { p: "Contoh: naik 500 g dalam 10 hari, BB rata-rata 10,25 kg → 50 ÷ 10,25 = 4,87 g/kgBB/hari." },
        ],
      },
    ],
  },
  {
    id: "neuro",
    name: "Neurologi",
    full: "Neurologi Anak",
    icon: "🧠",
    sections: [
      {
        title: "Dosis Obat Neurologi",
        blocks: [
          {
            table: {
              head: ["Obat", "Dosis", "Frekuensi", "Rute"],
              rows: [
                ["Trihexylphenidil (THP)", "0,01–0,1 mg/kgBB/kali", "2× sehari", "Oral"],
                ["Citicolin", "7,5–15 mg/kgBB/kali", "Per 12 jam", "Oral/IV"],
                ["Gabapentin", "2 mg/kgBB/kali", "Per 8 jam", "Oral"],
                ["Piracetam", "10–20 mg/kgBB/kali (oral); 100 mg/kgBB (IV)", "Per 8 jam", "Oral/IV"],
                ["Valproat", "15–40 mg/kgBB/hari", "Bagi 2–3 dosis", "Oral"],
                ["Fenobarbital", "4–6 mg/kgBB/hari", "Bagi 2–3 dosis", "Oral"],
                ["Karbamazepin", "10–30 mg/kgBB/hari", "Bagi 2–3 dosis", "Oral"],
                ["Fenitoin", "5–7 mg/kgBB/hari", "Bagi 2–3 dosis", "Oral"],
                ["Oxcarbazepine", "10–30 mg/kgBB/hari", "Bagi 2–3 dosis", "Oral"],
                ["Topiramat (lini 2)", "4–8 mg/kgBB/hari", "Titrasi bertahap", "Oral"],
                ["Levetiracetam (lini 2)", "3–50 mg/kgBB/hari", "Titrasi bertahap", "Oral"],
                ["Midazolam", "0,1 mg/kgBB", "Sesuai kondisi", "IV"],
              ],
            },
          },
        ],
      },
      {
        title: "Perkembangan Motorik (CLAMS & CAT)",
        blocks: [
          {
            table: {
              head: ["Skala", "Fungsi", "Normal"],
              rows: [
                ["CLAMS", "Bahasa / kasar", ">85"],
                ["CAT", "Motorik halus / kognitif", ">85"],
              ],
            },
          },
        ],
      },
      {
        title: "EEG",
        blocks: [
          { list: ["Indikasi: kejang neonatal, epilepsi refrakter, status epileptikus", "Pasang EEG segera setelah kondisi stabil"] },
        ],
      },
    ],
  },
  {
    id: "respi",
    name: "Respirologi",
    full: "Respirologi Anak",
    icon: "🌬️",
    sections: [
      {
        title: "Derajat Retraksi",
        blocks: [
          { sub: "Ringan" },
          { list: ["Retraksi subkostal / interkostal ringan", "Tanpa penggunaan otot bantu napas jelas"] },
          { sub: "Sedang" },
          { list: ["Retraksi interkostal & subkostal jelas", "± retraksi suprasternal", "Frekuensi napas meningkat"] },
          { sub: "Berat" },
          { list: ["Retraksi multipel: suprasternal, interkostal, subkostal, ± supraklavikula", "Otot bantu napas sangat jelas", "± napas cuping hidung, grunting, head bobbing, sianosis"] },
          { sub: "Lokasi yang Dinilai" },
          { list: ["Suprasternal", "Supraklavikula", "Interkostal", "Subkostal", "Subxifoid / epigastrik"] },
        ],
      },
      {
        title: "Asma & Obstruksi Saluran Napas",
        blocks: [
          { list: ["Zafirlukast: TIDAK BOLEH untuk anak <5 tahun", "<12 tahun: Montelukast", "Anak <5 tahun: WAJIB spacer dengan katup"] },
          { sub: "Dosis Budesonide (ICS)" },
          { list: ["Dosis rendah: 100–200 mcg/hari", "Dosis sedang: 200–400 mcg/hari"] },
          { sub: "Asma" },
          { list: ["Salbutamol", "Budesonid intravena"] },
        ],
      },
      {
        title: "Croup",
        blocks: [
          { list: ["Nebulisasi Epinefrin 1:1000 → 0,5 mL/kgBB (=2,5 mL)", "Nebulisasi Budesonid 2 mg/8 jam", "Injeksi Dexametason 0,15 mg/kgBB"] },
        ],
      },
    ],
  },
  {
    id: "endo",
    name: "Endokrinologi",
    full: "Endokrinologi Anak",
    icon: "⚗️",
    sections: [
      {
        title: "Catatan Cepat Endokrin",
        blocks: [
          {
            table: {
              head: ["Hal", "Catatan"],
              rows: [
                ["CAH", "Clitoris >1 cm = megaloclitoris; periksa testosteron; waspada hiperkalemia & hiponatremia"],
                ["Vitamin D", "10 mcg = 400 IU; 15 mcg = 500 IU"],
                ["Konversi steroid", "4 mg Methylprednisolon = 5 mg Prednison"],
              ],
            },
          },
        ],
      },
      {
        title: "Hipoglikemia Refrakter",
        blocks: [
          { list: ["Octreotide (blind therapy) dosis inisial: 6 mcg/kg/hari IV = 3 mcg/8 jam IV"] },
        ],
      },
      {
        title: "Hipotiroid",
        blocks: [
          { list: ["Levothyroxin 7,5 mcg/kgBB = 37,5 mcg/24 jam/oral", "Cek FT4 & TSHs ulang 2 minggu setelah mulai levothyroxin", "Pemeriksaan Vitamin D"] },
        ],
      },
      {
        title: "Diabetes Mellitus (DM)",
        blocks: [
          { sub: "Diagnosis" },
          { list: ["Trias klasik: polidipsi, poliuria, polifagia", "Contoh GDS: 341 mg/dL", "Anak dikatakan DM bila HbA1c ≥ 8%"] },
          { sub: "Membedakan Tipe 1 vs Tipe 2" },
          { list: ["Tipe 1: tubuh kurus, perjalanan akut, autoimun terhadap sel beta pankreas", "Tipe 2: obesitas, acanthosis nigricans, perjalanan kronik"] },
          { p: "Sulit dibedakan bila tidak obesitas. 3 indikator pembantu: gejala lengkap (full blown), penurunan BB, GDS tinggi (penyakit sudah lama)." },
          { sub: "Follow-up & Komplikasi" },
          { list: ["HbA1c tiap 3 bulan", "Jangka pendek: hipoglikemia, KAD", "Jangka panjang: mikrovaskular & makrovaskular"] },
          { sub: "Faktor Risiko Komplikasi" },
          { list: ["Lama menderita DM", "Usia saat diagnosis", "Kontrol metabolik (HbA1c)", "Pola nutrisi"] },
          { sub: "Kontrol Metabolik (idealnya 7×/hari, minimal 4×)" },
          { list: ["Sebelum & 2 jam sesudah makan pagi", "Sebelum & 2 jam sesudah makan siang", "Sebelum & 2 jam sesudah makan malam", "Tengah malam (00.00–02.00)"] },
          { sub: "Jenis Insulin" },
          { list: ["Basal (long-acting): 1× malam sebelum tidur — stabilkan glukosa puasa", "Bolus (short-acting): sebelum makan — kontrol lonjakan post-prandial"] },
          { list: ["Dawn Phenomenon: kenaikan glukosa dini hari akibat hormon kontra-insulin", "Somogyi Effect: hiperglikemia rebound setelah hipoglikemia malam"] },
        ],
      },
      {
        title: "Tinggi Potensi Genetik (TPG)",
        blocks: [
          { formula: "Perempuan = (TB Ayah + TB Ibu − 13) ÷ 2 ± 8,5 cm" },
          { formula: "Laki-laki = (TB Ayah + TB Ibu + 13) ÷ 2 ± 8,5 cm" },
        ],
      },
    ],
  },
  {
    id: "nefro",
    name: "Nefrologi",
    full: "Nefrologi Anak",
    icon: "🫘",
    sections: [
      {
        title: "Tatalaksana Konservatif AKI",
        blocks: [
          { sub: "1. Pertahankan Perfusi Ginjal" },
          { list: ["Hipovolemia & oliguria (tanpa kontraindikasi overload/gagal jantung): bolus cairan IV (NaCl/albumin)", "Oliguria menetap: Furosemid IV 2–5 mg/kg/dosis (maks 240 mg) atau infus kontinu 0,1–1 mg/kg/jam"] },
          { sub: "2. Keseimbangan Cairan" },
          { list: ["Kebutuhan cairan: IWL + UO", "Batasi natrium: 2–3 mmol/kg/hari", "Overload + hipertensi (GNA): antihipertensi IV"] },
          { sub: "3. Hiperkalemia Emergency (K ≥7, atau 6–7 dengan pelepasan cepat)" },
          { list: ["Ca glukonat 10%: 0,5 mL/kg (maks 20 mL) IV perlahan 15–30 menit", "Salbutamol nebul (BB <25 kg: 2,5 mg; ≥25 kg: 5 mg)", "Salbutamol IV: 4 mcg/kg", "Insulin IV: 0,1 IU/kg + dekstrosa 0,5 g/kg (pantau GD tiap 15 menit)"] },
          { sub: "Hiperkalemia Non-Emergency (K 6–7 tanpa pelepasan cepat)" },
          { list: ["Resonium (polystyrene sulfonate): oral/rektal 1 g/kg (maks 30 g)", "Patiromer (Veltassa): anak ≥12 thn, onset lambat. Awal 4 g/kg/hari (maks 25,2 g), titrasi +4 g"] },
          { sub: "4. Koreksi Elektrolit Lain" },
          { list: ["Hiponatremia: batasi cairan + diuretik loop bila overload", "Hipokalsemia & hiperfosfatemia: calcium-based phosphate binder"] },
          { sub: "5. Koreksi Asidosis Metabolik" },
          { list: ["Cairan RL", "NaBic IV bila asidosis berat: bikarbonat ≤12 mmol/L dan/atau pH <7,2"] },
          { sub: "6. Nutrisi Adekuat (kalori s.d. 150% pemeliharaan)" },
          { list: ["BB 3–10 kg: 100 × BB", "BB 10–20 kg: 50 × BB + 1000", "BB >20 kg: 20 × BB + 1500", "Protein: 3 g/kg/hari"] },
          { sub: "7 & 8. Renal Adjustment & Hindari Nefrotoksik" },
          { list: ["Sesuaikan dosis obat yang diekskresi ginjal", "Hindari: NSAID; aminoglikosida/antivirus/antijamur nefrotoksik", "Pip-tazo + vancomycin (lebih nefrotoksik)", "ACEi/ARB, calcineurin inhibitor, kontras osmolalitas tinggi"] },
        ],
      },
      {
        title: "Ringkasan Dosis Obat ISK",
        blocks: [
          { list: ["Pielonefritis akut + komplikasi: Sefalosporin gen-3 IV (pilihan utama)", "ISK oral: Cefixim", "Sistitis sederhana: Kotrimoksazol"] },
          { warn: "Gentamisin bersifat nefrotoksik — gunakan dengan pantau fungsi ginjal ketat." },
        ],
      },
    ],
  },
  {
    id: "infeksi",
    name: "Infeksi & Tropis",
    full: "Infeksi & Penyakit Tropis",
    icon: "🦠",
    sections: [
      {
        title: "PCT (Paracetamol) Kontinu",
        blocks: [
          { formula: "15 × BB × 4 ÷ 24 → hasilnya ÷ 10 = mL/jam" },
          { p: "Contoh BB 26 kg: 15 × 26 × 4 ÷ 24 = 65 → 65 ÷ 10 = 6,5 mL/jam." },
        ],
      },
      {
        title: "Kotrimoksazol",
        blocks: [
          { list: ["Dosis berdasarkan komponen TMP (Trimetoprim)", "TMP: 4 mg/kgBB/kali → Sulfa = TMP × 5", "Dosis total Kotri = TMP + Sulfa", "Dosis Toksoplasma: TMP 10 mg/kgBB"] },
          { p: "Contoh BB 23 kg: TMP = 4×23 = 92 mg; Sulfa = 460 mg; Total = 552 mg." },
        ],
      },
      {
        title: "Antivirus & Antipiretik Lain",
        blocks: [
          { list: ["Valgansiklovir: 16 mg/kgBB/oral/24 jam", "Metamizole: 1 amp + D5 500 cc, kecepatan 20 cc/jam (dosis 10 mg/kgBB)"] },
        ],
      },
    ],
  },
  {
    id: "alergi",
    name: "Alergi Imunologi",
    full: "Alergi & Imunologi",
    icon: "🛡️",
    sections: [
      {
        title: "Anafilaksis",
        blocks: [
          { list: ["Injeksi Epinefrin 1:1000 → 0,01–0,03 mL/kgBB IM (umumnya 0,3 mL IM)", "Dapat diulang 3× dengan interval 5–15 menit", "Injeksi Difenhidramin 10 mg IV", "Injeksi Dexametason 5 mg IV"] },
          { p: "Dexametason 5 mg/8 jam IV rutin selama 3 hari." },
        ],
      },
      {
        title: "HSP (Henoch-Schönlein Purpura)",
        blocks: [
          { list: ["Methylprednisolone 2 mg/kgBB/24 jam oral"] },
        ],
      },
    ],
  },
  {
    id: "pedsos",
    name: "Pedsos",
    full: "Pediatri Sosial",
    icon: "👥",
    sections: [
      {
        title: "Interpretasi DQ (Developmental Quotient)",
        blocks: [
          {
            table: {
              head: ["DQ", "Interpretasi & Tindak Lanjut"],
              rows: [
                ["> 85%", "Umumnya normal — edukasi, lanjutkan stimulasi"],
                ["75–85%", "Suspek, mungkin terlambat — latih, pantau ketat, evaluasi, cari penyebab"],
                ["< 75%", "Umumnya terlambat — cari faktor penyebab; latih / rujuk / evaluasi ulang"],
              ],
            },
          },
        ],
      },
      {
        title: "Retardasi Mental",
        blocks: [
          { p: "Inteligensi umum di bawah rata-rata, dimulai dari masa perkembangan, disertai gangguan tingkah laku penyesuaian." },
          { sub: "Gejala" },
          { list: ["Keterlambatan berbahasa", "Gangguan motorik halus & adaptasi", "Gangguan perilaku: agresi, menyakiti diri, deviasi perilaku", "Keterlambatan motorik kasar"] },
          { sub: "Derajat" },
          {
            table: {
              head: ["Ringan", "Sedang", "Berat"],
              rows: [
                ["Gejala minimal di luar kriteria diagnosis; dampak fungsi sosial/pekerjaan ringan", "Antara kriteria ringan & berat", "Banyak gejala kriteria, atau beberapa gejala berat; gangguan fungsi sosial/pekerjaan berat"],
              ],
            },
          },
        ],
      },
      {
        title: "Autism Spectrum Disorder (DSM-V)",
        blocks: [
          { p: "Memenuhi kriteria A, B, C, D yang ditemukan saat ini atau dari riwayat." },
          { sub: "A. Hambatan Komunikasi & Interaksi Sosial (semua gejala)" },
          { list: ["Defisit hubungan sosial-emosional timbal balik (pendekatan aneh, percakapan tidak 2 arah, sulit berbagi minat/emosi)", "Defisit komunikasi non-verbal (kontak mata, gestur, ekspresi wajah)", "Defisit mengembangkan/mempertahankan relasi sosial"] },
          { sub: "B. Perilaku/Minat Terbatas & Repetitif (≥2 gejala)" },
          { list: ["Gerak/perkataan repetitif/stereotipi (deret mainan, ekolalia, flapping)", "Perilaku ritual, tidak fleksibel, pola pikir kaku, kebiasaan monoton", "Minat terbatas, terfiksasi, abnormal intensitas/fokus", "Hiper/hiporeaktivitas sensorik"] },
          { list: ["C. Gejala timbul tahap perkembangan awal", "D. Hambatan bermakna pada kehidupan sosial & fungsional", "E. Bukan disebabkan disabilitas intelektual / global developmental delay"] },
        ],
      },
    ],
  },
];
