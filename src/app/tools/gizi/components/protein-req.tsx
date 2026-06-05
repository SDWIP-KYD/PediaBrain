"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const ageGroupOptions = [
  { value: "premature", label: "Prematur (<37 mgg)" },
  { value: "0-6m", label: "0-6 bulan" },
  { value: "6-12m", label: "6-12 bulan" },
  { value: "1-3y", label: "1-3 tahun" },
  { value: "4-6y", label: "4-6 tahun" },
  { value: "7-10y", label: "7-10 tahun" },
  { value: "11-14y", label: "11-14 tahun" },
  { value: "15-18y", label: "15-18 tahun" },
];

const proteinData: Record<string, { min: number; max: number; rec: number }> = {
  "premature": { min: 3, max: 4, rec: 3.5 },
  "0-6m": { min: 2, max: 3, rec: 2.5 },
  "6-12m": { min: 1.5, max: 2.5, rec: 2 },
  "1-3y": { min: 1, max: 1.5, rec: 1.2 },
  "4-6y": { min: 1, max: 1.5, rec: 1.1 },
  "7-10y": { min: 1, max: 1.5, rec: 1 },
  "11-14y": { min: 0.8, max: 1, rec: 0.9 },
  "15-18y": { min: 0.8, max: 1, rec: 0.9 },
};

export function ProteinReqCalc() {
  const { weightGram, ageMonths } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [ageGroup, setAgeGroup] = useState("0-6m");

  const ageYr = ageMonths / 12;
  let autoAgeGroup = ageGroup;
  if (ageMonths < 28) autoAgeGroup = "premature";
  else if (ageYr < 0.5) autoAgeGroup = "0-6m";
  else if (ageYr < 1) autoAgeGroup = "6-12m";
  else if (ageYr < 3) autoAgeGroup = "1-3y";
  else if (ageYr < 7) autoAgeGroup = "4-6y";
  else if (ageYr < 11) autoAgeGroup = "7-10y";
  else if (ageYr < 15) autoAgeGroup = "11-14y";
  else autoAgeGroup = "15-18y";

  const data = proteinData[autoAgeGroup];
  const minProt = weight * data.min;
  const maxProt = weight * data.max;
  const recProt = weight * data.rec;

  return (
    <CalcCard title="Protein Requirements" icon="🥩">
      <div className="space-y-3">
        <CalcSelect label="Kelompok Usia" value={ageGroup} onChange={setAgeGroup} options={ageGroupOptions} />
        <CalcInput label="Berat Badan (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.1} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Minimum" value={`${minProt.toFixed(1)} g/hari`} />
            <ResultItem label="Maksimum" value={`${maxProt.toFixed(1)} g/hari`} />
            <ResultItem label="Rekomendasi" value={`${recProt.toFixed(1)} g/hari`} />
            <ResultItem label="Per kg" value={`${data.rec} g/kg/hari`} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          Prematur: 3-4 g/kg/hari. Bayi: 2-3 g/kg/hari. Anak: 1-1.5 g/kg/hari. Remaja: 0.8-1 g/kg/hari.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
