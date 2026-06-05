"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

export function OIPICUCalc() {
  const [fio2, setFiO2] = useState(0.6);
  const [po2, setPaO2] = useState(60);
  const [map, setMAP] = useState(10);
  const [spo2, setSpO2] = useState(95);
  const [peep, setPEEP] = useState(5);

  const pfRatio = fio2 > 0 ? Math.round(po2 / fio2) : 0;
  const sfRatio = fio2 > 0 ? Math.round(spo2 / fio2) : 0;
  const oi = po2 > 0 ? +((map * fio2 * 100) / po2).toFixed(1) : 0;

  let ards = "";
  let ardsType: "success" | "warning" | "danger" = "success";
  let action = "";

  if (pfRatio >= 300) { ards = "Normal"; ardsType = "success"; action = "Monitor."; }
  else if (pfRatio >= 200) { ards = "Mild ARDS"; ardsType = "warning"; action = "Lung protective ventilation. Prone jika tidak membaik 12-24 jam."; }
  else if (pfRatio >= 100) { ards = "Moderate ARDS"; ardsType = "warning"; action = "Pertimbangkan HFOV. Prone positioning. NMB 48 jam. iNO bila PPHN."; }
  else { ards = "Severe ARDS"; ardsType = "danger"; action = oi > 25 ? "HFOV." : "" + (oi > 40 ? " ECMO. Konsul ECMO center SEGERA." : ""); }

  return (
    <CalcCard title="Oxygenation Index" subtitle="OI, PF ratio, SF ratio, ARDS classification" icon="🔬" color="red">
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="FiO₂" value={fio2} onChange={(v) => setFiO2(v as number)} step={0.01} min={0} max={1} />
        <CalcInput label="PaO₂ (mmHg)" value={po2} onChange={(v) => setPaO2(v as number)} />
        <CalcInput label="MAP (cmH₂O)" value={map} onChange={(v) => setMAP(v as number)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="SpO₂ (%)" value={spo2} onChange={(v) => setSpO2(v as number)} />
        <CalcInput label="PEEP (cmH₂O)" value={peep} onChange={(v) => setPEEP(v as number)} />
      </div>
      <CalcResult color="red">
        <ResultGrid cols={3}>
          <ResultItem label="PF Ratio" value={`${pfRatio}`} />
          <ResultItem label="SF Ratio" value={`${sfRatio}`} />
          <ResultItem label="OI" value={`${oi}`} />
        </ResultGrid>
        <ResultAlert type={ardsType}>
          <strong>{ards}</strong> — {action}
        </ResultAlert>
      </CalcResult>
    </CalcCard>
  );
}
