"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function BUNCreatRatioCalc() {
  const [bun, setBun] = useState(20);
  const [creatinine, setCreatinine] = useState(0.8);

  const ratio = bun / (creatinine * 10);
  const interpretation =
    ratio > 20 ? "Prerenal (hipovolemia, CHF, hepatorenal)" :
    ratio > 10 ? "Normal" :
    ratio > 5 ? "Normal range" :
    "Intrinsic renal (ATN, interstitial nephritis) or low protein intake";

  const prerenalFactors = [
    "Hypovolemia", "CHF", "Hepatorenal syndrome",
    "High protein diet", "GI bleed", "Catabolic state",
  ];

  return (
    <CalcCard title="BUN/Creatinine Ratio" icon="🧪">
      <div className="space-y-3">
        <CalcInput label="BUN (mg/dL)" unit="mg/dL" value={bun} onChange={(v) => setBun(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} />
        <CalcInput label="Creatinine (mg/dL)" unit="mg/dL" value={creatinine} onChange={(v) => setCreatinine(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.1} step={0.1} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="BUN/Cr Ratio" value={ratio.toFixed(1)} />
            <ResultItem
              label="Diagnosis"
              value={ratio > 20 ? "Prerenal" : ratio > 10 ? "Normal" : "Intrinsic/Postrenal"}
              className={ratio > 20 ? "text-orange-400" : ratio > 10 ? "text-green-400" : "text-red-400"}
            />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          BUN/Cr &gt;20: Prerenal azotemia. Pertimbangkan: hipovolemia, CHF, GI bleed, diet tinggi protein.
          BUN/Cr &lt;5: ATN, interstitial nephritis, low protein diet, liver disease.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
