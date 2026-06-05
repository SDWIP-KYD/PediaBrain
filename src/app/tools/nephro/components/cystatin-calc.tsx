"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function CystatinCCalc() {
  const { ageMonths } = usePatient();
  const [cysC, setCysC] = useState(0.8);
  const [scr, setScr] = useState(0.5);

  const ageYr = ageMonths / 12;
  const heightCm = 100;

  const eGFR = (86.7 / cysC) - 4.2;
  const eGFRCombo = (135 * Math.pow(cysC, -0.544) * Math.pow(scr, -0.323) * (ageYr <= 14 ? 1.0 : 0.973));

  return (
    <CalcCard title="Cystatin C GFR" icon="🫘">
      <div className="space-y-3">
        <CalcInput label="Cystatin C (mg/L)" unit="mg/L" value={cysC} onChange={(v) => setCysC(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.1} step={0.1} />
        <CalcInput label="Serum Creatinine (mg/dL)" unit="mg/dL" value={scr} onChange={(v) => setScr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.1} step={0.1} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Cystatin C only" value={`${Math.round(eGFR)} mL/min/1.73m²`} />
            <ResultItem label="Combined (Scr + CysC)" value={`${Math.round(eGFRCombo)} mL/min/1.73m²`} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          Cystatin C tidak dipengaruhi oleh massa otot. Berguna untuk validasi GFR dari CrCl atau bila Scr tidak reliabel.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
