"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const sexOptions = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
];

export function HeightAgeCalc() {
  const { heightCm, ageMonths, sex } = usePatient();
  const [height, setHeight] = useState(heightCm);
  const [age, setAge] = useState(ageMonths);
  const [selectedSex, setSelectedSex] = useState<"L" | "P">(sex);

  const ageYr = age / 12;
  const medianHeight = selectedSex === "L"
    ? (ageYr < 1 ? 50 + ageYr * 25 : ageYr < 5 ? 75 + (ageYr - 1) * 7 : 103 + (ageYr - 5) * 6)
    : (ageYr < 1 ? 49 + ageYr * 24 : ageYr < 5 ? 73 + (ageYr - 1) * 7 : 101 + (ageYr - 5) * 6);

  const zScore = medianHeight > 0 ? (height - medianHeight) / (medianHeight * 0.04) : 0;

  let status: { label: string; color: string };
  if (zScore < -3) status = { label: "Severely Stunted", color: "text-red-500" };
  else if (zScore < -2) status = { label: "Stunted", color: "text-orange-400" };
  else if (zScore < 2) status = { label: "Normal", color: "text-green-400" };
  else status = { label: "Tall", color: "text-yellow-400" };

  return (
    <CalcCard title="Height-for-Age Z-Score" icon="📏">
      <div className="space-y-3">
        <CalcSelect label="Jenis Kelamin" value={selectedSex} onChange={(v) => setSelectedSex(v as "L" | "P")} options={sexOptions} />
        <CalcInput label="Usia (bulan)" unit="bln" value={age} onChange={(v) => setAge(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={228} />
        <CalcInput label="Tinggi Badan (cm)" unit="cm" value={height} onChange={(v) => setHeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={30} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Z-Score" value={zScore.toFixed(2)} />
            <ResultItem label="Status" value={status.label} className={status.color} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          WHO: Z &lt;-2 = stunting, Z &lt;-3 = severely stunted. Median tinggi ≈ {medianHeight.toFixed(1)} cm untuk usia {age} bulan.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
