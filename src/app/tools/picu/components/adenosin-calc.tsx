"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

export function AdenosinCalc() {
  const { weightGram } = usePatient();
  const [w, setW] = useState(weightGram / 1000);

  const d1 = Math.min(6, +(0.1 * w).toFixed(2));
  const d2 = Math.min(12, +(0.2 * w).toFixed(2));
  const d3 = Math.min(18, +(0.3 * w).toFixed(2));
  const v1 = +(d1 / 3).toFixed(2);
  const v2 = +(d2 / 3).toFixed(2);
  const v3 = +(d3 / 3).toFixed(2);

  return (
    <CalcCard title="Adenosin SVT" subtitle="SVT conversion dosing" icon="💊" color="purple">
      <InfoBox>
        Sediaan 3 mg/mL. Bolus sangat cepat (1-2 detik) + flush 10-20 mL NS. Masa paruh {"<"}10 detik.
      </InfoBox>
      <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
      <CalcResult color="purple">
        <ResultGrid cols={3}>
          <ResultItem label="Dosis 1" value={`${d1}`} unit="mg" note={`${v1} mL`} />
          <ResultItem label="Dosis 2" value={`${d2}`} unit="mg" note={`${v2} mL`} />
          <ResultItem label="Dosis 3 (maks)" value={`${d3}`} unit="mg" note={`${v3} mL`} />
        </ResultGrid>
      </CalcResult>
    </CalcCard>
  );
}
