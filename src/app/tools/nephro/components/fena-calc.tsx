"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

export function FENaCalc() {
  const [naSerum, setNaSerum] = useState(140);
  const [naUrine, setNaUrine] = useState(15);
  const [crSerum, setCrSerum] = useState(1.5);
  const [crUrine, setCrUrine] = useState(80);
  const [bunSerum, setBunSerum] = useState(40);
  const [ureaUrine, setUreaUrine] = useState(800);

  const fena = +((naUrine / naSerum) / (crUrine / crSerum) * 100).toFixed(2);
  const feurea = +(((ureaUrine / 2.14) / (bunSerum / 2.14)) / (crUrine / crSerum) * 100).toFixed(2);

  let fenaInterp = "";
  if (fena < 1) fenaInterp = "🔵 FENa <1% → Sugestif Pre-renal atau AKI kontras/mioglobin. Volume-respon kemungkinan baik.";
  else if (fena < 2) fenaInterp = "🟡 FENa 1–2% → Zona abu-abu. Evaluasi klinis + FEUrea.";
  else fenaInterp = "🔴 FENa ≥2% → Sugestif ATN/Intrinsik. Respon volume kurang baik.";

  let feureaInterp = "";
  if (feurea < 35) feureaInterp = "FEUrea <35% → Pre-renal (lebih valid bila pakai diuretik).";
  else feureaInterp = "FEUrea ≥35% → Intrinsik/ATN.";

  return (
    <CalcCard title="FENa & FEUrea" subtitle="Diferensiasi AKI pre-renal vs intrinsik" icon="🔬" color="orange">
      <InfoBox>
        <strong>FENa &lt;1%</strong>: pre-renal. <strong>FEUrea &lt;35%</strong>: pre-renal (lebih valid bila pakai diuretik). FENa ≥2%: intrinsik/ATN.
      </InfoBox>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="Na Serum (mEq/L)" value={naSerum} onChange={(v) => setNaSerum(v as number)} />
        <CalcInput label="Na Urin (mEq/L)" value={naUrine} onChange={(v) => setNaUrine(v as number)} />
        <CalcInput label="Cr Serum (mg/dL)" value={crSerum} onChange={(v) => setCrSerum(v as number)} step={0.01} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="Cr Urin (mg/dL)" value={crUrine} onChange={(v) => setCrUrine(v as number)} />
        <CalcInput label="BUN Serum (mg/dL)" value={bunSerum} onChange={(v) => setBunSerum(v as number)} />
        <CalcInput label="Urea Urin (mg/dL)" value={ureaUrine} onChange={(v) => setUreaUrine(v as number)} />
      </div>
      <CalcResult color="orange">
        <ResultGrid cols={3}>
          <ResultItem label="FENa" value={`${fena}`} unit="%" />
          <ResultItem label="FEUrea" value={`${feurea}`} unit="%" />
          <ResultItem label="Interpretasi" value="" />
        </ResultGrid>
        <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
          <p>{fenaInterp}</p>
          <p>{feureaInterp}</p>
        </div>
      </CalcResult>
    </CalcCard>
  );
}
