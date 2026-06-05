"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const sexOptions = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
];

const meanHeightMale = [49.9,53.7,57.1,60.0,62.5,64.7,66.7,68.5,70.2,71.8,73.3,74.7,76.1,77.4,78.6,79.8,81.0,82.1,83.2,84.2,85.2,86.2,87.1,88.0,89.1,90.1,91.1,92.0,92.9,93.8,94.7,95.6,96.4,97.3,98.1,98.9,99.7,100.4,101.2,101.9,102.7,103.4,104.1,104.8,105.5,106.2,106.9,107.6,108.2,108.9,109.5,110.2,110.8,111.4,112.0,112.6,113.2,113.7,114.3,114.9,115.4];
const meanHeightFemale = [49.1,52.8,56.1,58.9,61.4,63.5,65.4,67.2,68.8,70.4,71.9,73.3,74.7,76.0,77.2,78.4,79.5,80.7,81.7,82.7,83.7,84.6,85.5,86.4,87.4,88.3,89.2,90.1,90.9,91.8,92.6,93.4,94.2,95.0,95.7,96.5,97.2,97.9,98.6,99.3,100.0,100.6,101.3,101.9,102.6,103.2,103.8,104.4,105.0,105.6,106.2,106.8,107.3,107.9,108.4,109.0,109.5,110.0,110.6,111.1,111.6];

function lookup(table: number[], ageMonth: number): number {
  const idx = Math.min(Math.max(0, Math.round(ageMonth)), table.length - 1);
  return table[idx] ?? 100;
}

export function HeightAgeCalc() {
  const { heightCm, ageMonths, sex } = usePatient();
  const [height, setHeight] = useState(heightCm);
  const [age, setAge] = useState(ageMonths);
  const [selectedSex, setSelectedSex] = useState<"L" | "P">(sex);

  const sexKey = selectedSex === "L" ? "m" : "f";
  const ageMo = Math.min(Math.round(age), 60);
  const medianHeight = lookup(sexKey === "m" ? meanHeightMale : meanHeightFemale, ageMo);
  const sdH = sexKey === "m" ? 3.5 : 3.4;
  const zScore = sdH > 0 ? (height - medianHeight) / sdH : 0;

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
            <ResultItem label="Z-Score" value={zScore.toFixed(2)} className={zScore < -2 ? "text-red-500" : zScore > 2 ? "text-yellow-400" : "text-emerald-500"} />
            <ResultItem label="Status" value={status.label} className={status.color} />
          </ResultGrid>
          <ResultGrid cols={2}>
            <ResultItem label="Median TB" value={`${medianHeight.toFixed(1)} cm`} note={`Usia: ${age} bulan`} />
            <ResultItem label="SD" value={`${sdH} cm`} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          WHO: Z &lt;-2 = stunting, Z &lt;-3 = severely stunted. Median tinggi = {medianHeight.toFixed(1)} cm untuk usia {age} bulan ({selectedSex === "L" ? "Laki-laki" : "Perempuan"}).
        </InfoBox>
      </div>
    </CalcCard>
  );
}
