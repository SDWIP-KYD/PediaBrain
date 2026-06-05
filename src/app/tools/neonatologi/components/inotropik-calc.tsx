"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { useCalculatorLink } from "../../calculator-link-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

interface InoDrug {
  name: string;
  concentration: string;
  range: string;
}

const inoDrugs: Record<string, InoDrug> = {
  dopamine: { name: "Dopamin", concentration: "40 mg/mL", range: "Low: 1-5 (renal)\nMid: 5-10 (inotrop)\nHigh: >10 (vasokonstr)" },
  dobutamine: { name: "Dobutamin", concentration: "12.5 mg/mL", range: "Inotrop: 5-20 mcg/kg/mnt" },
  epinephrine: { name: "Epinefrin", concentration: "1 mg/mL", range: "Low: 0.05-0.1 (β)\nHigh: >0.3 (α+β)" },
  norepinephrine: { name: "Norepinefrin", concentration: "1 mg/mL", range: "0.05-2 mcg/kg/mnt\nVasopresor" },
};

export function InotropikCalc() {
  const { weightGram } = usePatient();
  const { setOutput } = useCalculatorLink();
  const [wt, setWt] = useState(weightGram);
  const [drug, setDrug] = useState("dopamine");
  const [dose, setDose] = useState(5);
  const [vol, setVol] = useState(50);

  useEffect(() => setWt(weightGram), [weightGram]);

  const wtKg = wt / 1000;
  const drugMg = +(dose * wtKg * 6).toFixed(2);
  const concActual = vol > 0 ? +(drugMg / vol).toFixed(3) : 0;
  const finalRate = concActual > 0 ? +(dose * wtKg * 6 / concActual / (vol > 0 ? vol / vol : 1)).toFixed(2) : 0;
  // Rule of 6: drug mg in vol mL → rate mL/hr = dose mcg/kg/min
  const rate = vol > 0 ? +(dose * wtKg * 6 / (drugMg / vol)).toFixed(2) : 0;

  const info = inoDrugs[drug];

  // Publish output for linking
  useEffect(() => {
    if (drugMg > 0) {
      setOutput("inotropik", `${info.name} rate`, `${rate}`, "mL/jam");
    }
  }, [drugMg, rate, info.name, setOutput]);

  return (
    <CalcCard title="Inotropik / Vasopresor" subtitle="Syringe Pump Calculator" icon="❤️" color="red">
      <InfoBox>
        Rule of 6: [Dosis mcg/kg/mnt × BB kg × 6] mg dalam 100 mL → 1 mL/jam = 1 mcg/kg/mnt
      </InfoBox>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(v as number)} unit="g" />
        <CalcSelect
          label="Obat"
          value={drug}
          onChange={setDrug}
          options={Object.entries(inoDrugs).map(([k, v]) => ({ value: k, label: v.name }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Dosis (mcg/kg/mnt)" value={dose} onChange={(v) => setDose(v as number)} step={0.01} />
        <CalcSelect
          label="Volume Syringe"
          value={vol.toString()}
          onChange={(v) => setVol(parseInt(v))}
          options={[
            { value: "50", label: "50 mL" },
            { value: "20", label: "20 mL" },
            { value: "10", label: "10 mL" },
          ]}
        />
      </div>
      <CalcResult color="red">
        <ResultGrid cols={3}>
          <ResultItem label="Obat dalam syringe" value={`${drugMg}`} unit="mg" />
          <ResultItem label="Rate" value={`${rate}`} unit="mL/jam" />
          <ResultItem label="Konsentrasi" value={`${concActual}`} unit="mg/mL" />
        </ResultGrid>
        <p className="text-[10px] text-muted-foreground whitespace-pre-line">{info.range}</p>
      </CalcResult>
    </CalcCard>
  );
}
