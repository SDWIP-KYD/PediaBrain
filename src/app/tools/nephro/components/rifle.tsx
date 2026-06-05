"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function RIFLECalc() {
  const [scr, setScr] = useState(1.0);
  const [baselineScr, setBaselineScr] = useState(0.5);
  const [uo, setUo] = useState(1.0);
  const [hours, setHours] = useState(24);

  const scrRatio = baselineScr > 0 ? scr / baselineScr : 1;
  const gfrDrop = ((baselineScr - scr) / baselineScr) * 100;

  const stage =
    (scrRatio >= 3 || gfrDrop >= 75 || uo < 0.3) ? { stage: "Failure", color: "text-red-500" } :
    (scrRatio >= 2 || gfrDrop >= 50 || uo < 0.5) ? { stage: "Injury", color: "text-orange-400" } :
    (scrRatio >= 1.5 || gfrDrop >= 25) ? { stage: "Risk", color: "text-yellow-400" } :
    { stage: "No RIFLE", color: "text-green-400" };

  const riskData = [
    { risk: "Risk", scr: "↑1.5× atau ↓GFR >25%", uo: "<0.5 mL/kg/hr ×6hr" },
    { risk: "Injury", scr: "↑2× atau ↓GFR >50%", uo: "<0.5 mL/kg/hr ×12hr" },
    { risk: "Failure", scr: "↑3× atau ↓GFR >75% atau Scr ≥4", uo: "<0.3 mL/kg/hr ×24hr atau Anuria ×12hr" },
  ];

  return (
    <CalcCard title="RIFLE Criteria" icon="📊">
      <div className="space-y-3">
        <CalcInput label="Serum Creatinine Saat Ini (mg/dL)" unit="mg/dL" value={scr} onChange={(v) => setScr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.1} step={0.1} />
        <CalcInput label="Baseline Creatinine (mg/dL)" unit="mg/dL" value={baselineScr} onChange={(v) => setBaselineScr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.1} step={0.1} />
        <CalcInput label="Urine Output (mL)" unit="mL" value={uo} onChange={(v) => setUo(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        <CalcInput label="Waktu (jam)" unit="jam" value={hours} onChange={(v) => setHours(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} />
        <CalcResult>
          <ResultItem label="Class" value={stage.stage} className={stage.color} />
        </CalcResult>
        <div className="overflow-x-auto">
          <table className="text-xs w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1 text-muted-foreground">Class</th>
                <th className="text-left py-1 text-muted-foreground">Scr Criteria</th>
                <th className="text-left py-1 text-muted-foreground">UO Criteria</th>
              </tr>
            </thead>
            <tbody>
              {riskData.map((r) => (
                <tr key={r.risk} className="border-b border-border">
                  <td className="py-1 font-medium">{r.risk}</td>
                  <td className="py-1 text-muted-foreground">{r.scr}</td>
                  <td className="py-1 text-muted-foreground">{r.uo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <InfoBox>
          RIFLE: Risk, Injury, Failure, Loss, ESKD. Loss = AKI persist &gt;4 minggu. ESKD = dialisis &gt;3 bulan.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
