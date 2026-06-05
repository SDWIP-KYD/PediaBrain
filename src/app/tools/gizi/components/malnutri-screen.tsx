"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox, ResultAlert } from "../../components/calc-ui";

const intakeOptions = [
  { value: "full", label: "Full intake" },
  { value: "partial", label: "Partial (<50%)" },
  { value: "minimal", label: "Minimal (<25%)" },
  { value: "none", label: "None (NPO)" },
];

export function MalnutriScreen() {
  const { weightGram, ageMonths, patient } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [prevWeight, setPrevWeight] = useState(weightGram / 1000 * 1.1);
  const [intake, setIntake] = useState("full");
  const [currentMuac, setCurrentMuac] = useState(patient.muac);

  const weightLossPct = prevWeight > 0 ? ((prevWeight - weight) / prevWeight) * 100 : 0;
  const ageYr = ageMonths / 12;

  let muacStatus = "Normal";
  let muacColor = "text-green-400";
  if (ageYr < 1) {
    if (currentMuac < 11.5) { muacStatus = "Severe wasting"; muacColor = "text-red-500"; }
    else if (currentMuac < 12.5) { muacStatus = "Moderate wasting"; muacColor = "text-orange-400"; }
  } else {
    if (currentMuac < 11.5) { muacStatus = "Severe wasting"; muacColor = "text-red-500"; }
    else if (currentMuac < 12.5) { muacStatus = "Moderate wasting"; muacColor = "text-orange-400"; }
    else if (currentMuac < 14) { muacStatus = "Mild wasting"; muacColor = "text-yellow-400"; }
  }

  let riskScore = 0;
  if (weightLossPct > 10) riskScore += 2;
  else if (weightLossPct > 5) riskScore += 1;
  if (intake === "none") riskScore += 3;
  else if (intake === "minimal") riskScore += 2;
  else if (intake === "partial") riskScore += 1;
  if (muacStatus.includes("Severe")) riskScore += 2;
  else if (muacStatus.includes("Moderate")) riskScore += 1;

  let riskLevel: { label: string; type: "success" | "warning" | "danger" };
  if (riskScore >= 4) riskLevel = { label: "High Risk — Rawat Inap", type: "danger" };
  else if (riskScore >= 2) riskLevel = { label: "Moderate Risk — Monitoring", type: "warning" };
  else riskLevel = { label: "Low Risk — Rawat Jalan", type: "success" };

  return (
    <CalcCard title="Malnutrition Screening" icon="📉">
      <div className="space-y-3">
        <CalcInput label="Berat Badan Saat Ini (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.1} />
        <CalcInput label="Berat Badan Sebelumnya (kg)" unit="kg" value={prevWeight} onChange={(v) => setPrevWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.1} />
        <CalcInput label="MUAC (cm)" unit="cm" value={currentMuac} onChange={(v) => setCurrentMuac(typeof v === "string" ? parseFloat(v) || 0 : v)} min={5} max={30} step={0.1} />
        <CalcSelect label="Asupan Makanan" value={intake} onChange={setIntake} options={intakeOptions} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Weight Loss" value={`${weightLossPct.toFixed(1)}%`} />
            <ResultItem label="MUAC Status" value={muacStatus} className={muacColor} />
            <ResultItem label="Risk Score" value={`${riskScore}/7`} />
            <ResultItem label="Risk Level" value={riskLevel.label} className={riskLevel.type === "danger" ? "text-red-500" : riskLevel.type === "warning" ? "text-yellow-400" : "text-green-400"} />
          </ResultGrid>
        </CalcResult>
        <ResultAlert type={riskLevel.type}>
          {riskLevel.type === "danger" ? "Rawat inap diperlukan. Pertimbangkan nasogastrik feeding dan evaluasi metabolik." :
           riskLevel.type === "warning" ? "Monitoring ketat. Pertimbangkan konsultasi gizi dan peningkatan frekuensi makan." :
           "Lanjutkan asupan normal. Kontrol berat badan mingguan."}
        </ResultAlert>
      </div>
    </CalcCard>
  );
}
