"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

export function TidalVolumeCalc() {
  const { weightGram } = usePatient();
  const [wt, setWt] = useState(weightGram);
  const [measured, setMeasured] = useState(5);

  useEffect(() => setWt(weightGram), [weightGram]);

  const wtKg = wt / 1000;
  const perKg = wtKg > 0 ? +(measured / wtKg).toFixed(2) : 0;
  const minTV = +(4 * wtKg).toFixed(1);
  const midTV = +(5 * wtKg).toFixed(1);
  const maxTV = +(6 * wtKg).toFixed(1);

  let status = "";
  let statusType: "success" | "warning" | "danger" = "success";
  let note = "";

  if (perKg < 4) { status = "⬇ Terlalu Kecil"; statusType = "danger"; note = "Naikkan PIP atau pertimbangkan PEEP"; }
  else if (perKg > 6) { status = "⬆ Terlalu Besar"; statusType = "danger"; note = "Turunkan PIP/PC untuk cegah volutrauma"; }
  else { status = "✓ Optimal"; statusType = "success"; note = "Pertahankan setting saat ini"; }

  return (
    <CalcCard title="Target Tidal Volume" subtitle="VT/kg assessment" icon="📊" color="cyan">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(v as number)} unit="g" />
        <CalcInput label="VT Terukur (mL)" value={measured} onChange={(v) => setMeasured(v as number)} step={0.1} unit="mL" />
      </div>
      <CalcResult color="cyan">
        <ResultGrid cols={3}>
          <ResultItem label="VT/kg" value={`${perKg}`} unit="mL/kg" />
          <ResultItem label="VT minimum" value={`${minTV}`} unit="mL" note="4 mL/kg" />
          <ResultItem label="VT tengah" value={`${midTV}`} unit="mL" note="5 mL/kg" />
        </ResultGrid>
        <ResultGrid cols={1} className="mt-2">
          <ResultItem label="VT maksimum" value={`${maxTV}`} unit="mL" note="6 mL/kg" />
        </ResultGrid>
        <ResultAlert type={statusType}>
          {status} — {note}
        </ResultAlert>
      </CalcResult>
    </CalcCard>
  );
}
