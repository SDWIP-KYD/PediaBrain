"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function HyponatremiaCalc() {
  const [na, setNa] = useState(125);
  const [symptoms, setSymptoms] = useState("asymptomatic");
  const [volume, setVolume] = useState("euvolemic");
  const [weight, setWeight] = useState(20);

  const correctionRate =
    symptoms === "seizure" || symptoms === "severe" ? 3 :
    symptoms === "moderate" ? 2 : 0.5;

  const maxNaPerDay = correctionRate * 24;
  const targetNa = Math.min(na + 4, 135);

  const urgency =
    symptoms === "seizure" || symptoms === "severe" ? { label: "EMERGENCY", color: "text-red-500" } :
    symptoms === "moderate" ? { label: "Urgent", color: "text-orange-400" } :
    { label: "Asymptomatic/Mild", color: "text-green-400" };

  return (
    <CalcCard title="Hyponatremia Management" icon="💧">
      <div className="space-y-3">
        <CalcInput label="Serum Na⁺ (mEq/L)" unit="mEq/L" value={na} onChange={(v) => setNa(typeof v === "string" ? parseFloat(v) || 0 : v)} min={100} />
        <CalcInput label="Berat Badan (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={2} />
        <CalcSelect label="Gejala" value={symptoms} onChange={setSymptoms} options={[
          { value: "asymptomatic", label: "Asymptomatic" },
          { value: "mild", label: "Mild (lelah, mual)" },
          { value: "moderate", label: "Moderate (confusion, headache)" },
          { value: "severe", label: "Severe (drowsiness)" },
          { value: "seizure", label: "Seizure/Coma" },
        ]} />
        <CalcSelect label="Volume Status" value={volume} onChange={setVolume} options={[
          { value: "hypovolemic", label: "Hypovolemic" },
          { value: "euvolemic", label: "Euvolemic (SIADH)" },
          { value: "hypervolemic", label: "Hypervolemic (CHF, nephrotic)" },
        ]} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Correction Rate" value={`${correctionRate} mEq/L/hr`} />
            <ResultItem label="Max Δ/24hr" value={`${maxNaPerDay} mEq/L`} />
            <ResultItem label="Target Na⁺" value={`${targetNa} mEq/L`} />
            <ResultItem label="Urgency" value={urgency.label} className={urgency.color} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          {symptoms === "seizure" || symptoms === "severe"
            ? "EMERGENCY: 3% NaCl 2-5 mL/kg over 10-20 menit. Ulang Na⁺ setiap 2-4 jam. Max 8-10 mEq/L/24hr."
            : "Hindari koreksi terlalu cepat → Osmotic Demyelination Syndrome. Max 8 mEq/L/24hr pada chronic."}
        </InfoBox>
        {volume === "hypovolemic" && (
          <InfoBox>Hypovolemic: NS 20 mL/kg bolus, lalu 0.9% NaCl atau LR. Hentikan free water jika Na⁺ normal.</InfoBox>
        )}
        {volume === "euvolemic" && (
          <InfoBox>Euvolemic (SIADH): Fluid restriction 0.5-0.7 maintenance. Pertimbangkan NaCl tabs atau furosemide.</InfoBox>
        )}
        {volume === "hypervolemic" && (
          <InfoBox>Hypervolemic: Fluid restriction + furosemide 1-2 mg/kg + NaCl tabs. Treat underlying cause.</InfoBox>
        )}
      </div>
    </CalcCard>
  );
}
