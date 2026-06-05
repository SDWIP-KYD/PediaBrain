"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

export function CardiacOutputCalc() {
  const { weightGram, heightCm } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [h, setH] = useState(heightCm);
  const [hr, setHR] = useState(120);
  const [sv, setSV] = useState(20);
  const [map, setMAP] = useState(60);
  const [cvp, setCVP] = useState(5);
  const [hb, setHb] = useState(10);
  const [sao2, setSaO2] = useState(95);

  const bsa = Math.sqrt((w * h) / 3600);
  const co = +((hr * sv) / 1000).toFixed(2);
  const ci = bsa > 0 ? +(co / bsa).toFixed(2) : 0;
  const svr = co > 0 ? +(79.9 * (map - cvp) / co).toFixed(0) : 0;
  const cao2 = +((hb * 1.34 * sao2 / 100) + (0.003 * 94)).toFixed(2);
  const do2 = +(co * cao2 * 10).toFixed(0);

  return (
    <CalcCard title="Cardiac Output" subtitle="CO, CI, SVR, DO₂" icon="❤️" color="pink">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcInput label="HR" value={hr} onChange={(v) => setHR(v as number)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="Stroke Volume (mL)" value={sv} onChange={(v) => setSV(v as number)} />
        <CalcInput label="MAP (mmHg)" value={map} onChange={(v) => setMAP(v as number)} />
        <CalcInput label="CVP (mmHg)" value={cvp} onChange={(v) => setCVP(v as number)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Hb (g/dL)" value={hb} onChange={(v) => setHb(v as number)} step={0.1} />
        <CalcInput label="SaO₂ (%)" value={sao2} onChange={(v) => setSaO2(v as number)} />
      </div>
      <CalcResult color="pink">
        <ResultGrid cols={2}>
          <ResultItem label="CO" value={`${co}`} unit="L/min" />
          <ResultItem label="CI" value={`${ci}`} unit="L/min/m²" note="Normal: 3.5-5.5" />
          <ResultItem label="SVR" value={`${svr}`} unit="dyn·s/cm⁵" />
          <ResultItem label="DO₂" value={`${do2}`} unit="mL O₂/min" />
        </ResultGrid>
      </CalcResult>
    </CalcCard>
  );
}
