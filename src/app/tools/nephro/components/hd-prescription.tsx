"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function HDPrescriptionCalc() {
  const { weightGram } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [bfr, setBfr] = useState(5);
  const [dfr, setDfr] = useState(500);
  const [time, setTime] = useState(3);
  const [flux, setFlux] = useState("high");

  const bloodVolume = weight * 80;
  const effFlow = bfr * 60;
  const kT = dfr * time;
  const ktV = kT / (weight * 10);

  return (
    <CalcCard title="HD Prescription" icon="🫁">
      <div className="space-y-3">
        <CalcInput label="Berat Badan (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={2} />
        <CalcInput label="Blood Flow Rate (mL/min)" unit="mL/min" value={bfr} onChange={(v) => setBfr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} />
        <CalcInput label="Dialysate Flow Rate (mL/min)" unit="mL/min" value={dfr} onChange={(v) => setDfr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={100} />
        <CalcInput label="Waktu (jam)" unit="jam" value={time} onChange={(v) => setTime(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.5} />
        <CalcSelect label="Flux" value={flux} onChange={setFlux} options={[
          { value: "low", label: "Low Flux" },
          { value: "high", label: "High Flux" },
        ]} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Blood Volume" value={`${bloodVolume} mL`} />
            <ResultItem label="Eff. Dialysate Flow" value={`${effFlow} mL/min`} />
            <ResultItem label="Kt" value={`${kT} mL`} />
            <ResultItem label="kt/V" value={ktV.toFixed(2)} />
          </ResultGrid>
        </CalcResult>
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <strong className="text-foreground">HD Parameters (Pediatric):</strong>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>• BFR: 3-5 mL/min/kg (neonates: 2-3 mL/min/kg)</li>
            <li>• Access: Dual lumen catheter (IJ, femoral)</li>
            <li>• Heparin: UFH 50-100 U/kg bolus, then 20-50 U/kg/hr</li>
            <li>• Target: kt/V ≥1.2 per treatment</li>
            <li>• Anticoagulation: Citrate preferred (if available)</li>
          </ul>
        </div>
      </div>
    </CalcCard>
  );
}
