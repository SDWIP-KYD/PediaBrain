"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

const indications = [
  { value: "arrest", label: "Arrest (IV/IO) — 1:10000" },
  { value: "arrest-ett", label: "Arrest (ETT) — 1:1000" },
  { value: "anaphylaxis-im", label: "Anaphylaxis IM — 1:1000" },
  { value: "anaphylaxis-iv", label: "Anaphylaxis IV — 1:10000" },
  { value: "infusion", label: "Inotropic Infusion" },
];

export function EpinefrinCalc() {
  const { weightGram } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [ind, setInd] = useState("arrest");

  let doseMg = 0;
  let conc = "";
  let volMl = 0;
  let freq = "";
  let note = "";

  if (ind === "arrest") {
    doseMg = +(0.01 * w).toFixed(2);
    conc = "1mg/10mL (1:10000)";
    volMl = +(0.1 * w).toFixed(2);
    freq = "q3-5 menit";
    note = "Setelah 2 siklus CPR";
  } else if (ind === "arrest-ett") {
    doseMg = +(0.1 * w).toFixed(2);
    conc = "1mg/mL (1:1000)";
    volMl = +(0.1 * w).toFixed(2);
    freq = "Flush 5mL NS";
    note = "Kurang potent dari IV/IO";
  } else if (ind === "anaphylaxis-im") {
    doseMg = Math.min(0.5, +(0.01 * w).toFixed(2));
    conc = "1mg/mL (1:1000)";
    volMl = doseMg;
    freq = "q5-15 menit PRN, max 3×";
    note = "IM paha anterolateral";
  } else if (ind === "anaphylaxis-iv") {
    doseMg = +(0.001 * w).toFixed(3);
    conc = "0.1mg/mL (1:10000)";
    volMl = +(0.01 * w).toFixed(2);
    freq = "Slow IV";
    note = "Hanya bila IM gagal/shock berat";
  } else {
    doseMg = +(0.1 * w * 6 * 0.05).toFixed(2);
    conc = "mg dalam 100mL";
    volMl = 0;
    freq = "1 mL/jam = 0.05 mcg/kg/mnt";
    note = "Titrate 0.05-2 mcg/kg/mnt";
  }

  return (
    <CalcCard title="Epinefrin Detail" subtitle="Dose & concentration by route" icon="💉" color="red">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcSelect label="Indikasi" value={ind} onChange={setInd} options={indications} />
      </div>
      <CalcResult color="red">
        <ResultGrid cols={2}>
          <ResultItem label="Dosis" value={`${doseMg}`} unit="mg" />
          {volMl > 0 && <ResultItem label="Volume" value={`${volMl}`} unit="mL" note={conc} />}
          <ResultItem label="Frekuensi" value={freq} />
        </ResultGrid>
        {note && <p className="text-[11px] text-muted-foreground">{note}</p>}
      </CalcResult>
    </CalcCard>
  );
}
