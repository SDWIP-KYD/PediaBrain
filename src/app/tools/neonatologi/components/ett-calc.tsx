"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

export function ETTCalc() {
  const { weightGram, gestationalAge } = usePatient();
  const [wt, setWt] = useState(weightGram);
  const [ga, setGa] = useState(gestationalAge);

  useEffect(() => { setWt(weightGram); setGa(gestationalAge); }, [weightGram, gestationalAge]);

  const wtKg = wt / 1000;
  let size = "2.0";
  if (wt < 750) size = "2.0";
  else if (wt < 1000) size = "2.5";
  else if (wt < 2000) size = "2.5";
  else if (wt < 3000) size = "3.0";
  else if (wt < 4000) size = "3.5";
  else size = "3.5-4.0";

  const depthBibir = +(wtKg + 6).toFixed(1);
  const depthNares = +(depthBibir + 1.5).toFixed(1);

  return (
    <CalcCard title="ETT Size & Depth" subtitle="Ukuran ETT & kedalaman" icon="🩺" color="green">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(v as number)} unit="g" />
        <CalcInput label="GA (minggu)" value={ga} onChange={(v) => setGa(v as number)} unit="mgg" />
      </div>
      <CalcResult color="green">
        <ResultGrid cols={3}>
          <ResultItem label="ETT Size" value={size} unit="mm" />
          <ResultItem label="Kedalaman Bibir" value={`${depthBibir}`} unit="cm" />
          <ResultItem label="Kedalaman Nares" value={`${depthNares}`} unit="cm" />
        </ResultGrid>
        <InfoBox>
          Rumus: Kedalaman bibir ≈ BB(kg) + 6 cm. Konfirmasi dengan X-ray (0.5-1 cm di atas carina).
        </InfoBox>
      </CalcResult>
    </CalcCard>
  );
}
