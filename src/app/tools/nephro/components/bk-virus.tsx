"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function BKVirusCalc() {
  const [bkLoad, setBkLoad] = useState(1000);
  const [monthsPostTx, setMonthsPostTx] = useState(6);
  const [scr, setScr] = useState(1.2);
  const [baselineScr, setBaselineScr] = useState(0.9);
  const [immunosuppression, setImmunosuppression] = useState("standard");

  const scrRatio = baselineScr > 0 ? scr / baselineScr : 1;

  const risk =
    bkLoad > 10000 && scrRatio > 1.3 ? { label: "High — BK Nephropathy", color: "text-red-500", action: "Reduce IS, consider cidofovir" } :
    bkLoad > 1000 ? { label: "Moderate — BK Viruria/Viremia", color: "text-orange-400", action: "Reduce IS, monitor weekly" } :
    bkLoad > 0 ? { label: "Low — BK shedding", color: "text-yellow-400", action: "Monitor monthly" } :
    { label: "Negative", color: "text-green-400", action: "Routine monitoring" };

  return (
    <CalcCard title="BK Virus Risk Assessment" icon="🦠">
      <div className="space-y-3">
        <CalcInput label="BK Viral Load (copies/mL)" unit="copies/mL" value={bkLoad} onChange={(v) => setBkLoad(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        <CalcInput label="Months Post-Transplant" unit="bulan" value={monthsPostTx} onChange={(v) => setMonthsPostTx(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        <CalcInput label="Current Scr (mg/dL)" unit="mg/dL" value={scr} onChange={(v) => setScr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.1} step={0.1} />
        <CalcInput label="Baseline Scr (mg/dL)" unit="mg/dL" value={baselineScr} onChange={(v) => setBaselineScr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.1} step={0.1} />
        <CalcSelect label="Immunosuppression" value={immunosuppression} onChange={setImmunosuppression} options={[
          { value: "standard", label: "Standard" },
          { value: "reduced", label: "Already Reduced" },
          { value: "low", label: "Low (minimized)" },
        ]} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Risk" value={risk.label} className={risk.color} />
            <ResultItem label="Scr Ratio" value={`${scrRatio.toFixed(1)}×`} />
            <ResultItem label="Action" value={risk.action} />
          </ResultGrid>
        </CalcResult>
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <strong className="text-foreground">BK Nephropathy Management:</strong>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>• <span className="text-neon">BK &gt;10,000 + rising Cr:</span> Reduce TAC/MMF. Cidofovir 0.5-1 mg/kg IV qweek.</li>
            <li>• <span className="text-neon">BK 1,000-10,000:</span> Reduce IS by 25-50%. Monitor weekly.</li>
            <li>• <span className="text-neon">BK Viruria only:</span> No treatment needed. Monitor monthly.</li>
            <li>• <span className="text-neon">Biopsy:</span> If Cr rising despite IS reduction. SV40 stain positive.</li>
          </ul>
        </div>
        <InfoBox>
          BK virus peak incidence: 3-6 months post-transplant. Risk factors: Thymoglobulin induction, high tacrolimus levels, MMF &gt;1g/m²/day.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
