"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function ProteinuriaCalc() {
  const [acr, setAcr] = useState(30);
  const [pcr, setPcr] = useState(0.5);
  const [scr, setScr] = useState(0.5);

  const acrCategory =
    acr < 30 ? { label: "Normal (A1)", color: "text-green-400", risk: "Low risk" } :
    acr < 300 ? { label: "Moderately Increased (A2)", color: "text-yellow-400", risk: "Moderate risk" } :
    { label: "Severely Increased (A3)", color: "text-red-400", risk: "High risk" };

  return (
    <CalcCard title="Proteinuria Assessment" icon="🧪">
      <div className="space-y-3">
        <CalcInput label="Urine Albumin/Creatinine Ratio (mg/g)" unit="mg/g" value={acr} onChange={(v) => setAcr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        <CalcInput label="Urine Protein/Creatinine Ratio (g/g)" unit="g/g" value={pcr} onChange={(v) => setPcr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} step={0.01} />
        <CalcResult>
          <ResultItem label="Category" value={acrCategory.label} className={acrCategory.color} />
          <ResultItem label="Risk" value={acrCategory.risk} />
        </CalcResult>
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <strong className="text-foreground">KDIGO ACR Classification:</strong>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>• <span className="text-green-400">A1: &lt;30 mg/g</span> — Normal</li>
            <li>• <span className="text-yellow-400">A2: 30-300 mg/g</span> — Moderately increased (microalbuminuria)</li>
            <li>• <span className="text-red-400">A3: &gt;300 mg/g</span> — Severely increased (macroalbuminuria)</li>
          </ul>
        </div>
        {pcr > 3.5 && (
          <InfoBox>
            Nephrotic range proteinuria (PCR &gt;3.5 g/g): Pertimbangkan biopsy ginjal. Differential: MCD, FSGS, membranous.
          </InfoBox>
        )}
        <InfoBox>
          UACR lebih akurat dari dipstick. Pada anak, UPCR &gt;0.5 g/g = abnormal. Gunakan specimen pagi hari.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
