"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const feedFreqOptions = [
  { value: "8", label: "Setiap 3 jam (8x)" },
  { value: "6", label: "Setiap 4 jam (6x)" },
  { value: "5", label: "Setiap 4-5 jam (5x)" },
];

export function BreastfeedCalc() {
  const { weightGram, ageMonths } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [age, setAge] = useState(ageMonths);
  const [feedsPerDay, setFeedsPerDay] = useState("8");

  const ageYr = age / 12;
  let volumePerKg = 180;
  if (ageYr > 0.5) volumePerKg = 150;
  if (ageYr > 1) volumePerKg = 120;

  const totalVolume = weight * volumePerKg;
  const feeds = parseInt(feedsPerDay);
  const volumePerFeed = totalVolume / feeds;

  let notes = "";
  if (ageYr < 0.5) notes = "ASI eksklusif: 80-100 mL/kg/hari pada minggu pertama, naik ke 150-180 mL/kg/hari.";
  else if (ageYr < 1) notes = "ASI + MPASI mulai usia 6 bulan. Volume ASI tetap, MPASI sebagai pelengkap.";
  else notes = "Setelah 1 tahun, ASI sebagai pelengkap. Susu sapi/sufor tidak dianjurkan sebelum 1 tahun.";

  return (
    <CalcCard title="Breastfeeding Calculator" icon="🤱">
      <div className="space-y-3">
        <CalcInput label="Berat Badan (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={2} step={0.1} />
        <CalcInput label="Usia (bulan)" unit="bln" value={age} onChange={(v) => setAge(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={24} />
        <CalcSelect label="Frekuensi Menyusu" value={feedsPerDay} onChange={setFeedsPerDay} options={feedFreqOptions} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Total Volume" value={`${totalVolume.toFixed(0)} mL/hari`} />
            <ResultItem label="Per Feed" value={`${volumePerFeed.toFixed(0)} mL`} />
            <ResultItem label="Frekuensi" value={`${feeds}x/hari`} />
            <ResultItem label="Per kg" value={`${volumePerKg} mL/kg/hari`} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>{notes}</InfoBox>
      </div>
    </CalcCard>
  );
}
