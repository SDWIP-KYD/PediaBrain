"use client";

import { useState } from "react";
import { CalcCard, CalcSelect, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

const pelod2Params = [
  { label: "GCS", options: ["≥11 (0pt)", "5-10 (4pt)", "4 (8pt)", "3 (12pt)"], points: [0, 4, 8, 12] },
  { label: "Pupils (light reflex)", options: ["Both reactive (0pt)", "One/both non-reactive (7pt)"], points: [0, 7] },
  { label: "Lactate (mmol/L)", options: ["<1.4 (0pt)", "1.4-3.4 (1pt)", "≥3.4 (4pt)"], points: [0, 1, 4] },
  { label: "Systolic BP", options: ["Normal (0pt)", "Low (2pt)", "Very low (5pt)"], points: [0, 2, 5] },
  { label: "Creatinine", options: ["Normal (0pt)", "≥2× ULN (2pt)"], points: [0, 2] },
  { label: "PaO₂/FiO₂ or SpO₂/FiO₂", options: ["≥61 kPa (0pt)", "30-61 kPa (3pt)", "<30 kPa (6pt)"], points: [0, 3, 6] },
  { label: "Mechanical Ventilation", options: ["No (0pt)", "Yes (3pt)"], points: [0, 3] },
  { label: "Leukocytes (/µL)", options: ["≥2000 (0pt)", "<2000 (2pt)"], points: [0, 2] },
  { label: "Platelets (/µL)", options: ["≥150,000 (0pt)", "50,000-149,999 (1pt)", "<50,000 (5pt)"], points: [0, 1, 5] },
];

const mortalityTable: [number, string][] = [
  [0, "~0%"], [2, "2%"], [4, "5%"], [6, "9%"], [8, "16%"], [10, "25%"], [12, "38%"], [15, "55%"], [20, "75%"],
];

export function PELOD2Calc() {
  const [selected, setSelected] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const total = selected.reduce((sum, val, i) => sum + pelod2Params[i].points[val], 0);

  let mortality = "N/A";
  for (const [score, mort] of mortalityTable) {
    if (total >= score) mortality = mort;
  }

  let interpretation = "";
  if (total >= 8) interpretation = "Mortalitas tinggi (>25%). Evaluasi tujuan perawatan, ICU tiering.";
  else if (total >= 5) interpretation = "Mortalitas sedang. Monitoring intensif. Re-evaluasi tiap 24 jam.";
  else interpretation = "Mortalitas rendah (<10%). Monitoring standar PICU.";

  return (
    <CalcCard title="PELOD-2" subtitle="Pediatric sepsis severity scoring" icon="📊" color="yellow">
      <InfoBox>
        PELOD-2 menilai 6 organ sistem. Setiap poin ↑ mortalitas ↑. Skor ≥8: mortalitas {">"}25%.
      </InfoBox>
      <div className="space-y-3">
        {pelod2Params.map((p, i) => (
          <div key={i} className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">{p.label}</label>
            <select
              value={selected[i]}
              onChange={(e) => {
                const ns = [...selected];
                ns[i] = parseInt(e.target.value);
                setSelected(ns);
              }}
              className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-neon/30"
            >
              {p.options.map((opt, j) => (
                <option key={j} value={j}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <CalcResult color="yellow">
        <ResultGrid cols={2}>
          <ResultItem label="PELOD-2 Score" value={`${total}`} />
          <ResultItem label="Estimasi Mortalitas" value={mortality} />
        </ResultGrid>
        <ResultAlert type={total >= 8 ? "danger" : total >= 5 ? "warning" : "success"}>
          {interpretation}
        </ResultAlert>
      </CalcResult>
    </CalcCard>
  );
}
