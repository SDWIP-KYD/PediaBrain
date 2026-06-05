"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

export function CalciumAssessmentCalc() {
  const [caTot, setCaTot] = useState(9);
  const [alb, setAlb] = useState(4);
  const [ph, setPh] = useState(7.4);
  const [phosphate, setPhosphate] = useState(4.5);
  const [pth, setPth] = useState(65);
  const [vitD, setVitD] = useState(30);

  const caCorr = +(caTot + 0.8 * (4 - alb)).toFixed(2);
  const caPhosProd = +(caCorr * phosphate).toFixed(1);
  const caIon = +(caCorr / (1 + 0.04 * (7.4 - ph) + 0.46 * alb / 4)).toFixed(2);

  let pthStatus = "";
  if (pth > 300) pthStatus = "🔴 Hiperparatiroid berat (CKD-MBD)";
  else if (pth > 150) pthStatus = "🟡 PTH tinggi";
  else if (pth < 15) pthStatus = "🔴 Hipoparatiroid";
  else pthStatus = "🟢 Normal";

  let interp = "";
  if (caCorr < 8) interp += "🔴 Hipokalsemia — Ca terkoreksi rendah. Cek PTH, Vit D. Suplementasi Ca + Kalsitriol. ";
  else if (caCorr > 11) interp += "🔴 Hiperkalsemia — evaluasi PTH, keganasan, Vit D toksisitas. ";
  if (caPhosProd > 55) interp += "⚠️ Ca×P produk >55 — risiko kalsifikasi vaskular! Kurangi fosfat dalam diet. ";
  if (vitD < 20) interp += "🟡 Defisiensi Vit D (<20 ng/mL) — suplementasi Vit D3 2000–4000 IU/hari. ";
  if (!interp) interp = "🟢 Homeostasis kalsium-fosfat dalam batas normal.";

  return (
    <CalcCard title="Kalsium, Fosfat & PTH" subtitle="Homeostasis mineral pada CKD" icon="🦴" color="yellow">
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="Ca Total (mg/dL)" value={caTot} onChange={(v) => setCaTot(v as number)} step={0.1} />
        <CalcInput label="Albumin (g/dL)" value={alb} onChange={(v) => setAlb(v as number)} step={0.1} />
        <CalcInput label="pH (opsional)" value={ph} onChange={(v) => setPh(v as number)} step={0.01} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="Fosfat (mg/dL)" value={phosphate} onChange={(v) => setPhosphate(v as number)} step={0.1} />
        <CalcInput label="PTH (pg/mL)" value={pth} onChange={(v) => setPth(v as number)} />
        <CalcInput label="Vit D 25(OH) (ng/mL)" value={vitD} onChange={(v) => setVitD(v as number)} />
      </div>
      <CalcResult color="yellow">
        <ResultGrid cols={3}>
          <ResultItem label="Ca Tercoreksi" value={`${caCorr}`} unit="mg/dL" note="Albumin adj." />
          <ResultItem label="Ca × P Produk" value={`${caPhosProd}`} unit="mg²/dL²" note="≤55 target" />
          <ResultItem label="Ca Ionized (est.)" value={`${caIon}`} unit="mmol/L" />
        </ResultGrid>
        <ResultGrid cols={1}>
          <ResultItem label="Status PTH" value={pthStatus} />
        </ResultGrid>
        <div className="text-xs text-muted-foreground leading-relaxed">{interp}</div>
      </CalcResult>
    </CalcCard>
  );
}
