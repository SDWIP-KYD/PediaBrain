"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, InfoBox } from "../../components/calc-ui";

const supOptions = [
  { value: "fe-def", label: "Anemia Defisiensi Besi" },
  { value: "fe-ppx", label: "Profilaksis Fe (Prematur/BBLR)" },
  { value: "zn-def", label: "Defisiensi Zinc" },
  { value: "zn-diarrhea", label: "Zinc Diare Akut (WHO)" },
  { value: "vita", label: "Defisiensi Vit A (xeroftalmia)" },
  { value: "vitd-def", label: "Defisiensi Vitamin D" },
  { value: "vitd-ppx", label: "Profilaksis Vit D (bayi)" },
  { value: "b12", label: "Defisiensi Vit B12" },
  { value: "folat", label: "Defisiensi Folat" },
  { value: "kwash", label: "Kwashiorkor — Paket suplementasi" },
];

function getSupRecommendation(type: string, weight: number, age: number): string {
  const r0 = (n: number) => Math.round(n);
  switch (type) {
    case "fe-def":
      return `Anemia Defisiensi Besi — Terapi:\nBesi elemental oral: ${r0(3 * weight)}–${r0(6 * weight)} mg/hari (3–6 mg elemental Fe/kgBB/hari)\nDibagi 2–3 dosis, berikan 1 jam sebelum makan + Vit C (↑absorpsi 30%)\nDurasi: 3 bulan setelah Hb normal (isi cadangan). Monitor Hb tiap 4 minggu`;
    case "fe-ppx":
      return `Profilaksis Fe (Prematur/BBLR):\nFe elemental 2–4 mg/kgBB/hari mulai usia 2–4 minggu\nLanjutkan hingga usia 12 bulan atau makan makanan kaya Fe`;
    case "zn-def":
      return `Defisiensi Zinc — Terapi:\nZinc elemental ${r0(1 * weight)} mg/hari (anak: 0.5–2 mg/kg) × 3–6 bulan\nZinc sulfat 220 mg = Zinc elemental 50 mg. Berikan jauh dari Fe`;
    case "zn-diarrhea":
      return `Zinc untuk Diare Akut (WHO):\n${age < 5 ? "10 mg/hari" : "20 mg/hari"} oral × 10–14 hari\nTerbukti kurangi durasi dan keparahan diare. Mulai dari hari pertama`;
    case "vita":
      return `Defisiensi Vitamin A:\nVit A: ${weight < 8 ? "100.000" : "200.000"} IU oral dosis tunggal (VAD pada anak >12 bulan)\nUlangi hari ke-2 dan 4 minggu kemudian bila xeroftalmia\nProfilaksis: Vit A 200.000 IU oral tiap 6 bulan`;
    case "vitd-def":
      return `Defisiensi Vitamin D:\nKolecalsiferol (D3) 2000–4000 IU/hari × 3 bulan → maintenance 600–1000 IU/hari\nStoss therapy: 100.000–200.000 IU single dose (bila kepatuhan buruk)`;
    case "vitd-ppx":
      return `Profilaksis Vitamin D (Bayi ASI):\nKolecalsiferol 400 IU/hari mulai hari pertama kehidupan hingga 12 bulan`;
    case "b12":
      return `Defisiensi Vitamin B12:\nSianokobalamin IM ${age < 2 ? 250 : 1000} mcg/hari × 7 hari → tiap minggu × 4 → tiap bulan\nAtau oral (dosis tinggi): 1000 mcg/hari (bila penyerapan baik)`;
    case "folat":
      return `Defisiensi Folat:\nAsam folat 1–5 mg/hari PO × 3–4 bulan\nProfilaksis pranikah/hamil: 400–800 mcg/hari (cegah NTD)`;
    case "kwash":
      return `Kwashiorkor — Paket Suplementasi WHO:\nVit A: 200.000 IU hari 1 (bila tidak diberikan sebelumnya)\nAsam folat: 5 mg hari 1, lanjut 1 mg/hari\nMultivitamin mineral (tanpa Fe fase awal)\nZinc: 2 mg elemental/kgBB/hari\n⚠️ Fe TIDAK diberikan fase stabilisasi (infeksi aktif → hemosiderosis)`;
    default:
      return "";
  }
}

export function SuplementasiCalc() {
  const { weightGram, ageYears } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [age, setAge] = useState(Math.round(ageYears));
  const [type, setType] = useState("fe-def");

  const recommendation = getSupRecommendation(type, weight, age);

  return (
    <CalcCard title="Suplementasi Defisiensi" subtitle="Fe, Zn, Vit A, Vit D, B12, Folat" icon="🔍" color="yellow">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <CalcInput label="BB (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.1} />
          <CalcInput label="Usia (thn)" unit="thn" value={age} onChange={(v) => setAge(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={18} />
        </div>
        <CalcSelect label="Defisiensi / Kondisi" value={type} onChange={setType} options={supOptions} />

        <CalcResult color="yellow">
          <div className="whitespace-pre-line text-sm leading-relaxed">
            {recommendation}
          </div>
        </CalcResult>
        <InfoBox>
          Dosis berdasarkan panduan WHO/IKU. Sesuaikan dengan kondisi klinis dan berat defisiensi.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
