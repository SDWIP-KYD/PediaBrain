"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function DialysisDoseCalc() {
  const { weightGram } = usePatient();
  const [mode, setMode] = useState("HD");
  const [preBUN, setPreBUN] = useState(60);
  const [postBUN, setPostBUN] = useState(20);
  const [weight, setWeight] = useState(weightGram / 1000);
  const [time, setTime] = useState(3);
  const [ufVolume, setUfVolume] = useState(0);

  const ktV = mode === "HD"
    ? -Math.log((postBUN / preBUN) - 0.008 * time) : 0;
  const spKtV = mode === "PD" ? (preBUN - postBUN) / preBUN : ktV;

  const target =
    mode === "HD" ? "≥1.2 per treatment" :
    mode === "PD" ? "≥1.7 per week" : "≥1.4 per session";

  return (
    <CalcCard title="Dialysis Dose Calculator" icon="🎯">
      <div className="space-y-3">
        <CalcSelect label="Mode" value={mode} onChange={setMode} options={[
          { value: "HD", label: "Hemodialysis" },
          { value: "PD", label: "Peritoneal Dialysis" },
          { value: "CRRT", label: "CRRT" },
        ]} />
        <CalcInput label="Pre-BUN (mg/dL)" unit="mg/dL" value={preBUN} onChange={(v) => setPreBUN(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} />
        <CalcInput label="Post-BUN (mg/dL)" unit="mg/dL" value={postBUN} onChange={(v) => setPostBUN(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} />
        <CalcInput label="Berat Badan (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={2} />
        <CalcInput label="Waktu (jam)" unit="jam" value={time} onChange={(v) => setTime(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.5} />
        <CalcInput label="UF Volume (L)" unit="L" value={ufVolume} onChange={(v) => setUfVolume(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="spKt/V" value={spKtV.toFixed(2)} />
            <ResultItem label="Target" value={target} />
            <ResultItem label="URR" value={`${Math.round(((preBUN - postBUN) / preBUN) * 100)}%`} />
            <ResultItem
              label="Adequate?"
              value={spKtV >= 1.2 ? "Yes" : "No — below target"}
              className={spKtV >= 1.2 ? "text-green-400" : "text-red-400"}
            />
          </ResultGrid>
        </CalcResult>
        {spKtV < 1.2 && (
          <InfoBox>
            Dose inadequate. Consider: ↑ treatment time, ↑ BFR, ↑ dialysate flow, atau tambah frequency.
          </InfoBox>
        )}
      </div>
    </CalcCard>
  );
}
