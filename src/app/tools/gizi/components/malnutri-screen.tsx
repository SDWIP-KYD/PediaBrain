"use client";

import { useState } from "react";
import { CalcCard, CalcResult, ResultItem, ResultGrid, InfoBox, ResultAlert } from "../../components/calc-ui";

interface ChecklistItem {
  id: string;
  label: string;
  points: number;
}

const checklistItems: ChecklistItem[] = [
  {
    id: "subjektif",
    label: "Status gizi subjektif: berat badan turun atau tidak naik selama ≥2 bulan",
    points: 1,
  },
  {
    id: "penyakit",
    label: "Penyakit berisiko tinggi: ada",
    points: 2,
  },
  {
    id: "asupan",
    label: "Asupan makan berkurang: ≥5 hari berkurang atau tidak makan sama sekali",
    points: 1,
  },
  {
    id: "bb-turun",
    label: "Berat badan turun: ≥5% dalam 1 bulan atau ≥10% dalam 6 bulan",
    points: 1,
  },
];

export function MalnutriScreen() {
  const [checked, setChecked] = useState<Record<string, boolean>>({
    subjektif: false,
    penyakit: false,
    asupan: false,
    "bb-turun": false,
  });

  const totalScore = checklistItems.reduce((sum, item) => {
    return sum + (checked[item.id] ? item.points : 0);
  }, 0);

  let riskLevel: string;
  let riskColor: string;
  let action: string;
  if (totalScore <= 1) {
    riskLevel = "Rendah";
    riskColor = "text-emerald-400";
    action = "Skrining ulang saat pulang";
  } else if (totalScore <= 3) {
    riskLevel = "Sedang";
    riskColor = "text-amber-400";
    action = "Konsultasi dietisien";
  } else {
    riskLevel = "Tinggi";
    riskColor = "text-red-500";
    action = "Intervensi gizi SEGERA";
  }

  const alertType = totalScore <= 1 ? "success" : totalScore <= 3 ? "warning" : "danger";

  return (
    <CalcCard title="Skrining Malnutrisi — STRONGkids" subtitle="Pediatric Nutrition Risk Score" icon="⚠️" color="red">
      <div className="space-y-3">
        <InfoBox>
          <strong>STRONGkids:</strong> 0 = risiko rendah; 1–3 = risiko sedang; 4–5 = risiko tinggi. Digunakan untuk pasien rawat inap.
        </InfoBox>

        <div className="space-y-2">
          {checklistItems.map((item) => (
            <label key={item.id} className="flex items-start gap-3 text-sm cursor-pointer leading-relaxed">
              <input
                type="checkbox"
                checked={checked[item.id] || false}
                onChange={(e) => setChecked({ ...checked, [item.id]: e.target.checked })}
                className="mt-1 accent-emerald-500"
              />
              <span>
                <strong>{item.label.split(":")[0]}:</strong>
                {item.label.split(":").slice(1).join(":")}
                <span className="text-muted-foreground ml-1">(skor {item.points})</span>
              </span>
            </label>
          ))}
        </div>

        <CalcResult color="red">
          <ResultGrid cols={2}>
            <ResultItem label="Skor STRONGkids" value={`${totalScore}/5`} />
            <ResultItem label="Risiko Malnutrisi" value={riskLevel} className={riskColor} />
          </ResultGrid>
        </CalcResult>

        <ResultAlert type={alertType}>
          {action}
        </ResultAlert>
      </div>
    </CalcCard>
  );
}
