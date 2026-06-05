"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const riskFactors = [
  { id: "premature", label: "Prematur (<37 minggu)", points: 3 },
  { id: "lowbw", label: "BBR <1500g", points: 3 },
  { id: "surgery", label: "Post operasi kardiak", points: 4 },
  { id: "nephrotoxic", label: "Nephrotoxic drugs", points: 2 },
  { id: "sepsis", label: "Sepsis", points: 3 },
  { id: "hypotension", label: "Hipotensi", points: 2 },
  { id: "mechanical", label: "Mechanical ventilation", points: 2 },
  { id: "ibuprofen", label: "Ibuprofen/NSAID", points: 2 },
];

export function AKIRiskCalc() {
  const [selected, setSelected] = useState<string[]>([]);

  const totalScore = selected.reduce((sum, id) => {
    const rf = riskFactors.find((r) => r.id === id);
    return sum + (rf?.points || 0);
  }, 0);

  const risk =
    totalScore >= 10 ? { label: "Tinggi", color: "text-red-500", action: "Screening kreatinin 24-48 jam. Hentikan nephrotoxic drugs jika memungkinkan." } :
    totalScore >= 5 ? { label: "Sedang", color: "text-orange-400", action: "Monitor ketat. Fluid resuscitation adequate. Hindari nephrotoxic." } :
    { label: "Rendah", color: "text-green-400", action: "Standard monitoring. Pastikan euvolemia." };

  const toggle = (id: string) => {
    setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  return (
    <CalcCard title="AKI Risk Assessment (Pediatric)" icon="⚠️">
      <div className="space-y-3">
        <div className="space-y-1.5">
          {riskFactors.map((rf) => (
            <button
              key={rf.id}
              onClick={() => toggle(rf.id)}
              className={`w-full flex items-center gap-2 rounded border px-3 py-2 text-left text-sm transition-all ${
                selected.includes(rf.id)
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                  : "bg-card border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              <span className="w-5 h-5 rounded border border-border flex items-center justify-center shrink-0">
                {selected.includes(rf.id) && "✓"}
              </span>
              <span className="flex-1">{rf.label}</span>
              <span className="text-xs text-muted-foreground">+{rf.points}</span>
            </button>
          ))}
        </div>
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Total Score" value={`${totalScore} pts`} />
            <ResultItem label="Risk Level" value={risk.label} className={risk.color} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          <strong>Action:</strong> {risk.action}
        </InfoBox>
      </div>
    </CalcCard>
  );
}
