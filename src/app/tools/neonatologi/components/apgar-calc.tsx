"use client";

import { useState } from "react";
import { CalcCard, CalcSelect, CalcResult, ResultGrid, ResultItem, ResultAlert } from "../../components/calc-ui";

const apgarParams = [
  { label: "Appearance (Warna Kulit)", options: ["0 - Biru/merah muda pucat", "1 - Tubuh merah muda, ekstremitas biru", "2 - Seluruh tubuh merah muda"] },
  { label: "Pulse (Denyut Jantung)", options: ["0 - Tidak ada", "1 - <100 x/mnt", "2 - ≥100 x/mnt"] },
  { label: "Grimace (Refleks)", options: ["0 - Tidak ada", "1 - Meringis", "2 - Menangis, batuk"] },
  { label: "Activity (Tonus Otot)", options: ["0 - Lemah", "1 - Fleksi ringan", "2 - Aktif bergerak"] },
  { label: "Respiration (Pernafasan)", options: ["0 - Tidak ada", "1 - Lemah, tidak teratur", "2 - Menangis kuat"] },
];

export function ApgarCalc() {
  const [scores, setScores] = useState([0, 0, 0, 0, 0]);

  const total = scores.reduce((a, b) => a + b, 0);

  let interp = "";
  let interpType: "success" | "warning" | "danger" = "success";
  let action = "";

  if (total >= 7) { interp = "Normal (7–10)"; interpType = "success"; action = "Perawatan rutin. Kontak kulit ibu."; }
  else if (total >= 4) { interp = "Depresi Sedang (4–6)"; interpType = "warning"; action = "VTP, O₂ aliran bebas. Pantau ketat."; }
  else { interp = "Depresi Berat (0–3)"; interpType = "danger"; action = "VTP aktif, kompresi dada bila HR <60. Siapkan intubasi."; }

  return (
    <CalcCard title="Skor APGAR" subtitle="Evaluasi neonatus" icon="📋" color="yellow">
      <div className="space-y-3">
        {apgarParams.map((param, i) => (
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
      <CalcResult color="yellow">
        <ResultGrid cols={2}>
          <ResultItem label="Total Skor" value={`${total}`} unit="/ 10" />
          <ResultItem label="Interpretasi" value={interp} />
        </ResultGrid>
        <ResultAlert type={interpType}>{action}</ResultAlert>
      </CalcResult>
    </CalcCard>
  );
}
