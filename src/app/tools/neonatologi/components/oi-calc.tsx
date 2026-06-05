"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

export function OICalc() {
  const [map, setMap] = useState(10);
  const [fio2, setFiO2] = useState(0.6);
  const [pao2, setPaO2] = useState(60);

  const oi = pao2 > 0 ? +((map * fio2 * 100) / pao2).toFixed(1) : 0;

  let interp = "";
  let interpType: "success" | "warning" | "danger" = "success";
  let note = "";

  if (oi < 10) { interp = "Ringan"; interpType = "success"; note = "Konvensional adekuat. Weaning bila stabil."; }
  else if (oi < 20) { interp = "Sedang"; interpType = "warning"; note = "Optimalkan setting. Pertimbangkan surfaktan ulang."; }
  else if (oi < 25) { interp = "Berat"; interpType = "warning"; note = "Pertimbangkan HFOV."; }
  else if (oi < 40) { interp = "Sangat Berat"; interpType = "danger"; note = "HFOV + iNO. Konsul rujukan ECMO."; }
  else { interp = "Ekstrem"; interpType = "danger"; note = "Kriteria ECMO (OI >40). Segera konsul."; }

  return (
    <CalcCard title="Oxygenation Index" subtitle="OI calculation" icon="🔬" color="red">
      <InfoBox>
        OI = (MAP × FiO₂ × 100) / PaO₂. Nilai {">"}20 menunjukkan ARDS berat.
      </InfoBox>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="MAP (cmH₂O)" value={map} onChange={(v) => setMap(v as number)} step={0.1} />
        <CalcInput label="FiO₂" value={fio2} onChange={(v) => setFiO2(v as number)} step={0.01} min={0} max={1} />
        <CalcInput label="PaO₂ (mmHg)" value={pao2} onChange={(v) => setPaO2(v as number)} step={1} />
      </div>
      <CalcResult color="red">
        <ResultGrid cols={2}>
          <ResultItem label="OI" value={`${oi}`} />
          <ResultItem label="Interpretasi" value={interp} />
        </ResultGrid>
        <ResultAlert type={interpType}>{note}</ResultAlert>
      </CalcResult>
    </CalcCard>
  );
}
