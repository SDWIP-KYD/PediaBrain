"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const sexOptions = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
];

const meanWeightMale = [3.3,4.5,5.6,6.4,7.0,7.5,7.9,8.3,8.6,8.9,9.2,9.4,9.6,9.9,10.1,10.3,10.5,10.7,10.9,11.1,11.3,11.5,11.7,11.9,12.1,12.3,12.5,12.7,12.9,13.1,13.3,13.5,13.7,13.9,14.1,14.3,14.5,14.7,14.9,15.1,15.3,15.5,15.7,15.9,16.1,16.3,16.5,16.7,16.9,17.1,17.3,17.5,17.7,17.9,18.1,18.3,18.5,18.7,18.9,19.1,19.3];
const meanWeightFemale = [3.2,4.2,5.1,5.8,6.4,6.9,7.3,7.6,7.9,8.2,8.5,8.7,9.0,9.2,9.4,9.6,9.8,10.0,10.2,10.4,10.6,10.8,11.0,11.2,11.4,11.6,11.8,12.0,12.2,12.4,12.6,12.8,13.0,13.2,13.4,13.6,13.8,14.0,14.2,14.4,14.6,14.8,15.0,15.2,15.4,15.6,15.8,16.0,16.2,16.4,16.6,16.8,17.0,17.2,17.4,17.6,17.8,18.0,18.2,18.4,18.6];

function lookup(table: number[], ageMonth: number): number {
  const idx = Math.min(Math.max(0, Math.round(ageMonth)), table.length - 1);
  return table[idx] ?? 15;
}

export function WeightAgeCalc() {
  const { weightGram, ageMonths, sex } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [age, setAge] = useState(ageMonths);
  const [selectedSex, setSelectedSex] = useState<"L" | "P">(sex);

  const sexKey = selectedSex === "L" ? "m" : "f";
  const ageMo = Math.min(Math.round(age), 60);
  const medianWeight = lookup(sexKey === "m" ? meanWeightMale : meanWeightFemale, ageMo);
  const sdW = sexKey === "m" ? 1.2 : 1.1;
  const zScore = sdW > 0 ? (weight - medianWeight) / sdW : 0;

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
            <ResultItem label="Z-Score" value={zScore.toFixed(2)} className={zScore < -2 ? "text-red-500" : zScore > 2 ? "text-orange-400" : "text-emerald-500"} />
            <ResultItem label="Status" value={status.label} className={status.color} />
          </ResultGrid>
          <ResultGrid cols={2}>
            <ResultItem label="Median BB" value={`${medianWeight.toFixed(1)} kg`} note={`Usia: ${age} bulan`} />
            <ResultItem label="SD" value={`${sdW} kg`} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          WHO Growth Standards: Z &lt;-2 = underweight, Z &lt;-3 = severely underweight. Median berat = {medianWeight.toFixed(1)} kg untuk usia {age} bulan ({selectedSex === "L" ? "Laki-laki" : "Perempuan"}).
        </InfoBox>
      </div>
    </CalcCard>
  );
}
