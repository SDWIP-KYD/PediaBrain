"use client";

import { useState } from "react";
import { CalcCard, CalcSelect, CalcResult, ResultGrid, ResultItem, ResultAlert } from "../../components/calc-ui";

const params = ["Wajah", "Kaki", "Aktivitas", "Menangis", "Bisa ditenangkan"];

export function FLACCCalc() {
  const [scores, setScores] = useState([0, 0, 0, 0, 0]);
  const total = scores.reduce((a, b) => a + b, 0);

  let interp = "";
  let interpType: "success" | "warning" | "danger" = "success";
  let action = "";

  if (total === 0) { interp = "Tidak ada nyeri"; interpType = "success"; action = "Relaksasi/tidur."; }
  else if (total <= 3) { interp = "Nyeri ringan"; interpType = "warning"; action = "Monitoring, intervensi non-farmakologis."; }
  else if (total <= 6) { interp = "Nyeri sedang"; interpType = "warning"; action = "Analgesik PRN; tindakan kenyamanan."; }
  else { interp = "Nyeri berat"; interpType = "danger"; action = "Analgesik segera! Titrate opioid."; }

  return (
    <CalcCard title="FLACC Score" subtitle="Penilaian nyeri pediatrik" icon="📋" color="orange">
      <div className="space-y-3">
        {params.map((p, i) => (
          <div key={i} className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">{p}</label>
            <select
              value={scores[i]}
              onChange={(e) => {
                const ns = [...scores];
                ns[i] = parseInt(e.target.value);
                setScores(ns);
              }}
              className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-neon/30"
            >
              <option value={0}>0 — {p === "Wajah" ? " cemberut sesekali" : p === "Kaki" ? " santai" : p === "Aktivitas" ? " berbaring tenang" : p === "Menangis" ? " tidak menangis" : " tenang"}</option>
              <option value={1}>1 — {p === "Wajah" ? " sering cemberut" : p === "Kaki" ? " tegang" : p === "Aktivitas" ? " gelisah" : p === "Menangis" ? " mengerang" : " mudah ditenangkan"}</option>
              <option value={2}>2 — {p === "Wajah" ? " cemberut terus" : p === "Kaki" ? " menendang" : p === "Aktivitas" ? " aktif" : p === "Menangis" ? " menangis" : " sulit ditenangkan"}</option>
            </select>
          </div>
        ))}
      </div>
      <CalcResult color="orange">
        <ResultGrid cols={2}>
          <ResultItem label="Total Skor" value={`${total}`} unit="/ 10" />
          <ResultItem label="Interpretasi" value={interp} />
        </ResultGrid>
        <ResultAlert type={interpType}>{action}</ResultAlert>
      </CalcResult>
    </CalcCard>
  );
}
