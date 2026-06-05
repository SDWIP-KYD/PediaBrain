"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

const conditions = [
  { value: "cardiac", label: "Cardiac Arrest (pulseless)" },
  { value: "shock", label: "Shock (with pulse)" },
  { value: "anaphylaxis", label: "Anaphylaxis" },
  { value: "bradycardia", label: "Symptomatic Bradycardia" },
];

export function ResusitasiCalc() {
  const { weightGram, ageYears } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [cond, setCond] = useState("cardiac");

  const r0 = (n: number) => Math.round(n);
  const minBP = ageYears < 1 ? 70 : ageYears < 10 ? 70 + 2 * ageYears : 90;

  const epiDose = +(0.01 * w).toFixed(2);
  const epiVol = +(0.1 * w).toFixed(2);
  const defib1 = r0(2 * w);
  const defib2 = r0(4 * w);
  const fluidBolus = r0(10 * w);
  const nahco3 = r0(w);
  const d10 = +(w * 2.5).toFixed(1);

  return (
    <CalcCard title="Resusitasi Cepat" subtitle="Panduan resusitasi & drug doses" icon="🫀" color="red">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcSelect label="Kondisi" value={cond} onChange={setCond} options={conditions} />
      </div>
      <CalcResult color="red">
        <ResultGrid cols={2}>
          <ResultItem label="Epinefrin IV/IO" value={`${epiDose}`} unit="mg" note={`${epiVol} mL (1:10000)`} />
          <ResultItem label="Defibrilasi" value={`${defib1}`} unit="J" note={`2→${defib2} J (max 10 J/kg)`} />
          <ResultItem label="Fluid Bolus" value={`${fluidBolus}`} unit="mL" note="NS 0.9% dalam 15 menit" />
          <ResultItem label="NaHCO₃ 8.4%" value={`${nahco3}`} unit="mEq" note={`${nahco3} mL slow IV`} />
          <ResultItem label="Dextrose D10%" value={`${d10}`} unit="mL" />
          <ResultItem label="Min BP" value={`${minBP}`} unit="mmHg" note={`age ${ageYears}th`} />
        </ResultGrid>
        {cond === "cardiac" && (
          <ResultAlert type="danger">
            <strong>CPR:</strong> 100-120/mnt, kedalaman ⅓ diameter dada, ratio 15:2. Epinefrin q3-5 min. VF/pVT: Defib + Amiodaron 5w mg atau Lidokain 1 mg/kg. Cek 5H5T.
          </ResultAlert>
        )}
        {cond === "shock" && (
          <ResultAlert type="warning">
            <strong>Bolus:</strong> {fluidBolus} mL NS dalam 15 menit → evaluasi. Norepinefrin 0.05 mcg/kg/mnt. Kultur darah → Abx dalam 1 jam. Hydrokortison w mg q6h bila refrakter.
          </ResultAlert>
        )}
        {cond === "anaphylaxis" && (
          <ResultAlert type="warning">
            <strong>1)</strong> Epi IM {epiVol} mL (maks 0.5mg) paha anterolateral.
            <strong> 2)</strong> Difenhidramin {r0(w)} mg IV.
            <strong> 3)</strong> Hidrokortison {r0(4 * w)} mg IV (maks 200mg).
            <strong> 4)</strong> Salbutamol neb bila bronkospasme.
          </ResultAlert>
        )}
        {cond === "bradycardia" && (
          <ResultAlert type="warning">
            <strong>1)</strong> Atropin {Math.max(0.1, Math.min(0.5, +(0.02 * w).toFixed(2)))} mg IV (maks 1mg/dose, min 0.1mg!).
            <strong> 2)</strong> CPR bila HR&lt;60 + perfusi inadekuat.
            <strong> 3)</strong> Epi infus bila refrakter. <strong>4)</strong> Transcutaneous pacing.
          </ResultAlert>
        )}
      </CalcResult>
    </CalcCard>
  );
}
