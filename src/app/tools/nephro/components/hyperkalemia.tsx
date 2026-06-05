"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function HyperkalemiaCalc() {
  const [k, setK] = useState(6.0);
  const [ecg, setEcg] = useState("none");
  const [cr, setCr] = useState(0.8);

  const severity =
    k >= 7 ? { label: "Severe", color: "text-red-500" } :
    k >= 6 ? { label: "Moderate", color: "text-orange-400" } :
    k >= 5.5 ? { label: "Mild", color: "text-yellow-400" } :
    { label: "Normal", color: "text-green-400" };

  const ecgChanges = ecg === "peaked" || ecg === "wide" || ecg === "sine";

  return (
    <CalcCard title="Hyperkalemia Management" icon="⚡">
      <div className="space-y-3">
        <CalcInput label="Serum K⁺ (mEq/L)" unit="mEq/L" value={k} onChange={(v) => setK(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} step={0.1} />
        <CalcInput label="Creatinine (mg/dL)" unit="mg/dL" value={cr} onChange={(v) => setCr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.1} step={0.1} />
        <CalcSelect label="ECG Changes" value={ecg} onChange={setEcg} options={[
          { value: "none", label: "Normal" },
          { value: "peaked", label: "Peaked T waves" },
          { value: "wide", label: "Wide QRS" },
          { value: "sine", label: "Sine wave (pre-arrest)" },
        ]} />
        <CalcResult>
          <ResultItem label="Severity" value={severity.label} className={severity.color} />
        </CalcResult>
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <strong className="text-foreground">Immediate Treatment:</strong>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>• <span className="text-neon">Calcium gluconate 10% 0.5-1 mL/kg IV</span> (ECG changes → immediate)</li>
            <li>• <span className="text-neon">Insulin 0.1 U/kg + Dextrose 2 g/U</span> (shift K intracellular)</li>
            <li>• <span className="text-neon">NaHCO₃ 1-2 mEq/kg IV</span> (if acidotic)</li>
            <li>• <span className="text-neon">Nebulized Albuterol 10-20 mg</span> (adjunct)</li>
            <li>• <span className="text-neon">Sodium polystyrene sulfonate 1 g/kg PO</span> (elimination)</li>
            <li>• <span className="text-neon">Furosemide 1-2 mg/kg IV</span> (if renal function adequate)</li>
          </ul>
        </div>
        <InfoBox>
          {k >= 7 ? "EMERGENCY: K⁺ ≥7.0. Berikan calcium gluconate SEGERA. EKG monitor continuous." :
           k >= 6 ? "K⁺ ≥6.0. Insulin+Dextrose + kalsium gluconate. Ulang K⁺ dalam 2 jam." :
           "K⁺ 5.5-6.0. Batasi asupan K⁺. Pertimbangkan diuretik atau resin."}
        </InfoBox>
      </div>
    </CalcCard>
  );
}
