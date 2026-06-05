"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const sexOptions = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
];

export function REECalc() {
  const { weightGram, ageMonths, sex } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [age, setAge] = useState(ageMonths);
  const [selectedSex, setSelectedSex] = useState<"L" | "P">(sex);

  const ageYr = age / 12;
  let ree = 0;

  if (ageYr < 0.17) {
    ree = 60.9 * weight - 40;
  } else if (ageYr < 3) {
    ree = 22.7 * weight + 495;
  } else if (ageYr < 10) {
    ree = selectedSex === "L"
      ? 17.7 * weight + 488
      : 16.1 * weight + 514;
  } else if (ageYr < 18) {
    ree = selectedSex === "L"
      ? 17.1 * weight + 588
      : 12.5 * weight + 626;
  } else {
    ree = selectedSex === "L"
      ? 15.1 * weight + 692
      : 14.7 * weight + 495;
  }

  const perKg = weight > 0 ? ree / weight : 0;

  return (
    <CalcCard title="Resting Energy Expenditure" icon="⚡">
      <div className="space-y-3">
        <CalcSelect label="Jenis Kelamin" value={selectedSex} onChange={(v) => setSelectedSex(v as "L" | "P")} options={sexOptions} />
        <CalcInput label="Usia (bulan)" unit="bln" value={age} onChange={(v) => setAge(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={228} />
        <CalcInput label="Berat Badan (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.1} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="REE" value={`${Math.round(ree)} kkal/hari`} />
            <ResultItem label="Per kg BB" value={`${perKg.toFixed(1)} kkal/kg/hari`} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          Schofield equations: &lt;3 tahun = 22.7×BB + 495. 3-10 tahun = 17.7×BB + 488 (L). 10-18 tahun = 17.1×BB + 588 (L).
        </InfoBox>
      </div>
    </CalcCard>
  );
}
