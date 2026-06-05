"use client";

import { useState } from "react";
import { CalcCard, CalcSelect, CalcResult, ResultGrid, ResultItem, ResultAlert } from "../../components/calc-ui";

const saParams = [
  { label: "Gerakan Dada", options: ["0 — Sinkron", "1 — Lag inspirasi", "2 — Paradoksal"] },
  { label: "Retraksi Interkostal", options: ["0 — Tidak ada", "1 — Minimal", "2 — Nyata"] },
  { label: "Retraksi Xifoid", options: ["0 — Tidak ada", "1 — Minimal", "2 — Nyata"] },
  { label: "Flap Hidung", options: ["0 — Tidak ada", "1 — Minimal", "2 — Nyata"] },
  { label: "Grunting (Ekspirasi)", options: ["0 — Tidak ada", "1 — Auskultasi", "2 — Terdengar"] },
];

export function SilvermanCalc() {
  const [scores, setScores] = useState([0, 0, 0, 0, 0]);

  const total = scores.reduce((a, b) => a + b, 0);

  let interp = "";
  let interpType: "success" | "warning" | "danger" = "success";
  let action = "";

  if (total === 0) { interp = "Normal"; interpType = "success"; action = "Tidak ada distres napas"; }
  else if (total <= 3) { interp = "Ringan (1–3)"; interpType = "warning"; action = "Pantau, O₂ bila SpO₂ <90%"; }
  else if (total <= 6) { interp = "Sedang (4–6)"; interpType = "warning"; action = "CPAP, evaluasi foto thoraks"; }
  else { interp = "Berat (7–10)"; interpType = "danger"; action = "Intubasi dan ventilasi mekanik"; }

  return (
    <CalcCard title="Skor Silverman-Anderson" subtitle="Derajat Distres Napas Neonatus" icon="🫁" color="red">
      <div className="space-y-3">
        {saParams.map((param, i) => (
          <div key={i} className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">{param.label}</label>
            <select
              value={scores[i]}
              onChange={(e) => {
                const newScores = [...scores];
                newScores[i] = parseInt(e.target.value);
                setScores(newScores);
              }}
              className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-neon/30"
            >
              {param.options.map((opt, j) => (
                <option key={j} value={j}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <CalcResult color="red">
        <ResultGrid cols={2}>
          <ResultItem label="Skor Silverman" value={`${total}`} unit="/ 10" />
          <ResultItem label="Interpretasi" value={interp} />
        </ResultGrid>
        <ResultAlert type={interpType}>{action}</ResultAlert>
      </CalcResult>
    </CalcCard>
  );
}
