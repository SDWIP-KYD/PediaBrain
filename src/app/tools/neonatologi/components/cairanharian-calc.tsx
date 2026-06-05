"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { useCalculatorLink } from "../../calculator-link-context";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, CalcButton, InfoBox, ResultAlert } from "../../components/calc-ui";

export function CairanHarianCalc() {
  const { weightGram, gestationalAge, ageDays } = usePatient();
  const { setOutput } = useCalculatorLink();
  const [wt, setWt] = useState(weightGram);
  const [ga, setGa] = useState(gestationalAge);
  const [age, setAge] = useState(ageDays);
  const [need, setNeed] = useState(80);
  const [enteral, setEnteral] = useState(0);

  useEffect(() => { setWt(weightGram); setGa(gestationalAge); setAge(ageDays); }, [weightGram, gestationalAge, ageDays]);

  const wtKg = wt / 1000;
  const totalHr = +((need * wtKg) / 24).toFixed(2);
  const ivHr = Math.max(0, +(totalHr - enteral / 24).toFixed(2));
  const rate = ivHr;

  // Publish output for linking
  useEffect(() => {
    if (totalHr > 0) {
      setOutput("cairanharian", "IV rate", `${rate}`, "mL/jam");
    }
  }, [totalHr, rate, setOutput]);

  const warnings: string[] = [];
  if (age <= 2 && need > 100) warnings.push("Hari 1-2: target TFI 60-80 mL/kg/hr. Naikkan bertahap.");
  if (ga < 30 && need > 160) warnings.push("Kehilangan air transepidermal tinggi pada prematur ekstrem. Pertimbangkan humidifikasi inkubator.");

  return (
    <CalcCard title="Kebutuhan Cairan Harian" subtitle="Total Fluid Intake (TFI)" icon="💧" color="blue">
      <InfoBox>
        <strong>Panduan:</strong> Hari 1: 60–80; Hari 2: 80–100; Hari 3–7: 120–150; {">"}1 mgg: 150–180 mL/kg/hari.
      </InfoBox>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(v as number)} unit="g" />
        <CalcInput label="GA (minggu)" value={ga} onChange={(v) => setGa(v as number)} unit="mgg" />
        <CalcInput label="Usia (hari)" value={age} onChange={(v) => setAge(v as number)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Kebutuhan (mL/kg/hr)" value={need} onChange={(v) => setNeed(v as number)} min={40} max={200} />
        <CalcInput label="Asupan Enteral (mL/hr)" value={enteral} onChange={(v) => setEnteral(v as number)} min={0} />
      </div>
      <CalcResult color="blue">
        <ResultGrid cols={3}>
          <ResultItem label="Total Cairan" value={`${totalHr}`} unit="mL/jam" />
          <ResultItem label="IV Tambahan" value={`${ivHr}`} unit="mL/jam" />
          <ResultItem label="Rate Syringe" value={`${rate}`} unit="mL/jam" />
        </ResultGrid>
        {warnings.length > 0 && warnings.map((w, i) => (
          <ResultAlert key={i} type="warning">⚠️ {w}</ResultAlert>
        ))}
      </CalcResult>
    </CalcCard>
  );
}
