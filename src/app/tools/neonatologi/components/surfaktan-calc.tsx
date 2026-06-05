"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

export function SurfaktanCalc() {
  const { weightGram } = usePatient();
  const [wt, setWt] = useState(weightGram);
  const [type, setType] = useState("curosurf1");

  useEffect(() => setWt(weightGram), [weightGram]);

  const wtKg = wt / 1000;
  let doseMg = 0;
  let conc = 0;
  let label = "";

  if (type === "curosurf1") {
    doseMg = 200 * wtKg;
    conc = 80;
    label = "Curosurf Dosis 1 (200 mg/kg)";
  } else if (type === "curosurf2") {
    doseMg = 100 * wtKg;
    conc = 80;
    label = "Curosurf Dosis 2/3 (100 mg/kg)";
  } else {
    doseMg = 100 * wtKg;
    conc = 25;
    label = "Beractant/Survanta (100 mg/kg)";
  }

  const vol = +(doseMg / conc).toFixed(2);

  return (
    <CalcCard title="Surfaktan" subtitle="Poractant alfa (Curosurf) / Beractant" icon="🫧" color="cyan">
      <InfoBox>
        <strong>Curosurf:</strong> 80 mg/mL. Dosis 1: 200 mg/kg; Dosis 2-3: 100 mg/kg.
        <br />
        <strong>Beractant (Survanta):</strong> 25 mg/mL. Dosis: 100 mg/kg.
      </InfoBox>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(v as number)} unit="g" />
        <CalcSelect
          label="Jenis Surfaktan"
          value={type}
          onChange={setType}
          options={[
            { value: "curosurf1", label: "Curosurf Dosis 1" },
            { value: "curosurf2", label: "Curosurf Dosis 2/3" },
            { value: "beractant", label: "Beractant/Survanta" },
          ]}
        />
      </div>
      <CalcResult color="cyan">
        <ResultGrid cols={2}>
          <ResultItem label="Dosis" value={`${doseMg}`} unit="mg" />
          <ResultItem label="Volume" value={`${vol}`} unit="mL" note={`${conc} mg/mL`} />
        </ResultGrid>
      </CalcResult>
    </CalcCard>
  );
}
