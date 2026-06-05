"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

const mortalityTable: [number, string][] = [
  [0, "<1%"], [5, "5%"], [10, "12%"], [15, "25%"], [20, "45%"], [25, "70%"],
];

export function PRISMCalc() {
  const { ageYears } = usePatient();
  const [age, setAge] = useState(ageYears);
  const [sysMin, setSysMin] = useState(80);
  const [hrMax, setHRMax] = useState(140);
  const [gcs, setGCS] = useState(14);
  const [pf, setPF] = useState(300);
  const [pt, setPT] = useState(14);
  const [cr, setCR] = useState(0.8);
  const [bili, setBili] = useState(0.5);

  let score = 0;

  // Systolic
  if ((age < 1 && sysMin < 55) || (age >= 1 && age < 5 && sysMin < 65) || (age >= 5 && age < 12 && sysMin < 75) || (age >= 12 && sysMin < 85)) score += 6;

  // HR
  if ((age < 5 && hrMax > 150) || (age >= 5 && hrMax > 130)) score += 4;

  // GCS
  if (gcs < 8) score += 6;
  else if (gcs <= 10) score += 2;

  // PF
  if (pf < 100) score += 6;
  else if (pf < 200) score += 4;

  // PT
  if (pt > 22) score += 6;

  // Creatinine
  if (cr > 3.5) score += 6;
  else if (cr >= 1.5) score += 4;

  // Bilirubin
  if (bili > 5) score += 6;

  let risk = "";
  if (score < 5) risk = "Risiko Rendah";
  else if (score < 10) risk = "Risiko Sedang";
  else if (score < 15) risk = "Risiko Tinggi";
  else risk = "Risiko Sangat Tinggi";

  let mortality = "<1%";
  for (const [s, m] of mortalityTable) {
    if (score >= s) mortality = m;
  }

  return (
    <CalcCard title="PRISM-III" subtitle="Pediatric risk of mortality" icon="📊" color="red">
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="Usia (thn)" value={age} onChange={(v) => setAge(v as number)} />
        <CalcInput label="Sistole Min" value={sysMin} onChange={(v) => setSysMin(v as number)} />
        <CalcInput label="HR Max" value={hrMax} onChange={(v) => setHRMax(v as number)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="GCS" value={gcs} onChange={(v) => setGCS(v as number)} min={3} max={15} />
        <CalcInput label="PF Ratio" value={pf} onChange={(v) => setPF(v as number)} />
        <CalcInput label="PT (detik)" value={pt} onChange={(v) => setPT(v as number)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Kreatinin (mg/dL)" value={cr} onChange={(v) => setCR(v as number)} step={0.1} />
        <CalcInput label="Bilirubin (mg/dL)" value={bili} onChange={(v) => setBili(v as number)} step={0.1} />
      </div>
      <CalcResult color="red">
        <ResultGrid cols={2}>
          <ResultItem label="PRISM-III Score" value={`${score}`} />
          <ResultItem label="Mortalitas" value={mortality} />
          <ResultItem label="Kategori" value={risk} />
        </ResultGrid>
      </CalcResult>
    </CalcCard>
  );
}
