"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const methods = [
  { value: "schwartz", label: "Schwartz (2009)" },
  { value: "ckid", label: "CKiD (Schwartz 2012)" },
  { value: "bedside", label: "Bedside Schwartz" },
  { value: "original", label: "Original Schwartz" },
];

export function GFRCalc() {
  const { weightGram, ageMonths } = usePatient();
  const [scr, setScr] = useState(0.5);
  const [height, setHeight] = useState(100);
  const [method, setMethod] = useState("schwartz");

  const scrMg = scr;
  const heightCm = height;
  const ageYr = ageMonths / 12;

  let gfr = 0;
  let formula = "";
  if (method === "schwartz") {
    const k = ageYr < 1 ? 0.33 : ageYr < 13 ? 0.55 : 0.7;
    gfr = (k * heightCm) / scrMg;
    formula = `GFR = ${k} × ${heightCm} / ${scrMg}`;
  } else if (method === "ckid") {
    gfr = (42.3 * heightCm) / (scrMg * 1.73);
    formula = `GFR = 42.3 × ${heightCm} / (${scrMg} × 1.73)`;
  } else if (method === "bedside") {
    gfr = (0.43 * heightCm) / scrMg;
    formula = `GFR = 0.43 × ${heightCm} / ${scrMg}`;
  } else {
    gfr = (0.48 * heightCm) / scrMg;
    formula = `GFR = 0.48 × ${heightCm} / ${scrMg}`;
  }

  const stage =
    gfr >= 90 ? { label: "G1 Normal", color: "text-green-400" } :
    gfr >= 60 ? { label: "G2 Mild ↓", color: "text-yellow-400" } :
    gfr >= 45 ? { label: "G3a Moderate ↓", color: "text-orange-400" } :
    gfr >= 30 ? { label: "G3b Moderate-Severe ↓", color: "text-red-400" } :
    gfr >= 15 ? { label: "G4 Severe ↓", color: "text-red-400" } :
    { label: "G5 Kidney Failure", color: "text-red-500" };

  return (
    <CalcCard title="GFR Calculator" icon="🫘">
      <div className="space-y-3">
        <CalcSelect label="Metode" value={method} onChange={setMethod} options={methods} />
        <CalcInput label="Serum Creatinine (mg/dL)" unit="mg/dL" value={scr} onChange={(v) => setScr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.1} step={0.1} />
        <CalcInput label="Tinggi Badan (cm)" unit="cm" value={height} onChange={(v) => setHeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={20} />
        <InfoBox>{formula}</InfoBox>
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="GFR" value={`${Math.round(gfr)} mL/min/1.73m²`} />
            <ResultItem label="Stage" value={stage.label} className={stage.color} />
          </ResultGrid>
        </CalcResult>
        {ageYr < 1 && (
          <InfoBox>
            Neonatal GFR ≈ 2-4 mL/min/1.73m². Rises to adult level by 1-2 tahun.
          </InfoBox>
        )}
      </div>
    </CalcCard>
  );
}
