"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const rtaTypes = [
  {
    type: "Type 1 (Distal)",
    features: "Inability to secrete H⁺ in distal tubule",
    ph: "Urine pH >5.5 despite systemic acidosis",
    k: "Hypokalemia",
    treatment: "Oral alkali (NaHCO₃ 1-2 mEq/kg/day or Shohl's solution)",
    causes: "Sjögren, SLE, Obstruksi UU, Amphotericin B",
  },
  {
    type: "Type 2 (Proximal)",
    features: "Impaired HCO₃⁻ reabsorption in proximal tubule",
    ph: "Urine pH <5.5 when serum HCO₃⁻ normalized",
    k: "Hypokalemia (worsens with alkali therapy)",
    treatment: "NaHCO₃ 5-10 mEq/kg/day (high dose needed)",
    causes: "Fanconi syndrome, Cystinosis, Tyrosinemia, Wilson",
  },
  {
    type: "Type 3 (Mixed)",
    features: "Combined Type 1 + HCO₃⁻ wasting",
    ph: "Urine pH >5.5",
    k: "Hypokalemia",
    treatment: "High dose alkali + K⁺ supplementation",
    causes: "Rare, often genetic",
  },
  {
    type: "Type 4",
    features: "Aldosterone deficiency or resistance",
    ph: "Urine pH <5.5 (can acidify)",
    k: "Hyperkalemia",
    treatment: "Fludrocortisone 0.05-0.1 mg/day + K⁺ binders",
    causes: "Hyporeninemic hypoaldosteronism, Addison, K-sparing diuretics",
  },
];

export function RTACalc() {
  const [type, setType] = useState("Type 1 (Distal)");
  const [ph, setPh] = useState(7.30);
  const [hco3, setHco3] = useState(16);
  const [k, setK] = useState(3.2);

  const selected = rtaTypes.find((r) => r.type === type)!;

  return (
    <CalcCard title="RTA Classification" icon="🔬">
      <div className="space-y-3">
        <CalcSelect label="RTA Type" value={type} onChange={setType} options={rtaTypes.map((r) => ({ value: r.type, label: r.type }))} />
        <CalcInput label="Serum pH" value={ph} onChange={(v) => setPh(typeof v === "string" ? parseFloat(v) || 0 : v)} min={6.5} max={8} step={0.01} />
        <CalcInput label="HCO₃⁻ (mEq/L)" unit="mEq/L" value={hco3} onChange={(v) => setHco3(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} max={40} />
        <CalcInput label="K⁺ (mEq/L)" unit="mEq/L" value={k} onChange={(v) => setK(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} max={10} step={0.1} />
        <div className="rounded-lg border border-border bg-card p-3 text-sm space-y-2">
          <div><span className="font-medium text-foreground">Features: </span><span className="text-muted-foreground">{selected.features}</span></div>
          <div><span className="font-medium text-foreground">K Status: </span><span className="text-muted-foreground">{selected.k}</span></div>
          <div><span className="font-medium text-foreground">Treatment: </span><span className="text-neon">{selected.treatment}</span></div>
          <div><span className="font-medium text-foreground">Causes: </span><span className="text-muted-foreground">{selected.causes}</span></div>
        </div>
        <CalcResult>
          <ResultItem
            label="Hypokalemia?"
            value={k < 3.5 ? "Yes — likely Type 1/2/3" : k > 5.0 ? "Hyperkalemia — likely Type 4" : "Normal"}
            className={k < 3.5 ? "text-yellow-400" : k > 5.0 ? "text-red-400" : "text-green-400"}
          />
        </CalcResult>
      </div>
    </CalcCard>
  );
}
