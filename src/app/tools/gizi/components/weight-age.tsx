"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const sexOptions = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
];

export function WeightAgeCalc() {
  const { weightGram, ageMonths, sex } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [age, setAge] = useState(ageMonths);
  const [selectedSex, setSelectedSex] = useState<"L" | "P">(sex);

  const ageYr = age / 12;
  const medianWeight = selectedSex === "L"
    ? (ageYr < 1 ? 3.5 + ageYr * 4.5 : ageYr < 5 ? 10 + (ageYr - 1) * 2.5 : 18 + (ageYr - 5) * 3)
    : (ageYr < 1 ? 3.3 + ageYr * 4.2 : ageYr < 5 ? 9.5 + (ageYr - 1) * 2.3 : 17 + (ageYr - 5) * 2.8);

  const zScore = medianWeight > 0 ? (weight - medianWeight) / (medianWeight * 0.15) : 0;

  let status: { label: string; color: string };
  if (zScore < -3) status = { label: "Severely Underweight", color: "text-red-500" };
  else if (zScore < -2) status = { label: "Underweight", color: "text-orange-400" };
  else if (zScore < 2) status = { label: "Normal", color: "text-green-400" };
  else if (zScore < 3) status = { label: "Overweight", color: "text-yellow-400" };
  else status = { label: "Obese", color: "text-red-400" };

  return (
    <CalcCard title="Weight-for-Age Z-Score" icon="📊">
      <div className="space-y-3">
        <CalcSelect label="Jenis Kelamin" value={selectedSex} onChange={(v) => setSelectedSex(v as "L" | "P")} options={sexOptions} />
        <CalcInput label="Usia (bulan)" unit="bln" value={age} onChange={(v) => setAge(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={228} />
        <CalcInput label="Berat Badan (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.1} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Z-Score" value={zScore.toFixed(2)} />
            <ResultItem label="Status" value={status.label} className={status.color} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          WHO Growth Standards: Z &lt;-2 = underweight, Z &lt;-3 = severely underweight. Median berat ≈ {medianWeight.toFixed(1)} kg untuk usia {age} bulan.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
