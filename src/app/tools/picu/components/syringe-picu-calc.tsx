"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

const drugs = [
  { value: "dopamine", label: "Dopamin", range: "Low: 1-5 (renal), Mid: 5-10 (inotrop), High: >10 (vasokonstr)" },
  { value: "dobutamine", label: "Dobutamin", range: "2.5-20 mcg/kg/min" },
  { value: "epinephrine", label: "Epinefrin", range: "Low: 0.01-0.1 (β), High: >0.3 (α+β)" },
  { value: "norepinephrine", label: "Norepinefrin", range: "0.05-2 mcg/kg/min" },
  { value: "vasopressin", label: "Vasopresin", range: "0.0003-0.002 unit/kg/min (UNITS!)" },
  { value: "milrinone", label: "Milrinon", range: "Loading 50 mcg/kg → 0.25-0.75 mcg/kg/min" },
  { value: "salbutamol", label: "Salbutamol", range: "0.1-1 mcg/kg/min" },
  { value: "lidocaine", label: "Lidokain", range: "20-50 mcg/kg/min" },
  { value: "amiodarone", label: "Amiodaron", range: "5 mg/kg loading → 5-15 mcg/kg/min" },
];

export function SyringePICUCalc() {
  const { weightGram } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [drug, setDrug] = useState("dopamine");
  const [dose, setDose] = useState(5);
  const [vol, setVol] = useState(50);

  const drugMg = +(dose * w * 6).toFixed(2);
  const conc = vol > 0 ? +(drugMg / vol).toFixed(3) : 0;
  const rate = dose; // 1 mL/hr = 1 mcg/kg/min (Rule of 6)
  const info = drugs.find((d) => d.value === drug);

  return (
    <CalcCard title="Syringe Pump (Rule of 6)" subtitle="Drug infusion calculator" icon="💉" color="teal">
      <InfoBox>
        <strong>Rule of 6:</strong> [Dosis × BB × 6] mg dalam syringe → 1 mL/hr = 1 mcg/kg/min
      </InfoBox>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcSelect label="Obat" value={drug} onChange={setDrug} options={drugs.map((d) => ({ value: d.value, label: d.label }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Target (mcg/kg/min)" value={dose} onChange={(v) => setDose(v as number)} step={0.01} />
        <CalcSelect label="Volume Syringe" value={vol.toString()} onChange={(v) => setVol(parseInt(v))} options={[{ value: "50", label: "50 mL" }, { value: "20", label: "20 mL" }, { value: "10", label: "10 mL" }]} />
      </div>
      <CalcResult color="teal">
        <ResultGrid cols={3}>
          <ResultItem label="Obat dalam syringe" value={`${drugMg}`} unit="mg" />
          <ResultItem label="Rate" value={`${rate}`} unit="mL/jam" />
          <ResultItem label="Konsentrasi" value={`${conc}`} unit="mg/mL" />
        </ResultGrid>
        {info && <p className="text-[10px] text-muted-foreground">{info.range}</p>}
      </CalcResult>
    </CalcCard>
  );
}
