"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

export function FluidOverloadCalc() {
  const [baseWeight, setBaseWeight] = useState(20);
  const [actualWeight, setActualWeight] = useState(22);
  const [totalInput, setTotalInput] = useState(2000);
  const [totalOutput, setTotalOutput] = useState(800);

  const foPct = +((actualWeight - baseWeight) / baseWeight * 100).toFixed(1);
  const balance = totalInput - totalOutput;

  let status = "";
  let rec = "";
  if (foPct <= 5) {
    status = "✅ Normal (≤5%)";
    rec = "🟢 Lanjutkan monitoring. Target balance negatif bila edema.";
  } else if (foPct <= 10) {
    status = "⚠️ Elevated (5–10%)";
    rec = "🟡 Pertimbangkan restriksi cairan. Diuretik bila GFR adekuat.";
  } else if (foPct <= 20) {
    status = "🔴 Berat (10–20%)";
    rec = "🔴 Associated with increased PICU mortality. Diuretik intensif atau CRRT.";
  } else {
    status = "⛔ Sangat Berat (>20%)";
    rec = "⛔ Indikasi kuat RRT/CRRT. Konsul nefrologi SEGERA.";
  }

  const alertType = foPct > 10 ? "danger" : foPct > 5 ? "warning" : "success";

  return (
    <CalcCard title="Fluid Overload Assessment" subtitle="% kelebihan cairan pada AKI / PICU" icon="⚖️" color="blue">
      <InfoBox>
        FO% = [(BB aktual – BB baseline) / BB baseline] × 100%. FO &gt;10% → outcome buruk. FO &gt;20% → pertimbangkan dialisis.
      </InfoBox>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="BB Baseline (kg)" value={baseWeight} onChange={(v) => setBaseWeight(v as number)} />
        <CalcInput label="BB Aktual (kg)" value={actualWeight} onChange={(v) => setActualWeight(v as number)} />
        <CalcInput label="Total Input (mL)" value={totalInput} onChange={(v) => setTotalInput(v as number)} />
      </div>
      <CalcInput label="Total Output (mL)" value={totalOutput} onChange={(v) => setTotalOutput(v as number)} />
      <CalcResult color="blue">
        <ResultGrid cols={3}>
          <ResultItem label="Fluid Overload" value={`${foPct}`} unit="%" />
          <ResultItem label="Balance Cairan" value={`${balance > 0 ? "+" : ""}${balance}`} unit="mL" />
          <ResultItem label="Status" value={status} />
        </ResultGrid>
        <ResultAlert type={alertType}>{rec}</ResultAlert>
      </CalcResult>
    </CalcCard>
  );
}
