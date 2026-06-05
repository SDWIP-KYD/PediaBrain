"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const stressOptions = [
  { value: "1.0", label: "Tidak ada stres (1.0)" },
  { value: "1.2", label: "Operasi (1.2)" },
  { value: "1.3", label: "Sepsis (1.3)" },
  { value: "1.5", label: "Burn berat (1.5)" },
  { value: "1.1", label: "Trauma ringan (1.1)" },
  { value: "1.4", label: "Trauma berat (1.4)" },
];

const sexOptions = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
];

export function CalorieCalc() {
  const { weightGram, heightCm, ageMonths, sex } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [height, setHeight] = useState(heightCm);
  const [age, setAge] = useState(ageMonths);
  const [selectedSex, setSelectedSex] = useState<"L" | "P">(sex);
  const [stress, setStress] = useState("1.0");

  const ageYr = age / 12;
  let bmr = 0;
  if (ageYr < 1) {
    bmr = (60.9 * weight) - 40;
  } else if (ageYr < 3) {
    bmr = (22.7 * weight) + 495;
  } else {
    bmr = selectedSex === "L"
      ? (17.5 * weight) + 651
      : (12.2 * weight) + 746;
  }

  const stressFactor = parseFloat(stress);
  const totalCal = bmr * stressFactor;
  const perKg = weight > 0 ? totalCal / weight : 0;

  let category: { label: string; color: string };
  if (perKg < 60) category = { label: "Rendah", color: "text-yellow-400" };
  else if (perKg <= 80) category = { label: "Sedang", color: "text-green-400" };
  else category = { label: "Tinggi", color: "text-orange-400" };

  return (
    <CalcCard title="Calorie Calculator" icon="🔥">
      <div className="space-y-3">
        <CalcSelect label="Jenis Kelamin" value={selectedSex} onChange={(v) => setSelectedSex(v as "L" | "P")} options={sexOptions} />
        <CalcInput label="Usia (bulan)" unit="bln" value={age} onChange={(v) => setAge(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={228} />
        <CalcInput label="Berat Badan (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.1} />
        <CalcInput label="Tinggi Badan (cm)" unit="cm" value={height} onChange={(v) => setHeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={30} />
        <CalcSelect label="Faktor Stres" value={stress} onChange={setStress} options={stressOptions} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="BMR" value={`${Math.round(bmr)} kkal/hari`} />
            <ResultItem label="Total Kalori" value={`${Math.round(totalCal)} kkal/hari`} />
            <ResultItem label="Per kg BB" value={`${perKg.toFixed(0)} kkal/kg/hari`} />
            <ResultItem label="Kategori" value={category.label} className={category.color} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          Formula Harris-Benedict yang dimodifikasi untuk pediatric. Faktor stres dikalikan dengan BMR.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
