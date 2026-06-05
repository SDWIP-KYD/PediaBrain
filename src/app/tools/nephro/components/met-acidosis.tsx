"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function MetAcidosisCalc() {
  const [ph, setPh] = useState(7.25);
  const [pco2, setPco2] = useState(35);
  const [hco3, setHco3] = useState(15);
  const [na, setNa] = useState(140);
  const [cl, setCl] = useState(105);
  const [albumin, setAlbumin] = useState(4);

  const ag = na - (cl + hco3);
  const agCorrected = ag + 2.5 * (4 - albumin);
  const expectedPco2 = 1.5 * hco3 + 8;
  const deltaAg = agCorrected - 12;
  const deltaHco3 = 24 - hco3;
  const ratio = deltaHco3 > 0 ? deltaAg / deltaHco3 : 0;

  const interpretation =
    ph < 7.35 && hco3 < 22 ? "Metabolic Acidosis" :
    ph >= 7.45 && hco3 > 26 ? "Metabolic Alkalosis" : "Normal";

  const agType =
    agCorrected > 16 ? "High AG Metabolic Acidosis" :
    ratio > 1 ? "Mixed: High AG + Normal AG" :
    ratio < 0.4 ? "Normal AG (Hyperchloremic) + Other" :
    "High AG Metabolic Acidosis";

  const causes =
    agCorrected > 16 ? "MUDPILES: Methanol, Uremia, DKA, Propylene glycol, Isoniazid/Iron, Lactic acid, Ethylene glycol, Salicylates" :
    "Normal AG: RTA, Diarrhea, Dilutional";

  return (
    <CalcCard title="Metabolic Acidosis Analysis" icon="🧬">
      <div className="space-y-3">
        <CalcInput label="pH" value={ph} onChange={(v) => setPh(typeof v === "string" ? parseFloat(v) || 0 : v)} min={6} max={8} step={0.01} />
        <CalcInput label="pCO₂ (mmHg)" unit="mmHg" value={pco2} onChange={(v) => setPco2(typeof v === "string" ? parseFloat(v) || 0 : v)} min={10} max={100} />
        <CalcInput label="HCO₃⁻ (mEq/L)" unit="mEq/L" value={hco3} onChange={(v) => setHco3(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} max={60} />
        <CalcInput label="Na⁺" unit="mEq/L" value={na} onChange={(v) => setNa(typeof v === "string" ? parseFloat(v) || 0 : v)} min={100} />
        <CalcInput label="Cl⁻" unit="mEq/L" value={cl} onChange={(v) => setCl(typeof v === "string" ? parseFloat(v) || 0 : v)} min={60} />
        <CalcInput label="Albumin (g/dL)" unit="g/dL" value={albumin} onChange={(v) => setAlbumin(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.5} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Anion Gap" value={`${ag.toFixed(1)} (corr: ${agCorrected.toFixed(1)})`} />
            <ResultItem label="Diagnosis" value={agType} />
            <ResultItem label="Delta Ratio" value={ratio.toFixed(2)} />
            <ResultItem label="Expected pCO₂" value={`${expectedPco2.toFixed(0)} mmHg`} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          <strong>Causes:</strong> {causes}
        </InfoBox>
        <InfoBox>
          pCO₂ &gt;{expectedPco2.toFixed(0)} mmHg: Mixed respiratory acidosis. pCO₂ &lt;{expectedPco2.toFixed(0)} mmHg: Concurrent respiratory alkalosis.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
