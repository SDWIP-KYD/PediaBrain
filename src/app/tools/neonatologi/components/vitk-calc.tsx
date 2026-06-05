"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultAlert, InfoBox } from "../../components/calc-ui";

export function VitKCalc() {
  const { weightGram, gestationalAge } = usePatient();
  const [wt, setWt] = useState(weightGram);
  const [ga, setGa] = useState(gestationalAge);

  useEffect(() => { setWt(weightGram); setGa(gestationalAge); }, [weightGram, gestationalAge]);

  let vitk = "";
  if (wt >= 1500) vitk = "1 mg IM (paha lat)";
  else if (wt >= 1000) vitk = "0.5 mg IM";
  else vitk = "0.5 mg IM (hati-hati IM)";

  const prematur = ga < 34;

  return (
    <CalcCard title="Vitamin K & Profilaksis" subtitle="Rutin BBL" icon="💛" color="yellow">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(v as number)} unit="g" />
        <CalcInput label="GA (minggu)" value={ga} onChange={(v) => setGa(v as number)} unit="mgg" />
      </div>
      <CalcResult color="yellow">
        <div className="space-y-2 text-xs leading-relaxed">
          <p><strong>💛 Vitamin K:</strong> {vitk}</p>
          <p><strong>💉 Hepatitis B (HB0):</strong> 0.5 mL IM dalam 12 jam lahir + HBIG (bila ibu HBsAg+)</p>
          <p><strong>👁️ Salep Mata:</strong> Tetrasiklin 1% atau eritromisin 0.5% kedua mata</p>
          <p><strong>💉 BCG:</strong> 0.05 mL ID deltoid kiri — bila BB ≥ 2000g dan klinis stabil</p>
          <p><strong>🩸 Polio:</strong> 2 tetes oral (bila stabil)</p>
        </div>
        {prematur && (
          <ResultAlert type="warning">
            ⚠️ Prematur &lt;34 mgg: BCG dan Polio ditunda sampai klinis stabil
          </ResultAlert>
        )}
      </CalcResult>
    </CalcCard>
  );
}
