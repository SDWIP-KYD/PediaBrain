"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function ComplementCalc() {
  const [c3, setC3] = useState(120);
  const [c4, setC4] = useState(30);
  const [ch50, setCh50] = useState(50);

  const c3Status = c3 < 90 ? "Low" : c3 > 180 ? "High" : "Normal";
  const c4Status = c4 < 10 ? "Low" : c4 > 50 ? "High" : "Normal";

  const interpretation = [
    { c3: "Low", c4: "Low", dd: "SLE, Post-streptococcal GN, MPGN, Cryoglobulinemia, Hypocomplementemic urticarial vasculitis" },
    { c3: "Low", c4: "Normal", dd: "Post-streptococcal GN (early), C3 nephritic factor, MPGN Type II" },
    { c3: "Normal", c4: "Low", dd: "Hereditary angioedema, Viral hepatitis, SLE (mild), Essential mixed cryoglobulinemia" },
    { c3: "Normal", c4: "Normal", dd: "IgA nephropathy, Henoch-Schönlein, Pauci-immune GN, Most drug-induced" },
  ];

  const match = interpretation.find((i) => i.c3 === c3Status && i.c4 === c4Status);

  return (
    <CalcCard title="Complement Levels" icon="🧬">
      <div className="space-y-3">
        <CalcInput label="C3 (mg/dL)" unit="mg/dL" value={c3} onChange={(v) => setC3(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        <CalcInput label="C4 (mg/dL)" unit="mg/dL" value={c4} onChange={(v) => setC4(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        <CalcInput label="CH50 (%)" unit="%" value={ch50} onChange={(v) => setCh50(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="C3" value={`${c3} mg/dL (${c3Status})`} className={c3Status === "Low" ? "text-orange-400" : "text-green-400"} />
            <ResultItem label="C4" value={`${c4} mg/dL (${c4Status})`} className={c4Status === "Low" ? "text-orange-400" : "text-green-400"} />
            <ResultItem label="CH50" value={`${ch50}%`} />
          </ResultGrid>
        </CalcResult>
        {match && (
          <InfoBox>
            <strong>Differential Diagnosis (C3 {c3Status}, C4 {c4Status}):</strong>
            <br />{match.dd}
          </InfoBox>
        )}
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <strong className="text-foreground">Complement Pathways:</strong>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>• <span className="text-neon">Classical:</span> C1q → C1r → C1s → C4 → C2 → C3 → MAC</li>
            <li>• <span className="text-neon">Alternative:</span> C3 → Factor B → Factor D → C3 convertase → MAC</li>
            <li>• <span className="text-neon">Lectin:</span> MBL → MASPs → C4 → C2 → C3 → MAC</li>
          </ul>
        </div>
      </div>
    </CalcCard>
  );
}
