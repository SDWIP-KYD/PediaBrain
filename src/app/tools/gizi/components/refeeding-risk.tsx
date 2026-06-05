"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox, ResultAlert } from "../../components/calc-ui";

const riskFactors = [
  { id: "anorexia", label: "Anorexia >2 minggu", points: 1 },
  { id: "npo", label: "NPO >5 hari", points: 2 },
  { id: "weightLoss", label: "BB turun >10%", points: 2 },
  { id: "noNutrition", label: "Tanpa nutrisi >10 hari", points: 3 },
  { id: "chronicDisease", label: "Penyakit kronis (kanker, CF)", points: 1 },
  { id: "alcohol", label: "Riwayat alkoholisme", points: 1 },
  { id: "diabetes", label: "Diabetes tidak terkontrol", points: 1 },
  { id: "hypokalemia", label: "Hipokalemia", points: 2 },
  { id: "hypophosphatemia", label: "Hipoposfatemia", points: 2 },
  { id: "hypomagnesemia", label: "Hipomagnesemia", points: 1 },
];

export function RefeedingRisk() {
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [daysNPO, setDaysNPO] = useState(0);
  const [weightLoss, setWeightLoss] = useState(0);

  const totalPoints = riskFactors
    .filter((f) => selectedFactors.includes(f.id))
    .reduce((sum, f) => sum + f.points, 0);

  let riskLevel: { label: string; type: "success" | "warning" | "danger" };
  if (totalPoints >= 5) riskLevel = { label: "High Risk", type: "danger" };
  else if (totalPoints >= 2) riskLevel = { label: "Moderate Risk", type: "warning" };
  else riskLevel = { label: "Low Risk", type: "success" };

  const toggleFactor = (id: string) => {
    setSelectedFactors((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  return (
    <CalcCard title="Refeeding Syndrome Risk" icon="⚠️">
      <div className="space-y-3">
        <CalcInput label="Hari NPO" unit="hari" value={daysNPO} onChange={(v) => setDaysNPO(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        <CalcInput label="Penurunan BB (%)" unit="%" value={weightLoss} onChange={(v) => setWeightLoss(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={50} />
        <div className="space-y-2">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Faktor Risiko</label>
          <div className="grid gap-1.5">
            {riskFactors.map((f) => (
              <button
                key={f.id}
                onClick={() => toggleFactor(f.id)}
                className={`w-full text-left rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                  selectedFactors.includes(f.id)
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : "bg-card border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {f.label} (+{f.points})
              </button>
            ))}
          </div>
        </div>
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Risk Score" value={`${totalPoints} points`} />
            <ResultItem label="Risk Level" value={riskLevel.label} className={riskLevel.type === "danger" ? "text-red-500" : riskLevel.type === "warning" ? "text-yellow-400" : "text-green-400"} />
          </ResultGrid>
        </CalcResult>
        <ResultAlert type={riskLevel.type}>
          {riskLevel.type === "danger" ? "Risiko tinggi refeeding syndrome. Mulai nutrisi perlahan (10-20 kkal/kg/hari), monitor elektrolit (K, Mg, PO4) setiap 12-24 jam, dan koreksi defisiensi sebelum/m selama pemberian nutrisi." :
           riskLevel.type === "warning" ? "Risiko moderat. Monitor elektrolit sebelum dan 48 jam setelah memulai nutrisi. Pertimbangkan pemberian tiamin profilaksis." :
           "Risiko rendah. Pemberian nutrisi dapat dimulai dengan hati-hati standar."}
        </ResultAlert>
        <InfoBox>
          Refeeding syndrome: hipokalemia, hipofosfatemia, hipomagnesemia, tiamin defisiensi. Fatal jika tidak ditangani. Mulai dengan 10-20 kkal/kg/hari.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
