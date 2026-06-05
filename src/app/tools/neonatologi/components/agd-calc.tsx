"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

export function AGDCalc() {
  const [ph, setPh] = useState(7.35);
  const [paco2, setPaCO2] = useState(45);
  const [pao2, setPaO2] = useState(65);
  const [hco3, setHCO3] = useState(22);
  const [be, setBE] = useState(-2);
  const [spo2, setSpO2] = useState(95);
  const [fio2, setFiO2] = useState(0.21);
  const [ga, setGA] = useState(30);

  // Calculate derived values
  const expectedHCO3 = 24 + (be * 0.4);
  const pAaO2 = ((fio2 * 713) - (paco2 / 0.8)) - pao2;
  const pfRatio = fio2 > 0 ? pao2 / fio2 : 0;

  // Interpretation (matching HTML logic)
  const isAcidosis = ph < 7.30;
  const isAlkalosis = ph > 7.45;
  const isRespAcid = paco2 > 50;
  const isRespAlk = paco2 < 35;
  const isMetAcid = hco3 < 18 || be < -5;
  const isMetAlk = hco3 > 28 || be > 5;
  const isHypox = pao2 < 50;
  const isHiperox = pao2 > 80;

  let phStatus = "";
  if (isAcidosis) phStatus = "Asidemia";
  else if (isAlkalosis) phStatus = "Alkalemia";
  else phStatus = "Normal";

  let co2Status = "";
  if (paco2 > 50) co2Status = "Hyperkapnia (↑CO₂ = asidosis respiratorik)";
  else if (paco2 < 35) co2Status = "Hipokapnia (↓CO₂ = alkalosis respiratorik)";
  else co2Status = "Normal";

  let hco3Status = "";
  if (isMetAcid) hco3Status = "↓ HCO₃ / BE negatif (asidosis metabolik)";
  else if (isMetAlk) hco3Status = "↑ HCO₃ / BE positif (alkalosis metabolik)";
  else hco3Status = "Normal";

  let primary = "";
  if (isAcidosis) {
    if (isRespAcid && !isMetAcid) primary = "Asidosis Respiratorik Akut";
    else if (isMetAcid && !isRespAcid) primary = "Asidosis Metabolik";
    else if (isRespAcid && isMetAcid) primary = "Asidosis Campuran (Resp + Met) — Kritis!";
    else primary = "Asidosis (campuran ringan)";
  } else if (isAlkalosis) {
    if (isRespAlk && !isMetAlk) primary = "Alkalosis Respiratorik — Hiperventilasi?";
    else if (isMetAlk && !isRespAlk) primary = "Alkalosis Metabolik";
    else primary = "Alkalosis campuran";
  } else {
    primary = "pH Normal (7.30–7.45)";
  }

  let comp = "";
  if (paco2 > 50 && hco3 > 24) comp = "Kompensasi metabolik (↑HCO₃) ada";
  else if (paco2 < 35 && hco3 < 22) comp = "Kompensasi respiratorik (↓CO₂) ada";
  else comp = "Kompensasi tidak tampak / akut";

  let oxy = "";
  if (isHypox) oxy = `Hipoksemia berat (PaO₂ ${pao2} mmHg). Naikkan FiO₂/PEEP/MAP.`;
  else if (pao2 < 60) oxy = `Hipoksemia ringan-sedang (PaO₂ ${pao2} mmHg).`;
  else if (isHiperox && ga < 34) oxy = `Hiperoksemia pada prematur (PaO₂ ${pao2} mmHg) → Turunkan FiO₂! Risiko ROP.`;
  else oxy = `Oksigenasi adekuat (PaO₂ ${pao2} mmHg, SpO₂ ${spo2}%)`;

  let ventRec = "";
  if (paco2 > 60) ventRec = "Naikkan RR atau PIP untuk blow off CO₂";
  else if (paco2 < 30) ventRec = "Turunkan RR atau pertahankan — waspada alkalosis";
  else ventRec = "Ventilasi adekuat";

  let severityType: "success" | "warning" | "danger" = "success";
  if (ph < 7.2 || ph > 7.6) severityType = "danger";
  else if (isAcidosis || isAlkalosis) severityType = "warning";

  let bgColor = "bg-green-50 border-green-200";
  if (isAcidosis && isRespAcid) bgColor = "bg-red-50 border-red-200";
  else if (isAcidosis) bgColor = "bg-orange-50 border-orange-200";
  else if (isAlkalosis) bgColor = "bg-yellow-50 border-yellow-200";

  return (
    <CalcCard title="Interpretasi AGD" subtitle="Asam-Basa Neonatus" icon="🧪" color="teal">
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="pH" value={ph} onChange={(v) => setPh(v as number)} step={0.01} min={6.8} max={7.8} />
        <CalcInput label="PaCO₂ (mmHg)" value={paco2} onChange={(v) => setPaCO2(v as number)} step={1} />
        <CalcInput label="PaO₂ (mmHg)" value={pao2} onChange={(v) => setPaO2(v as number)} step={1} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="HCO₃ (mEq/L)" value={hco3} onChange={(v) => setHCO3(v as number)} step={0.1} />
        <CalcInput label="BE (mEq/L)" value={be} onChange={(v) => setBE(v as number)} step={0.1} />
        <CalcInput label="SpO₂ (%)" value={spo2} onChange={(v) => setSpO2(v as number)} step={1} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="FiO₂" value={fio2} onChange={(v) => setFiO2(v as number)} step={0.01} min={0} max={1} />
        <CalcInput label="GA (minggu)" value={ga} onChange={(v) => setGA(v as number)} step={1} min={20} max={44} />
      </div>
      <CalcResult color="teal">
        <ResultGrid cols={2}>
          <ResultItem label="pH Status" value={phStatus} />
          <ResultItem label="Diagnosis Primer" value={primary} />
        </ResultGrid>
        <div className={`rounded-lg border p-3 space-y-1 text-xs ${bgColor}`}>
          <p><strong>P CO₂:</strong> {co2Status}</p>
          <p><strong>HCO₃ / BE:</strong> {hco3Status}</p>
          <p><strong>Kompensasi:</strong> {comp}</p>
          <p><strong>P/F Ratio:</strong> {+pfRatio.toFixed(1)} {pfRatio > 300 ? "(Normal)" : pfRatio > 200 ? "(ARDS Ringan)" : pfRatio > 100 ? "(ARDS Sedang)" : "(ARDS Berat)"}</p>
          <p><strong>P(A-a)O₂:</strong> {+pAaO2.toFixed(1)} mmHg</p>
          <hr className="my-1 border-black/10" />
          <p><strong>Oksigenasi:</strong> {oxy}</p>
          <p><strong>Ventilasi:</strong> {ventRec}</p>
        </div>
        <ResultAlert type={severityType}>
          {ph < 7.2 ? "Asidemia berat — pertimbangkan NaHCO₃ atau intubasi" : ph > 7.6 ? "Alkalemia berat — evaluasi ventilasi" : "Dalam batas aman"}
        </ResultAlert>
      </CalcResult>
    </CalcCard>
  );
}
