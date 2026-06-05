"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const formulaOptions = [
  { value: "standard", label: "Standard (1 kcal/mL)" },
  { value: "highCal", label: "High Calorie (1.5 kcal/mL)" },
  { value: "renal", label: "Renal Formula" },
  { value: "soy", label: "Soy-based" },
];

const tubeOptions = [
  { value: "8fr", label: "8 Fr (prematur)" },
  { value: "10fr", label: "10 Fr (bayi)" },
  { value: "12fr", label: "12 Fr (anak)" },
  { value: "14fr", label: "14 Fr (remaja)" },
];

export function EnteralCalc() {
  const { weightGram, ageMonths } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [age, setAge] = useState(ageMonths);
  const [kcalPerMl, setKcalPerMl] = useState(1);
  const [formula, setFormula] = useState("standard");
  const [tube, setTube] = useState("10fr");

  const volumeNeeded = weight * 150;
  const kcalNeeded = weight * 100;
  const ratePerHr = volumeNeeded / 24;
  const feedsPerDay = 6;
  const volumePerFeed = volumeNeeded / feedsPerDay;

  const ageYr = age / 12;
  let tubeRec = tube;
  if (ageYr < 0.5) tubeRec = "8fr";
  else if (ageYr < 2) tubeRec = "10fr";
  else if (ageYr < 10) tubeRec = "12fr";
  else tubeRec = "14fr";

  return (
    <CalcCard title="Enteral Feeding Calculator" icon="🍼">
      <div className="space-y-3">
        <CalcInput label="Berat Badan (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.1} />
        <CalcInput label="Usia (bulan)" unit="bln" value={age} onChange={(v) => setAge(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={228} />
        <CalcSelect label="Formula" value={formula} onChange={setFormula} options={formulaOptions} />
        <CalcSelect label="Ukuran Tube" value={tube} onChange={setTube} options={tubeOptions} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Volume/Hari" value={`${volumeNeeded.toFixed(0)} mL/hari`} />
            <ResultItem label="Kalori/Hari" value={`${kcalNeeded.toFixed(0)} kkal/hari`} />
            <ResultItem label="Rate (per jam)" value={`${ratePerHr.toFixed(1)} mL/jam`} />
            <ResultItem label="Per Feed" value={`${volumePerFeed.toFixed(0)} mL × ${feedsPerDay}`} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          Target: 150 mL/kg/hari atau 100 kkal/kg/hari. Tube rekomendasi: {tubeRec} untuk usia {age} bulan. Mulai 20 mL/jam, naikkan setiap 4-8 jam.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
