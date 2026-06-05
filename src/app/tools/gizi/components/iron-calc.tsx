"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const ageGroupOptions = [
  { value: "premature", label: "Prematur (<37 mgg)" },
  { value: "0-6m", label: "0-6 bulan" },
  { value: "6-12m", label: "6-12 bulan" },
  { value: "1-3y", label: "1-3 tahun" },
  { value: "4-8y", label: "4-8 tahun" },
  { value: "9-13y", label: "9-13 tahun" },
  { value: "14-18y", label: "14-18 tahun" },
];

const ironData: Record<string, { mgPerKg: number; recMg: number; source: string }> = {
  "premature": { mgPerKg: 2, recMg: 0, source: "2-4 mg/kg/hari" },
  "0-6m": { mgPerKg: 1, recMg: 0, source: "1 mg/kg/hari (tipe darah)" },
  "6-12m": { mgPerKg: 0, recMg: 11, source: "11 mg/hari (DRI)" },
  "1-3y": { mgPerKg: 0, recMg: 7, source: "7 mg/hari (DRI)" },
  "4-8y": { mgPerKg: 0, recMg: 10, source: "10 mg/hari (DRI)" },
  "9-13y": { mgPerKg: 0, recMg: 8, source: "8 mg/hari (DRI)" },
  "14-18y": { mgPerKg: 0, recMg: 15, source: "15 mg/hari L, 15 mg/hari P" },
};

export function IronCalc() {
  const { weightGram, ageMonths } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [ageGroup, setAgeGroup] = useState("0-6m");

  const data = ironData[ageGroup];
  const ironNeed = data.mgPerKg > 0 ? weight * data.mgPerKg : data.recMg;

  let note = "";
  if (ageGroup === "premature") note = "Prematur: 2-4 mg/kg/hari elemental iron. Mulai dalam 2-4 minggu pertama.";
  else if (ageGroup === "0-6m") note = "Bayi: 1 mg/kg/hari untuk bayi term dengan cadangan Fe baik. BBLR: 2 mg/kg/hari.";
  else note = "Diet: daging merah, hati, kacang-kacangan, sayuran hijau. Berikan dengan vitamin C untuk absorpsi.";

  return (
    <CalcCard title="Iron Requirements" icon="🩸">
      <div className="space-y-3">
        <CalcSelect label="Kelompok Usia" value={ageGroup} onChange={setAgeGroup} options={ageGroupOptions} />
        <CalcInput label="Berat Badan (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.1} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Kebutuhan" value={`${ironNeed.toFixed(1)} mg/hari`} />
            <ResultItem label="Sumber" value={data.source} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>{note}</InfoBox>
      </div>
    </CalcCard>
  );
}
