"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

export function ETTPICUCalc() {
  const { weightGram, ageYears } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [age, setAge] = useState(ageYears);
  const [type, setType] = useState("uncuffed");

  let size = 3.5;
  if (age < 1) size = 3.5;
  else if (type === "uncuffed") size = +(age / 4 + 4).toFixed(1);
  else size = +(age / 4 + 3.5).toFixed(1);

  if (w < 1) size = 2.5;
  else if (w < 3) size = 3;

  const oralDepth = +(size * 3).toFixed(1);
  const nasalDepth = +(oralDepth + 2).toFixed(1);

  let blade = "";
  if (age < 2) blade = "Miller 0-1";
  else if (age < 6) blade = "Miller 1";
  else if (age < 12) blade = "Macintosh 2";
  else blade = "Macintosh 3";

  const suction = +(size * 2 + 2).toFixed(0);

  return (
    <CalcCard title="ETT Size & Depth" subtitle="Tube sizing & equipment" icon="🩺" color="green">
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcInput label="Usia (thn)" value={age} onChange={(v) => setAge(v as number)} />
        <CalcSelect label="Tipe" value={type} onChange={setType} options={[{ value: "uncuffed", label: "Uncuffed" }, { value: "cuffed", label: "Cuffed" }]} />
      </div>
      <CalcResult color="green">
        <ResultGrid cols={2}>
          <ResultItem label="ETT Size" value={`${size}`} unit="mm" note={`±0.5 mm`} />
          <ResultItem label="Kedalaman Oral" value={`${oralDepth}`} unit="cm" />
          <ResultItem label="Kedalaman Nasal" value={`${nasalDepth}`} unit="cm" />
          <ResultItem label="Laringoskop" value={blade} />
          <ResultItem label="Suction Catheter" value={`${suction}`} unit="Fr" note="size×2+2" />
        </ResultGrid>
      </CalcResult>
    </CalcCard>
  );
}
