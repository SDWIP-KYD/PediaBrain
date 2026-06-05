"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function AKIStagingCalc() {
  const [scr, setScr] = useState(1.0);
  const [baselineScr, setBaselineScr] = useState(0.5);
  const [uo, setUo] = useState(1.0);
  const [hours, setHours] = useState(24);

  const scrRatio = baselineScr > 0 ? scr / baselineScr : 1;
  const uoPerKgHr = uo / hours;

  const stage =
    (scrRatio >= 3 || scr >= 4) ? { stage: "Stage 3", color: "text-red-500", criteria: "Scr ≥3× baseline atau Scr ≥4 mg/dL atau UO <0.3 mL/kg/hr ×24hr atau Anuria ≥12hr" } :
    (scrRatio >= 2) ? { stage: "Stage 2", color: "text-orange-400", criteria: "Scr ≥2× baseline atau UO <0.5 mL/kg/hr ×12hr" } :
    (scrRatio >= 1.5 || uo < 0.5) ? { stage: "Stage 1", color: "text-yellow-400", criteria: "Scr ≥1.5× baseline atau UO <0.5 mL/kg/hr ×6-12hr" } :
    { stage: "No AKI", color: "text-green-400", criteria: "Tidak memenuhi kriteria KDIGO" };

  return (
    <CalcCard title="AKI Staging (KDIGO)" icon="🔬">
      <div className="space-y-3">
        <CalcInput label="Serum Creatinine Saat Ini (mg/dL)" unit="mg/dL" value={scr} onChange={(v) => setScr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.1} step={0.1} />
        <CalcInput label="Baseline Creatinine (mg/dL)" unit="mg/dL" value={baselineScr} onChange={(v) => setBaselineScr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.1} step={0.1} />
        <CalcInput label="Urine Output (mL)" unit="mL" value={uo} onChange={(v) => setUo(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        <CalcInput label="Waktu Pengukuran (jam)" unit="jam" value={hours} onChange={(v) => setHours(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Scr Ratio" value={`${scrRatio.toFixed(1)}×`} />
            <ResultItem label="Stage" value={stage.stage} className={stage.color} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          <strong>{stage.stage}</strong>: {stage.criteria}
        </InfoBox>
      </div>
    </CalcCard>
  );
}
