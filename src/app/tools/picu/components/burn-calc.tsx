"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

export function BurnCalc() {
  const { weightGram, heightCm } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [h, setH] = useState(heightCm);
  const [tbsa, setTBSA] = useState(20);

  const bsa = Math.sqrt((w * 1000 * h) / 3600);
  const total24 = Math.round(3 * w * tbsa);
  const first8 = Math.round(total24 / 2);
  const first8Rate = +(first8 / 8).toFixed(1);
  const last16 = total24 - first8;
  const last16Rate = +(last16 / 16).toFixed(1);
  const maintenance = Math.round(1500 * bsa);

  return (
    <CalcCard title="Parkland Burn Formula" subtitle="Burn fluid resuscitation" icon="🔥" color="red">
      <InfoBox>
        Anak: 3 mL × BB(kg) × %TBSA. 50% dalam 8 jam pertama, 50% dalam 16 jam berikutnya.
      </InfoBox>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcInput label="TB (cm)" value={h} onChange={(v) => setH(v as number)} />
        <CalcInput label="%TBSA" value={tbsa} onChange={(v) => setTBSA(v as number)} />
      </div>
      <CalcResult color="red">
        <ResultGrid cols={2}>
          <ResultItem label="Total 24 jam" value={`${total24}`} unit="mL" />
          <ResultItem label="BSA (Mosteller)" value={`${+bsa.toFixed(3)}`} unit="m²" />
          <ResultItem label="8 jam pertama" value={`${first8}`} unit="mL" note={`Rate: ${first8Rate} mL/jam`} />
          <ResultItem label="16 jam berikutnya" value={`${last16}`} unit="mL" note={`Rate: ${last16Rate} mL/jam`} />
          <ResultItem label="Maintenance D5W" value={`${maintenance}`} unit="mL/hari" note="1500 × BSA" />
        </ResultGrid>
        <InfoBox>
          Target UO: 0.5-1 mL/kg/hr. Evaluasi setiap 2 jam. Fluid: Ringer Lactat.
        </InfoBox>
      </CalcResult>
    </CalcCard>
  );
}
