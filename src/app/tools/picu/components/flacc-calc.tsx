"use client";

import { useState } from "react";
import { CalcCard, CalcSelect, CalcResult, ResultGrid, ResultItem, ResultAlert } from "../../components/calc-ui";

const params = ["Face", "Legs", "Activity", "Cry", "Consolability"];

export function FLACCCalc() {
  const [scores, setScores] = useState([0, 0, 0, 0, 0]);
  const total = scores.reduce((a, b) => a + b, 0);

  let interp = "";
  let interpType: "success" | "warning" | "danger" = "success";
  let action = "";

  if (total === 0) { interp = "No pain"; interpType = "success"; action = "Relaxation/sleep."; }
  else if (total <= 3) { interp = "Mild pain"; interpType = "warning"; action = "Monitoring, non-pharmacologic interventions."; }
  else if (total <= 6) { interp = "Moderate pain"; interpType = "warning"; action = "PRN analgesic; comfort measures."; }
  else { interp = "Severe pain"; interpType = "danger"; action = "Analgesic segera! Titrate opioid."; }

  return (
    <CalcCard title="FLACC Score" subtitle="Pediatric pain assessment" icon="📋" color="orange">
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
              <option value={0}>0 — {p === "Face" ? " occasional grimace" : p === "Legs" ? " relaxed" : p === "Activity" ? " lying quietly" : p === "Cry" ? " no cry" : " content"}</option>
              <option value={1}>1 — {p === "Face" ? " frequent grimace" : p === "Legs" ? " tense" : p === "Activity" ? " squirming" : p === "Cry" ? " moans" : " soothing"}</option>
              <option value={2}>2 — {p === "Face" ? " constant grimace" : p === "Legs" ? " kicking" : p === "Activity" ? " active" : p === "Cry" ? " crying" : "无法comfort"}</option>
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
