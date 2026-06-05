"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function PDAdequacyCalc() {
  const { weightGram } = usePatient();
  const [dialysateKt, setDialysateKt] = useState(15);
  const [plasmaKt, setPlasmaKt] = useState(10);
  const [ultrafiltrate, setUltrafiltrate] = useState(500);
  const [dw, setDW] = useState(2);
  const [weight, setWeight] = useState(weightGram / 1000);

  const ktV = weight > 0 ? (dialysateKt + plasmaKt) / (weight * 10) : 0;
  const ccPerWeek = ((dialysateKt * 7) / (weight * 0.07)).toFixed(1);

  return (
    <CalcCard title="PD Adequacy" icon="💧">
      <div className="space-y-3">
        <CalcInput label="Dialysate Kt (L/24hr)" unit="L/24hr" value={dialysateKt} onChange={(v) => setDialysateKt(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        <CalcInput label="Plasma Kt (L/24hr)" unit="L/24hr" value={plasmaKt} onChange={(v) => setPlasmaKt(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        <CalcInput label="Ultrafiltrate (mL/24hr)" unit="mL/24hr" value={ultrafiltrate} onChange={(v) => setUltrafiltrate(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        <CalcInput label="Dialysate Glucose (g/L)" unit="g/L" value={dw} onChange={(v) => setDW(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} step={0.5} />
        <CalcInput label="Berat Badan (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={2} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Kt/V" value={ktV.toFixed(2)} />
            <ResultItem label="Target Kt/V" value="≥1.7/week (CAPD)" />
            <ResultItem label="CrCl (L/week/1.73m²)" value={ccPerWeek} />
            <ResultItem label="Target CrCl" value="≥50 L/week" />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          {ktV < 1.7
            ? "Kt/V di bawah target. Pertimbangkan: increase dwell volume, increase exchanges, atau tambah APD."
            : "Kt/V adequate. Monitor nutrition status dan ultrafiltration."}
        </InfoBox>
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <strong className="text-foreground">PD Adequacy Targets (Anak):</strong>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>• Kt/V ≥1.7/week</li>
            <li>• CrCl ≥50 L/week/1.73m²</li>
            <li>• Bila inadequat: pertimbangkan transfer ke HD</li>
            <li>• Nutrisi: Albumin ≥3.5 g/dL, prealbumin ≥30 mg/dL</li>
          </ul>
        </div>
      </div>
    </CalcCard>
  );
}
