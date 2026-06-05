"use client";

import { useState } from "react";
import { CalcCard, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function KDIGOTransplantCalc() {
  const [month, setMonth] = useState("0-1");
  const [scr, setScr] = useState(1.0);
  const [baselineScr, setBaselineScr] = useState(0.8);
  const [proteinuria, setProteinuria] = useState(100);
  const [bkViralLoad, setBkViralLoad] = useState(0);
  const [immunosuppression, setImmunosuppression] = useState("standard");

  const scrRatio = baselineScr > 0 ? scr / baselineScr : 1;

  const phase =
    month === "0-1" ? { label: "Immediate (0-1 mo)", color: "text-blue-400" } :
    month === "1-3" ? { label: "Early (1-3 mo)", color: "text-cyan-400" } :
    month === "3-12" ? { label: "Intermediate (3-12 mo)", color: "text-green-400" } :
    { label: "Late (>12 mo)", color: "text-purple-400" };

  const scrConcern = scrRatio > 1.3;

  return (
    <CalcCard title="KDIGO Transplant Monitoring" icon="🏥">
      <div className="space-y-3">
        <CalcSelect label="Post-Transplant Phase" value={month} onChange={setMonth} options={[
          { value: "0-1", label: "0-1 month (Immediate)" },
          { value: "1-3", label: "1-3 months (Early)" },
          { value: "3-12", label: "3-12 months (Intermediate)" },
          { value: ">12", label: ">12 months (Late)" },
        ]} />
        <CalcSelect label="Immunosuppression" value={immunosuppression} onChange={setImmunosuppression} options={[
          { value: "standard", label: "Standard (TAC + MMF + Pred)" },
          { value: "low", label: "Low (TAC + Pred)" },
          { value: "high", label: "High (Thymo + TAC + MMF + Pred)" },
        ]} />
        <CalcResult>
          <ResultItem label="Phase" value={phase.label} className={phase.color} />
          <ResultItem label="Scr Concern?" value={scrConcern ? "Yes — investigate" : "Within expected range"} className={scrConcern ? "text-red-400" : "text-green-400"} />
        </CalcResult>
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <strong className="text-foreground">Phase-Specific Protocol ({month} months):</strong>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            {month === "0-1" && <>
              <li>• TAC trough: 8-12 ng/mL</li>
              <li>• MMF: 600 mg/m² BID</li>
              <li>• Monitor: Cr, BUN, K⁺, glucose daily → twice weekly</li>
              <li>• USG graft: Day 1, Day 7</li>
              <li>• Biopsy: if Cr rise &gt;20% above nadir</li>
            </>}
            {month === "1-3" && <>
              <li>• TAC trough: 6-10 ng/mL</li>
              <li>• MMF: 600 mg/m² BID</li>
              <li>• Monitor: Cr twice weekly → weekly</li>
              <li>• BK PCR: monthly (starting month 1)</li>
              <li>• CMV PCR: monthly</li>
            </>}
            {month === "3-12" && <>
              <li>• TAC trough: 4-8 ng/mL</li>
              <li>• MMF: 450-600 mg/m² BID</li>
              <li>• Monitor: Cr monthly</li>
              <li>• BK PCR: every 3 months</li>
              <li>• Protocol biopsy: 3-6 months (optional)</li>
            </>}
            {month === ">12" && <>
              <li>• TAC trough: 3-6 ng/mL</li>
              <li>• MMF: can consider reduction</li>
              <li>• Monitor: Cr quarterly</li>
              <li>• Screen: PTLD, skin cancer, cardiovascular</li>
              <li>• Donor-specific antibodies: annually</li>
            </>}
          </ul>
        </div>
        {bkViralLoad > 10000 && (
          <InfoBox>
            BK Viral Load &gt;10,000 copies/mL: Reduce immunosuppression. Consider cidofovir. Monitor for rejection.
          </InfoBox>
        )}
      </div>
    </CalcCard>
  );
}
