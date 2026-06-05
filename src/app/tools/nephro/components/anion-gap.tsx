"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

export function AnionGapCalc() {
  const [na, setNa] = useState(140);
  const [cl, setCl] = useState(104);
  const [hco3, setHco3] = useState(22);
  const [alb, setAlb] = useState(4);
  const [glu, setGlu] = useState(90);
  const [bun, setBun] = useState(15);
  const [osmMeas, setOsmMeas] = useState(0);

  const ag = na - cl - hco3;
  const agCorr = +(ag + 2.5 * (4 - alb)).toFixed(1);
  const osmCalc = +(2 * na + glu / 18 + bun / 2.8).toFixed(1);
  const osmGap = osmMeas > 0 ? +(osmMeas - osmCalc).toFixed(1) : null;

  let interp = "";
  if (agCorr > 12) {
    interp = "🔴 Anion Gap Tinggi — MUDPILES: Methanol, Uremia, DKA, Propylene glycol, Isoniazid, Lactic acidosis, Ethylene glycol, Salicylates.";
    if (osmGap !== null && osmGap > 10) interp += " ⚠️ Osmolal Gap tinggi — curiga alkohol toksik (metanol, etilen glikol).";
  } else if (agCorr < 8) {
    interp = "🟡 Anion Gap Rendah — hipoalbuminemia, paraproteinemia, atau hipermagnesia.";
  } else {
    interp = "🟢 Anion Gap Normal (8–12 mEq/L).";
    if (hco3 < 22) interp += " → Non-AG asidosis metabolik: diare, RTA, HCO₃ loss.";
  }

  return (
    <CalcCard title="Anion Gap & Osmolal Gap" subtitle="Analisis gangguan asam basa" icon="🧮" color="green">
      <div className="grid grid-cols-4 gap-3">
        <CalcInput label="Na (mEq/L)" value={na} onChange={(v) => setNa(v as number)} />
        <CalcInput label="Cl (mEq/L)" value={cl} onChange={(v) => setCl(v as number)} />
        <CalcInput label="HCO₃ (mEq/L)" value={hco3} onChange={(v) => setHco3(v as number)} />
        <CalcInput label="Albumin (g/dL)" value={alb} onChange={(v) => setAlb(v as number)} step={0.1} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="Osmolalitas Terukur" value={osmMeas} onChange={(v) => setOsmMeas(v as number)} placeholder="opsional" />
        <CalcInput label="Glukosa (mg/dL)" value={glu} onChange={(v) => setGlu(v as number)} />
        <CalcInput label="BUN (mg/dL)" value={bun} onChange={(v) => setBun(v as number)} />
      </div>
      <CalcResult color="green">
        <ResultGrid cols={2}>
          <ResultItem label="Anion Gap" value={`${ag}`} unit="mEq/L" note="N: 8–12" />
          <ResultItem label="AG Terkoreksi Albumin" value={`${agCorr}`} unit="mEq/L" />
          <ResultItem label="Osmolalitas Kalkulasi" value={`${osmCalc}`} unit="mOsm/kg" />
          <ResultItem label="Osmolal Gap" value={osmGap !== null ? `${osmGap}` : "—"} unit="mOsm/kg" note="N: <10" />
        </ResultGrid>
        <div className="text-xs text-muted-foreground leading-relaxed">{interp}</div>
      </CalcResult>
    </CalcCard>
  );
}
