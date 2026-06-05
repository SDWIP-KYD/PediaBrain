"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, CalcButton, InfoBox } from "../../components/calc-ui";

export function KafeinCalc() {
  const { weightGram } = usePatient();
  const [wt, setWt] = useState(weightGram);
  const [dose, setDose] = useState("5");

  useEffect(() => setWt(weightGram), [weightGram]);

  const wtKg = wt / 1000;
  const loadMg = Math.round(20 * wtKg);
  const loadMl = +(loadMg / 20).toFixed(2);
  const mainMg = Math.round(parseFloat(dose) * wtKg);
  const mainMl = +(mainMg / 20).toFixed(2);

  return (
    <CalcCard title="Kafein Sitrat" subtitle="Apnea of Prematurity" icon="☕" color="purple">
      <InfoBox>
        <strong>Sediaan:</strong> 20 mg/mL. Loading 20 mg/kgBB → maintenance 5–10 mg/kgBB/hari PO/IV.
      </InfoBox>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(v as number)} unit="g" />
        <CalcSelect
          label="Dosis maintenance"
          value={dose}
          onChange={setDose}
          options={[
            { value: "5", label: "5 mg/kg (standar)" },
            { value: "10", label: "10 mg/kg (tinggi)" },
          ]}
        />
      </div>
      <CalcResult color="purple">
        <ResultGrid cols={2}>
          <ResultItem label="Loading" value={`${loadMg}`} unit="mg" note={`${loadMl} mL (20mg/mL)`} />
          <ResultItem label="Maintenance" value={`${mainMg}`} unit="mg" note={`${mainMl} mL (20mg/mL)`} />
        </ResultGrid>
      </CalcResult>
    </CalcCard>
  );
}
