"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

const conditions = [
  { value: "general", label: "General / Elective" },
  { value: "raised-icp", label: "Raised ICP" },
  { value: "asthma", label: "Status Asthmaticus" },
  { value: "shock", label: "Shock (hemodinamik tidak stabil)" },
];

const r0 = (n: number) => Math.round(n);
const r2 = (n: number) => Math.round(n * 100) / 100;

export function RSICalc() {
  const { weightGram, ageYears } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [cond, setCond] = useState("general");

  const ettUncuffed = ageYears < 1 ? 3.5 : +(ageYears / 4 + 4).toFixed(1);
  const ettCuffed = ageYears < 1 ? 3.5 : +(ageYears / 4 + 3.5).toFixed(1);

  const atropine = Math.max(0.1, +(0.02 * w).toFixed(2));

  let pretreat = "";
  let induction = "";
  let paralytic = "";

  if (cond === "raised-icp") {
    pretreat = `Atropin ${atropine} mg IV + Fentanil ${r0(1.5 * w)} mcg IV + Lidokain ${r0(1.5 * w)} mg IV (3 menit sebelum)`;
    induction = `Propofol ${r0(1.5 * w)} mg IV (1.5-2.5 mg/kg) atau Etomidat ${r2(0.3 * w)} mg IV`;
  } else if (cond === "asthma") {
    pretreat = `Atropin ${atropine} mg IV`;
    induction = `Ketamin ${r0(2 * w)} mg IV (2 mg/kg) + Midazolam ${r2(0.1 * w)} mg`;
  } else if (cond === "shock") {
    pretreat = "Pre-oksigenasi 3-5 menit, NRM 100% O₂, SpO₂ ≥93%";
    induction = `Ketamin ${r0(w)} mg IV (1-2 mg/kg) atau Etomidat ${r2(0.3 * w)} mg IV`;
  } else {
    pretreat = "Pre-oksigenasi 3-5 menit, NRM 100% O₂, SpO₂ ≥93%";
    induction = `Propofol ${r0(2 * w)} mg IV (2-3 mg/kg, maks 200mg) atau Midazolam ${r2(0.2 * w)} mg + Ketamin ${r0(2 * w)} mg`;
  }

  paralytic = `Rokuronium ${r2(1.2 * w)} mg IV (1.2 mg/kg) — first choice. Reversibel Sugammadex ${r0(16 * w)} mg.`;

  return (
    <CalcCard title="RSI Protocol" subtitle="Rapid Sequence Intubation" icon="🫁" color="orange">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcSelect label="Kondisi" value={cond} onChange={setCond} options={conditions} />
      </div>
      <CalcResult color="orange">
        <div className="space-y-2 text-xs">
          <p><strong>🔬 Pretreatment:</strong> {pretreat}</p>
          <p><strong>💉 Induksi:</strong> {induction}</p>
          <p><strong>💉 Paralitik:</strong> {paralytic}</p>
          <p><strong>🩺 ETT:</strong> {ageYears < 1 ? "3.5" : `${ettUncuffed}`} mm (uncuffed) / {ageYears < 1 ? "3.5" : `${ettCuffed}`} mm (cuffed)</p>
        </div>
        <ResultAlert type="warning">
          ⚠️ Sukinilkolin KONTRAINDIKASI: hiperkalemia, denervasi, miopati, luka bakar {">"}24jam, cedera mata terbuka, riwayat keluarga.
        </ResultAlert>
      </CalcResult>
    </CalcCard>
  );
}
