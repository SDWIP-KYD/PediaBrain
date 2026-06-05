"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function CrClCalc() {
  const { weightGram, ageMonths } = usePatient();
  const [scr, setScr] = useState(0.5);

  const wt = weightGram / 1000;
  const age = Math.max(ageMonths / 12, 1);
  const crcl = ((140 - age) * wt) / (72 * scr);

  return (
    <CalcCard title="CrCl (Cockcroft-Gault)" icon="🫘">
      <div className="space-y-3">
        <CalcInput label="Serum Creatinine (mg/dL)" unit="mg/dL" value={scr} onChange={(v) => setScr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.1} step={0.1} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="CrCl" value={`${Math.round(crcl)} mL/min`} />
            <ResultItem label="Est. GFR" value={`${Math.round(crcl * 0.65)} mL/min/1.73m²`} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          Cockcroft-Gault: CrCl = ((140 − usia) × BB) / (72 × Scr).
          Untuk wanita, kalikan 0.85. Rumus ini tidak optimal untuk anak &lt;12 tahun.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
