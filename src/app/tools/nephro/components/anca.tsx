"use client";

import { useState } from "react";
import { CalcCard, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function ANCACalc() {
  const [ancaType, setAncaType] = useState("c-anca");
  const [pr3, setPr3] = useState(50);
  const [mpo, setMpo] = useState(10);

  const cAncaHigh = pr3 > 20;
  const pAncaHigh = mpo > 20;

  const diagnosis =
    cAncaHigh && pr3 > 100 ? "PR3-ANCA (c-ANCA): GPA (Wegener's)" :
    cAncaHigh ? "PR3-ANCA: GPA likely" :
    pAncaHigh && mpo > 100 ? "MPO-ANCA (p-ANCA): MPA or EGPA" :
    pAncaHigh ? "MPO-ANCA: MPA or EGPA likely" :
    "ANCA-negative: Consider other causes";

  return (
    <CalcCard title="ANCA Interpretation" icon="🔬">
      <div className="space-y-3">
        <CalcSelect label="ANCA Pattern (IF)" value={ancaType} onChange={setAncaType} options={[
          { value: "c-anca", label: "c-ANCA (cytoplasmic)" },
          { value: "p-anca", label: "p-ANCA (perinuclear)" },
          { value: "a-anca", label: "a-ANCA (atypical)" },
          { value: "negative", label: "Negative" },
        ]} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="PR3 (Anti-proteinase 3)" value={`${pr3} U/mL`} className={cAncaHigh ? "text-orange-400" : ""} />
            <ResultItem label="MPO (Myeloperoxidase)" value={`${mpo} U/mL`} className={pAncaHigh ? "text-orange-400" : ""} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          <strong>Interpretation:</strong> {diagnosis}
        </InfoBox>
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <strong className="text-foreground">ANCA-Associated Vasculitis:</strong>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>• <span className="text-neon">GPA (Wegener's):</span> c-ANCA/PR3. Upper/Lower respiratory + GN + GPA triad.</li>
            <li>• <span className="text-neon">MPA:</span> p-ANCA/MPO. Pauci-immune GN. No asthma.</li>
            <li>• <span className="text-neon">EGPA (Churg-Strauss):</span> p-ANCA/MPO. Asthma + eosinophilia + vasculitis.</li>
          </ul>
        </div>
        <InfoBox>
          ANCA testing: IF + ELISA. ANCA-positive without vasculitis: consider infections (TB, HIV), drugs (propylthiouracil, hydralazine), IBD.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
