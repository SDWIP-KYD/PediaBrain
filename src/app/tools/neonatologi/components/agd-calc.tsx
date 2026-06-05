"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

export function AGDCalc() {
  const [ph, setPh] = useState(7.35);
  const [paco2, setPaCO2] = useState(40);
  const [pao2, setPaO2] = useState(80);
  const [hco3, setHCO3] = useState(22);
  const [be, setBE] = useState(0);
  const [spo2, setSpO2] = useState(95);
  const [fio2, setFiO2] = useState(0.21);

  // Calculate derived values
  const pCO2norm = 40;
  const expectedHCO3 = 24 + (be * 0.4);
  const pAaO2 = ((fio2 * 713) - (paco2 / 0.8)) - pao2;
  const pfRatio = fio2 > 0 ? pao2 / fio2 : 0;

  // Acid-base interpretation
  let phStatus = "";
  if (ph < 7.35) phStatus = "Asidemia";
  else if (ph > 7.45) phStatus = "Alkalemia";
  else phStatus = "Normal";

  let co2Status = "";
  if (paco2 > 45) co2Status = "Hipokapnia (↑CO₂ = asidosis respiratorik)";
  else if (paco2 < 35) co2Status = "Hipokapnia (↓CO₂ = alkalosis respiratorik)";
  else co2Status = "Normal";

  let hco3Status = "";
  if (hco3 < 22) hco3Status = "↓ HCO₃ (asidosis metabolik)";
  else if (hco3 > 26) hco3Status = "↑ HCO₃ (alkalosis metabolik)";
  else hco3Status = "Normal";

  let primary = "";
  if (ph < 7.35 && paco2 > 45) primary = "Asidosis Respiratorik";
  else if (ph < 7.35 && hco3 < 22) primary = "Asidosis Metabolik";
  else if (ph > 7.45 && paco2 < 35) primary = "Alkalosis Respiratorik";
  else if (ph > 7.45 && hco3 > 26) primary = "Alkalosis Metabolik";
  else primary = "Normal / Kompensasi";

  let severityType: "success" | "warning" | "danger" = "success";
  if (ph < 7.2 || ph > 7.6) severityType = "danger";
  else if (ph < 7.35 || ph > 7.45) severityType = "warning";

  return (
    <CalcCard title="Interpretasi AGD" subtitle="Asam-Basa Neonatus" icon="🧪" color="teal">
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="pH" value={ph} onChange={(v) => setPh(v as number)} step={0.01} min={6.5} max={8} />
        <CalcInput label="PaCO₂ (mmHg)" value={paco2} onChange={(v) => setPaCO2(v as number)} step={1} />
        <CalcInput label="PaO₂ (mmHg)" value={pao2} onChange={(v) => setPaO2(v as number)} step={1} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="HCO₃ (mEq/L)" value={hco3} onChange={(v) => setHCO3(v as number)} step={0.1} />
        <CalcInput label="BE" value={be} onChange={(v) => setBE(v as number)} step={0.1} />
        <CalcInput label="SpO₂ (%)" value={spo2} onChange={(v) => setSpO2(v as number)} step={1} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="FiO₂" value={fio2} onChange={(v) => setFiO2(v as number)} step={0.01} min={0} max={1} />
      </div>
      <CalcResult color="teal">
        <ResultGrid cols={2}>
          <ResultItem label="pH Status" value={phStatus} />
          <ResultItem label="Diagnosis Primer" value={primary} />
        </ResultGrid>
        <div className="space-y-1 text-xs">
          <p>• PaCO₂: {co2Status}</p>
          <p>• HCO₃: {hco3Status}</p>
          <p>• P/F Ratio: {+pfRatio.toFixed(1)} {pfRatio > 300 ? "(Normal)" : pfRatio > 200 ? "(ARDS Ringan)" : pfRatio > 100 ? "(ARDS Sedang)" : "(ARDS Berat)"}</p>
          <p>• P(A-a)O₂: {+pAaO2.toFixed(1)} mmHg</p>
        </div>
        <ResultAlert type={severityType}>
          {ph < 7.2 ? "⚠️ Asidemia berat — pertimbangkan NaHCO₃ atau intubasi" : ph > 7.6 ? "⚠️ Alkalemia berat — evaluasi ventilasi" : "Dalam batas aman"}
        </ResultAlert>
      </CalcResult>
    </CalcCard>
  );
}
