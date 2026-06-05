"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

const conditions = [
  { value: "dka", label: "DKA" },
  { value: "stress", label: "Stress Hyperglycemia" },
  { value: "hhs", label: "HHS (jarang pada anak)" },
];

export function InsulinCalc() {
  const { weightGram } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [gds, setGDS] = useState(400);
  const [cond, setCond] = useState("dka");

  let rate = 0;
  let protocol = "";

  if (cond === "dka") {
    rate = +(0.05 * w).toFixed(3);
    protocol = `1) Cairan: NS ${Math.round(10 * w)} mL/kg dalam 1 jam → 1-1.5× maintenance.
2) Insulin: Mulai 1-2 jam SETELAH cairan. TANPA BOLUS pada anak!
3) Infus ${rate} unit/jam (0.05-0.1 unit/kg/hr).
4) Tambah D10 jika GDS <250.
5) Monitor K⁺ q2hr. Koreksi K <3.5 SEBELUM insulin.
6) Target: GDS turun maks 100 mg/dL/jam.`;
  } else if (cond === "stress") {
    rate = +(0.02 * w).toFixed(3);
    protocol = `Target GDS 140-180 mg/dL.
Infus ${rate} unit/jam → titrate q1jam.
Monitor GDS q1-2 jam sampai stabil, lalu q4jam.`;
  } else {
    rate = +(0.025 * w).toFixed(3);
    protocol = `Langka pada anak.
Cairan: NS → D5NS jika GDS <300.
Koreksi SANGAT lambat (48-72 jam).
Insulin: ${rate} unit/jam (sangat rendah).
Target osmolalitas turun maks 3 mOsm/kg/hr.`;
  }

  return (
    <CalcCard title="Insulin Infus" subtitle="DKA, stress hyperglycemia" icon="💉" color="yellow">
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcInput label="GDS (mg/dL)" value={gds} onChange={(v) => setGDS(v as number)} />
        <CalcSelect label="Kondisi" value={cond} onChange={setCond} options={conditions} />
      </div>
      <CalcResult color="yellow">
        <ResultGrid cols={1}>
          <ResultItem label="Insulin Infus Rate" value={`${rate}`} unit="unit/jam" note={`0.05 unit/kg/hr`} />
        </ResultGrid>
        <div className="text-[11px] text-muted-foreground whitespace-pre-line leading-relaxed">
          {protocol}
        </div>
        {cond === "dka" && (
          <ResultAlert type="danger">
            ⚠️ TANPA BOLUS insulin pada anak! Koreksi K⁺ dulu jika {"<"}3.5 mEq/L.
          </ResultAlert>
        )}
      </CalcResult>
    </CalcCard>
  );
}
