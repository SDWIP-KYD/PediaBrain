"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, InfoBox } from "../../components/calc-ui";

export function SindromNefrotikCalc() {
  const { weightGram } = usePatient();
  const [alb, setAlb] = useState(1.8);
  const [upcr, setUpcr] = useState(3.5);
  const [chol, setChol] = useState(320);
  const [steroid, setSteroid] = useState("naive");
  const [w, setW] = useState(20);

  const bsa = Math.sqrt(w * 110 / 3600);
  const r1 = (n: number) => Math.round(n * 10) / 10;
  const pred = r1(60 * bsa);
  const predAlt = r1(2 * w);
  const isNS = alb < 2.5 && upcr > 2;

  let cls = "";
  let steroidRec = "";
  let notes = "";

  if (steroid === "naive") {
    steroidRec = `Terapi Awal SN:\nPrednisolon ${pred} mg/hari (60 mg/m²/hr, maks 60 mg) dibagi q8-12h × 4–6 minggu\n→ Lanjut 40 mg/m² selang sehari × 4–6 minggu\nTotal 2–3 bulan`;
  } else if (steroid === "day28") {
    const remission = upcr < 0.2;
    cls = remission ? "✅ REMISI (protein negatif/trace)" : "🔴 Steroid Resisten (masih proteinuria setelah 4 mgg)";
    if (!remission) steroidRec = "→ Pertimbangkan biopsi ginjal dan imunosupresi alternatif (Siklofosfamid/Takrolimus/Rituximab)";
  } else if (steroid === "relapse") {
    steroidRec = `Terapi Relaps:\nPrednisolon ${pred} mg/hari sampai remisi (protein negatif ×3 hari berturut-turut)\n→ Lanjut ${r1(pred * 0.67)} mg selang sehari × 4 minggu`;
  } else if (steroid === "remission") {
    cls = upcr < 0.2 ? "✅ Masih Remisi" : "⚠️ Relaps — ulangi terapi steroid";
  }

  notes = `${isNS ? "✅ Kriteria SN terpenuhi (albumin <2.5, UPCR >2)" : "⚠️ Kriteria SN belum lengkap"}\nAlbumin: ${alb} g/dL | UPCR: ${upcr} | Kol: ${chol} mg/dL\n${cls ? `Status: ${cls}` : ""}${steroidRec ? `\n${steroidRec}` : ""}`;

  return (
    <CalcCard title="Sindrom Nefrotik — Kriteria & Respon" subtitle="Diagnosis, remisi, relaps" icon="🌊" color="yellow">
      <div className="space-y-3">
        <InfoBox>Kriteria SN: Proteinuria masif (UPCR &gt;2 atau protein 24j &gt;40 mg/m²/jam) + Hipoalbuminemia (&lt;2.5 g/dL) + Edema.</InfoBox>
        <div className="grid grid-cols-3 gap-3">
          <CalcInput label="Albumin serum (g/dL)" value={alb} onChange={(v) => setAlb(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} step={0.1} />
          <CalcInput label="UPCR" value={upcr} onChange={(v) => setUpcr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} step={0.1} />
          <CalcInput label="Kolesterol (mg/dL)" value={chol} onChange={(v) => setChol(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CalcSelect label="Status Steroid" value={steroid} onChange={setSteroid} options={[
            { value: "naive", label: "Naive (belum pernah)" },
            { value: "day7", label: "Hari 7–14 terapi" },
            { value: "day28", label: "Hari 28 terapi" },
            { value: "remission", label: "Sudah remisi sebelumnya" },
          ]} />
          <CalcInput label="BB (kg)" unit="kg" value={w} onChange={(v) => setW(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} />
        </div>
        <CalcResult color="yellow">
          <div className="whitespace-pre-line text-xs leading-relaxed text-foreground">
            {notes}
          </div>
        </CalcResult>
      </div>
    </CalcCard>
  );
}
