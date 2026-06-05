"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function BMICalc() {
  const { weightGram, heightCm, ageMonths } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [height, setHeight] = useState(heightCm);

  const bmi = height > 0 ? weight / ((height / 100) ** 2) : 0;
  const ageYr = ageMonths / 12;

  let category: { label: string; color: string };
  if (ageYr < 2) {
    category = { label: "Gunakan WHO z-score", color: "text-yellow-400" };
  } else if (bmi < 18.5) {
    category = { label: "Underweight", color: "text-yellow-400" };
  } else if (bmi < 25) {
    category = { label: "Normal", color: "text-green-400" };
  } else if (bmi < 30) {
    category = { label: "Overweight", color: "text-orange-400" };
  } else {
    category = { label: "Obese", color: "text-red-400" };
  }

  return (
    <CalcCard title="BMI Calculator" icon="⚖️">
      <div className="space-y-3">
        <CalcInput label="Berat Badan (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.1} />
        <CalcInput label="Tinggi Badan (cm)" unit="cm" value={height} onChange={(v) => setHeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={30} />
        <InfoBox>BMI = Berat (kg) / Tinggi (m)². Anak &lt;2 tahun: gunakan WHO weight-for-height z-score.</InfoBox>
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="BMI" value={bmi.toFixed(1)} unit="kg/m²" />
            <ResultItem label="Kategori" value={category.label} className={category.color} />
          </ResultGrid>
        </CalcResult>
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <strong className="text-foreground">Klasifikasi BMI Anak (2-18 tahun):</strong>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>• <span className="text-yellow-400">&lt;5 percentile</span> — Underweight</li>
            <li>• <span className="text-green-400">5-85 percentile</span> — Normal</li>
            <li>• <span className="text-orange-400">85-95 percentile</span> — Overweight</li>
            <li>• <span className="text-red-400">&gt;95 percentile</span> — Obese</li>
          </ul>
        </div>
      </div>
    </CalcCard>
  );
}
