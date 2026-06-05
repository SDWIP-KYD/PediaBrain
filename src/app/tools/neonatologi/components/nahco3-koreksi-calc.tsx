"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

export function NaHCO3KoreksiCalc() {
  const { weightGram } = usePatient();
  const [wt, setWt] = useState(weightGram);
  const [actualHCO3, setActualHCO3] = useState(14);
  const [targetHCO3, setTargetHCO3] = useState(20);

  useEffect(() => setWt(weightGram), [weightGram]);

  const wtKg = wt / 1000;
  const totalDeficit = +((0.3 * wtKg * (targetHCO3 - actualHCO3)).toFixed(1));
  const halfDose = +(totalDeficit / 2).toFixed(1);
  const volNaHCO3_42 = halfDose.toFixed(1);
  const volNaHCO3_84 = totalDeficit.toFixed(1);

  return (
    <CalcCard title="Koreksi NaHCO₃" subtitle="Asidosis Metabolik Neonatus" icon="⚗️" color="green">
      <InfoBox>
        Defisit bikarbonat = 0.3 × BB(kg) × (24 − HCO₃ aktual). Berikan ½ dosis dulu, evaluasi ulang. PASTIKAN ventilasi adekuat.
      </InfoBox>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(v as number)} unit="g" />
        <CalcInput label="HCO₃ Aktual (mEq/L)" value={actualHCO3} onChange={(v) => setActualHCO3(v as number)} />
        <CalcInput label="HCO₃ Target (mEq/L)" value={targetHCO3} onChange={(v) => setTargetHCO3(v as number)} />
      </div>
      <CalcResult color="green">
        <ResultGrid cols={3}>
          <ResultItem label="Total Defisit" value={`${totalDeficit}`} unit="mEq" />
          <ResultItem label="½ Dosis (dulu)" value={`${halfDose}`} unit="mEq" />
          <ResultItem label="NaHCO₃ 4.2% (½)" value={`${volNaHCO3_42}`} unit="mL" />
        </ResultGrid>
        <ResultGrid cols={1}>
          <ResultItem label="NaHCO₃ 8.4% (total)" value={`${volNaHCO3_84}`} unit="mL" note="1 mEq = 1 mL (8.4%)" />
        </ResultGrid>
        <ResultAlert type="warning">
          ⚠️ Neonatus: encerkan 1:1 NaHCO₃ 8.4% dengan akuades → NaHCO₃ 4.2% (½ dosis). Berikan IV pelan ≥30 menit. Jangan campur dengan Ca.
        </ResultAlert>
      </CalcResult>
    </CalcCard>
  );
}
