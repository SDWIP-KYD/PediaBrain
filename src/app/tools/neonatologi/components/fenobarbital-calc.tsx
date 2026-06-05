"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

export function FenobarbitalCalc() {
  const { weightGram } = usePatient();
  const [wt, setWt] = useState(weightGram);
  const [doseType, setDoseType] = useState("20");

  useEffect(() => setWt(weightGram), [weightGram]);

  const wtKg = wt / 1000;
  const doseMg = parseFloat(doseType) * wtKg;
  const loadVol = +(doseMg / 200).toFixed(2);
  const m3Mg = +(3 * wtKg).toFixed(1);
  const m3Vol = +(m3Mg / 200).toFixed(2);
  const m5Mg = +(5 * wtKg).toFixed(1);
  const m5Vol = +(m5Mg / 200).toFixed(2);

  return (
    <CalcCard title="Fenobarbital" subtitle="Kejang Neonatus" icon="🧠" color="pink">
      <InfoBox>
        Loading: 20 mg/kgBB IV (maks 40 mg/kg total). Maintenance: 3–5 mg/kg/hari mulai 12–24 jam setelah loading. Sediaan: 200 mg/mL.
      </InfoBox>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(v as number)} unit="g" />
        <CalcSelect
          label="Dosis Loading"
          value={doseType}
          onChange={setDoseType}
          options={[
            { value: "20", label: "20 mg/kg (1st)" },
            { value: "20e", label: "+ 20 mg/kg (2nd, maks)" },
          ]}
        />
      </div>
      <CalcResult color="pink">
        <ResultGrid cols={3}>
          <ResultItem label="Loading" value={`${Math.round(doseMg)}`} unit="mg" note={`${loadVol} mL (200mg/mL)`} />
          <ResultItem label="Maint 3 mg/kg" value={`${m3Mg}`} unit="mg" note={`${m3Vol} mL`} />
          <ResultItem label="Maint 5 mg/kg" value={`${m5Mg}`} unit="mg" note={`${m5Vol} mL`} />
        </ResultGrid>
      </CalcResult>
    </CalcCard>
  );
}
