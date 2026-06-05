"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcResult, ResultAlert, InfoBox } from "../../components/calc-ui";

export function PRSLCalc() {
  const [protN, setProtN] = useState(0);
  const [na, setNa] = useState(0);
  const [k, setK] = useState(0);
  const [cl, setCl] = useState(0);
  const [phosphate, setPhosphate] = useState(0);

  const prsl = (protN / 28) + (na / 23) + (k / 39) + (cl / 23) + (phosphate / 31);
  const rounded = prsl.toFixed(1);

  let statusColor: "success" | "warning" | "danger" = "success";
  let statusText = "";
  if (prsl < 200) {
    statusColor = "success";
    statusText = "✓ AMAN — Bebas risiko renal";
  } else if (prsl < 261) {
    statusColor = "warning";
    statusText = "⚠️ BATAS AMAN — Pantau asupan cairan";
  } else {
    statusColor = "danger";
    statusText = "⛔ MELEBIHI BATAS — Risiko renal solute overload!";
  }

  const breakdown = `N/28=${(protN / 28).toFixed(1)} + Na/23=${(na / 23).toFixed(1)} + K/39=${(k / 39).toFixed(1)} + Cl/23=${(cl / 23).toFixed(1)} + P/31=${(phosphate / 31).toFixed(1)}`;

  return (
    <CalcCard title="PRSL Calculator" subtitle="Potential Renal Solute Load" icon="🧪" color="teal">
      <InfoBox>
        <strong>Rumus:</strong> PRSL = N/28 + Na/23 + K/39 + Cl/23 + P/31 &nbsp;|&nbsp; <strong>Aman: &lt;261 mOsm/L</strong>
      </InfoBox>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="Protein N (g)" value={protN} onChange={(v) => setProtN(v as number)} step={0.01} />
        <CalcInput label="Na (mg)" value={na} onChange={(v) => setNa(v as number)} step={0.1} />
        <CalcInput label="K (mg)" value={k} onChange={(v) => setK(v as number)} step={0.1} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Cl (mg)" value={cl} onChange={(v) => setCl(v as number)} step={0.1} />
        <CalcInput label="P (mg)" value={phosphate} onChange={(v) => setPhosphate(v as number)} step={0.1} />
      </div>
      <CalcResult color="teal">
        <div className="text-center py-2">
          <p className={`text-3xl font-bold font-mono ${
            statusColor === "success" ? "text-emerald-400" :
            statusColor === "warning" ? "text-amber-400" : "text-red-400"
          }`}>
            {rounded} mOsm/L
          </p>
        </div>
        <ResultAlert type={statusColor}>{statusText}</ResultAlert>
        <p className="text-[11px] text-muted-foreground text-center font-mono">{breakdown}</p>
      </CalcResult>
    </CalcCard>
  );
}
