"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultItem, ResultGrid, CalcButton, InfoBox } from "../../components/calc-ui";

export function TransfusiPRCCalc() {
  const { weightGram } = usePatient();
  const [wt, setWt] = useState(weightGram);
  const [hbActual, setHbActual] = useState(8);
  const [hbTarget, setHbTarget] = useState(12);
  const [show, setShow] = useState(false);

  useEffect(() => setWt(weightGram), [weightGram]);

  const wtKg = wt / 1000;
  const vol = Math.round((hbTarget - hbActual) * wtKg * 3);
  const rate3 = +(3 * wtKg).toFixed(2);
  const rate5 = +(5 * wtKg).toFixed(2);
  const dur3 = vol > 0 ? +(vol / rate3).toFixed(1) : 0;
  const dur5 = vol > 0 ? +(vol / rate5).toFixed(1) : 0;

  return (
    <CalcCard title="Transfusi PRC Neonatus" subtitle="Volume & Kecepatan" icon="🩸" color="red">
      <InfoBox>
        Volume PRC = (Hb target − Hb aktual) × BB (kg) × 3. Kecepatan: 3–5 mL/kgBB/jam.
      </InfoBox>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="g" />
        <CalcInput label="Hb aktual (g/dL)" value={hbActual} onChange={(v) => setHbActual(typeof v === "string" ? parseFloat(v) || 0 : v)} step={0.5} unit="g/dL" />
        <CalcInput label="Hb target (g/dL)" value={hbTarget} onChange={(v) => setHbTarget(typeof v === "string" ? parseFloat(v) || 0 : v)} step={0.5} unit="g/dL" />
      </div>
      <CalcButton onClick={() => setShow(true)} color="red">Hitung Volume Transfusi</CalcButton>
      {show && (
        <CalcResult color="red">
          <ResultGrid cols={3}>
            <ResultItem label="Volume PRC" value={`${vol}`} unit="mL" />
            <ResultItem label="Rate 3 mL/kg/jam" value={`${rate3}`} unit="mL/jam" note={`durasi: ${dur3} jam`} />
            <ResultItem label="Rate 5 mL/kg/jam" value={`${rate5}`} unit="mL/jam" note={`durasi: ${dur5} jam`} />
          </ResultGrid>
        </CalcResult>
      )}
    </CalcCard>
  );
}
