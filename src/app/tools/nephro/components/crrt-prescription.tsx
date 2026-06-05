"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function CRRTCalc() {
  const { weightGram } = usePatient();
  const [mode, setMode] = useState("CVVH");
  const [flowRate, setFlowRate] = useState(1000);
  const [effluent, setEffluent] = useState(2500);
  const [weight, setWeight] = useState(weightGram / 1000);

  const mlPerKgHr = weight > 0 ? effluent / weight : 0;

  const modes = [
    { value: "CVVH", label: "CVVH (Convection)" },
    { value: "CVVHD", label: "CVVHD (Diffusion)" },
    { value: "CVVHDF", label: "CVVHDF (Combined)" },
  ];

  const indications = [
    "Fluid overload refractory to diuretics",
    "Severe electrolyte imbalance (K⁺ >6.5, Na⁺ <120)",
    "Metabolic acidosis (pH <7.1, HCO₃ <10)",
    "Uremic encephalopathy",
    "Drug/toxin removal",
  ];

  return (
    <CalcCard title="CRRT Prescription" icon="🫁">
      <div className="space-y-3">
        <CalcSelect label="Mode" value={mode} onChange={setMode} options={modes} />
        <CalcInput label="Berat Badan (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={2} />
        <CalcInput label="Blood Flow Rate (mL/min)" unit="mL/min" value={flowRate} onChange={(v) => setFlowRate(typeof v === "string" ? parseFloat(v) || 0 : v)} min={10} />
        <CalcInput label="Effluent Rate (mL/hr)" unit="mL/hr" value={effluent} onChange={(v) => setEffluent(typeof v === "string" ? parseFloat(v) || 0 : v)} min={500} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Mode" value={mode} />
            <ResultItem label="Effluent Dose" value={`${mlPerKgHr.toFixed(0)} mL/kg/hr`} />
            <ResultItem label="Replacement Fluid" value={mode === "CVVHD" ? "Post-filter" : "Pre + Post filter"} />
            <ResultItem label="Dialysate Rate" value={`${effluent - flowRate * 0.5} mL/hr`} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          Target effluent: 20-30 mL/kg/hr (adult). Pediatric: 20-40 mL/kg/hr depending on indication.
          CRRT membrane: AN69 or polysulfone. Anticoagulation: regional citrate (preferred) or heparin.
        </InfoBox>
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <strong className="text-foreground">Mode Selection:</strong>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>• <span className="text-neon">CVVH</span>: Convection. Good for solute removal. Replacement fluid needed.</li>
            <li>• <span className="text-neon">CVVHD</span>: Diffusion. Dialysate flows countercurrent. No replacement fluid.</li>
            <li>• <span className="text-neon">CVVHDF</span>: Combined. Most efficient. Replacement + dialysate.</li>
          </ul>
        </div>
      </div>
    </CalcCard>
  );
}
