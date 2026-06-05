"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

export function NatriumCalc() {
  const { weightGram } = usePatient();
  const [wt, setWt] = useState(weightGram);
  const [actualNa, setActualNa] = useState(130);
  const [targetNa, setTargetNa] = useState(135);
  const [glucose, setGlucose] = useState(100);
  const [osmolality, setOsmolality] = useState(280);
  const [urineNa, setUrineNa] = useState(20);

  useEffect(() => setWt(weightGram), [weightGram]);

  const wtKg = wt / 1000;
  const naDeficit = +((targetNa - actualNa) * 0.6 * wtKg).toFixed(1);
  const nacl3Vol = +(naDeficit / 0.513).toFixed(1); // NaCl 3% = 0.513 mEq/mL
  const correctedNa = actualNa + 1.6 * ((glucose - 100) / 100);

  return (
    <CalcCard title="Koreksi Natrium" subtitle="Hiponatremia neonatus" icon="⚗️" color="blue">
      <InfoBox>
        Na deficit = (Na target − Na aktual) × 0.6 × BB(kg). NaCl 3% = 0.513 mEq/mL.
      </InfoBox>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(v as number)} unit="g" />
        <CalcInput label="Na Aktual (mEq/L)" value={actualNa} onChange={(v) => setActualNa(v as number)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Na Target (mEq/L)" value={targetNa} onChange={(v) => setTargetNa(v as number)} />
        <CalcInput label="Glukosa (mg/dL)" value={glucose} onChange={(v) => setGlucose(v as number)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Osmolalitas (mOsm/kg)" value={osmolality} onChange={(v) => setOsmolality(v as number)} />
        <CalcInput label="Urine Na (mEq/L)" value={urineNa} onChange={(v) => setUrineNa(v as number)} />
      </div>
      <CalcResult color="blue">
        <ResultGrid cols={2}>
          <ResultItem label="Na Tercorrigi (hiperglikemia)" value={`${+correctedNa.toFixed(1)}`} unit="mEq/L" />
          <ResultItem label="Na Deficit" value={`${naDeficit}`} unit="mEq" />
        </ResultGrid>
        <ResultGrid cols={1}>
          <ResultItem label="Volume NaCl 3%" value={`${nacl3Vol}`} unit="mL" note="Infus perlahan, cek Na tiap 2-4 jam" />
        </ResultGrid>
        {actualNa < 120 && (
          <ResultAlert type="danger">
            ⚠️ Hiponatremia berat ({"<"}120 mEq/L) — risiko kejang. Naikkan max 0.5 mEq/L/jam.
          </ResultAlert>
        )}
        {actualNa >= 120 && actualNa < 130 && (
          <ResultAlert type="warning">
            ⚠️ Hiponatremia sedang — Naikkan max 1 mEq/L/jam. Monitor ketat.
          </ResultAlert>
        )}
      </CalcResult>
    </CalcCard>
  );
}
