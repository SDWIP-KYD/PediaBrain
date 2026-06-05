"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

const statuses = [
  { value: "normal", label: "Normal", calD1: 60, calD4: 110, pro: 1.5 },
  { value: "malnourished", label: "Malnourished", calD1: 90, calD4: 110, pro: 2.5 },
  { value: "sepsis", label: "Sepsis", calD1: 70, calD4: 90, pro: 2.0 },
  { value: "obese", label: "Obese", calD1: 60, calD4: 110, pro: 1.5 },
];

export function NutrisiPICUCalc() {
  const { weightGram } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [day, setDay] = useState(1);
  const [status, setStatus] = useState("normal");

  const s = statuses.find((s) => s.value === status)!;
  const calPkg = day <= 3 ? s.calD1 : s.calD4;
  const kcal = Math.round(calPkg * w);
  const proG = +(s.pro * w).toFixed(1);
  const enRate = +(kcal / 24).toFixed(1);
  const girTarget = status === "sepsis" ? 5 : 6;

  return (
    <CalcCard title="Nutrisi PICU" subtitle="Calorie & protein requirements" icon="🍼" color="orange">
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcInput label="Hari ke-" value={day} onChange={(v) => setDay(v as number)} />
        <CalcSelect label="Status" value={status} onChange={setStatus} options={statuses.map((s) => ({ value: s.value, label: s.label }))} />
      </div>
      <CalcResult color="orange">
        <ResultGrid cols={2}>
          <ResultItem label="Kalori" value={`${kcal}`} unit="kkal/hari" note={`${calPkg} kkal/kg/hr`} />
          <ResultItem label="Protein" value={`${proG}`} unit="g/hari" note={`${s.pro} g/kg/hr`} />
          <ResultItem label="EN Rate" value={`${enRate}`} unit="mL/jam" note="asumsi 1 kkal/mL" />
          <ResultItem label="GIR Target" value={`${girTarget}`} unit="mg/kg/mnt" />
        </ResultGrid>
      </CalcResult>
    </CalcCard>
  );
}
