"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

const indications = [
  { value: "bradycardia", label: "Bradycardia (IV/IO)" },
  { value: "rsi", label: "Premedikasi RSI" },
  { value: "organophosphate", label: "Organophosphate" },
];

export function AtropinCalc() {
  const { weightGram } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [ind, setInd] = useState("bradycardia");

  let doseMg = 0;
  let note = "";

  if (ind === "bradycardia") {
    doseMg = Math.max(0.1, Math.min(0.5, +(0.02 * w).toFixed(2)));
    note = "Min 0.1mg (paradoxical bradycardia!), maks 1mg/dose";
  } else if (ind === "rsi") {
    doseMg = Math.max(0.1, Math.min(0.4, +(0.02 * w).toFixed(2)));
    note = "IM/IV 10 menit sebelum induksi";
  } else {
    doseMg = Math.max(0.05, +(0.02 * w).toFixed(2));
    note = "TITRATE sampai sekresi berkurang. q5-10 menit.";
  }

  const volMl = +(doseMg / 0.5).toFixed(2);

  return (
    <CalcCard title="Atropin" subtitle="Bradycardia, premed, organophosphate" icon="💊" color="cyan">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcSelect label="Indikasi" value={ind} onChange={setInd} options={indications} />
      </div>
      <CalcResult color="cyan">
        <ResultGrid cols={2}>
          <ResultItem label="Dosis" value={`${doseMg}`} unit="mg" />
          <ResultItem label="Volume" value={`${volMl}`} unit="mL" note="0.5mg/mL" />
        </ResultGrid>
        <p className="text-[11px] text-muted-foreground">{note}</p>
      </CalcResult>
    </CalcCard>
  );
}
