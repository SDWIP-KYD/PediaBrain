"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const sexOptions = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
];

export function WeightHeightCalc() {
  const { weightGram, heightCm, sex } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [height, setHeight] = useState(heightCm);
  const [selectedSex, setSelectedSex] = useState<"L" | "P">(sex);

  const medianWH = selectedSex === "L"
    ? (height < 87 ? 7.5 + (height - 65) * 0.25 : 13 + (height - 87) * 0.35)
    : (height < 85 ? 7 + (height - 63) * 0.23 : 12 + (height - 85) * 0.33);

  const zScore = medianWH > 0 ? (weight - medianWH) / (medianWH * 0.12) : 0;

  let status: { label: string; color: string };
  if (zScore < -3) status = { label: "Severely Wasted", color: "text-red-500" };
  else if (zScore < -2) status = { label: "Wasted", color: "text-orange-400" };
  else if (zScore < 2) status = { label: "Normal", color: "text-green-400" };
  else if (zScore < 3) status = { label: "Overweight", color: "text-yellow-400" };
  else status = { label: "Obese", color: "text-red-400" };

  return (
    <CalcCard title="Weight-for-Height Z-Score" icon="⚖️">
      <div className="space-y-3">
        <CalcSelect label="Jenis Kelamin" value={selectedSex} onChange={(v) => setSelectedSex(v as "L" | "P")} options={sexOptions} />
        <CalcInput label="Tinggi Badan (cm)" unit="cm" value={height} onChange={(v) => setHeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={45} max={120} />
        <CalcInput label="Berat Badan (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={2} step={0.1} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Z-Score" value={zScore.toFixed(2)} />
            <ResultItem label="Status" value={status.label} className={status.color} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          WHO: Z &lt;-2 = wasting, Z &lt;-3 = severely wasted. Ini mengukur wasting akut (malnutrisi akut).
        </InfoBox>
      </div>
    </CalcCard>
  );
}
