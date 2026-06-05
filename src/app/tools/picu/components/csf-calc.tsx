"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

export function CSFCalc() {
  const [csfGlu, setCSFGlu] = useState(30);
  const [bloodGlu, setBloodGlu] = useState(100);
  const [csfPro, setCSFPro] = useState(150);

  const ratio = bloodGlu > 0 ? +(csfGlu / bloodGlu).toFixed(2) : 0;

  let glucoseStatus = "";
  let glucoseType: "success" | "warning" | "danger" = "success";
  if (ratio < 0.5) { glucoseStatus = "Low (⚠️)"; glucoseType = "danger"; }
  else if (ratio < 0.6) { glucoseStatus = "Borderline"; glucoseType = "warning"; }
  else { glucoseStatus = "Normal"; glucoseType = "success"; }

  let proteinStatus = "";
  let proteinType: "success" | "warning" | "danger" = "success";
  if (csfPro > 100) { proteinStatus = "High (⚠️)"; proteinType = "danger"; }
  else if (csfPro > 45) { proteinStatus = "Moderate"; proteinType = "warning"; }
  else { proteinStatus = "Normal"; proteinType = "success"; }

  let interpretation = "";
  if (ratio < 0.5 && csfPro > 100) interpretation = "Bacterial meningitis pattern → Abx empiris SEGERA. Deksametason 0.6 mg/kg/hr IV × 4 hari.";
  else if (ratio < 0.5 && csfPro <= 100) interpretation = "Low CSF glucose — DDx: bakterial, TB, jamur. Tunggu kultur.";
  else if (ratio >= 0.5 && csfPro > 100) interpretation = "High CSF protein — GBS, severe viral? Korelasi klinis.";
  else interpretation = "CSF normal. Evaluasi ulang jika klinis memburuk.";

  return (
    <CalcCard title="Analisis CSF" subtitle="Lumbar puncture interpretation" icon="🧪" color="teal">
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="CSF Glukosa (mg/dL)" value={csfGlu} onChange={(v) => setCSFGlu(v as number)} />
        <CalcInput label="Blood Glukosa (mg/dL)" value={bloodGlu} onChange={(v) => setBloodGlu(v as number)} />
        <CalcInput label="CSF Protein (mg/dL)" value={csfPro} onChange={(v) => setCSFPro(v as number)} />
      </div>
      <CalcResult color="teal">
        <ResultGrid cols={2}>
          <ResultItem label="Glucose Ratio" value={`${ratio}`} note={glucoseStatus} />
          <ResultItem label="Protein" value={`${csfPro}`} unit="mg/dL" note={proteinStatus} />
        </ResultGrid>
        <ResultAlert type={glucoseType === "danger" || proteinType === "danger" ? "danger" : "info"}>
          {interpretation}
        </ResultAlert>
        <InfoBox>
          <strong>Normal CSF:</strong> WBC 0-5/µL, Protein 20-45 mg/dL, Glukosa 50-80% GDS, Pressure 70-180 mmH₂O
        </InfoBox>
      </CalcResult>
    </CalcCard>
  );
}
