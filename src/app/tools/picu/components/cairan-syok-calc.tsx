"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

const types = [
  { value: "septic", label: "Septic", vol: 10 },
  { value: "hypo", label: "Hypovolemic", vol: 20 },
  { value: "dka", label: "DKA", vol: 10 },
];

export function CairanSyokCalc() {
  const { weightGram } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [type, setType] = useState("septic");
  const [cycle, setCycle] = useState("1st");

  const t = types.find((t) => t.value === type)!;
  const vol = t.vol * w;
  const rate = +(vol / 0.25).toFixed(0);

  return (
    <CalcCard title="Resusitasi Cairan Syok" subtitle="Fluid bolus calculation" icon="💧" color="blue">
      <InfoBox>Bolus diberikan dalam 15-20 menit. Evaluasi setelah setiap bolus.</InfoBox>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcSelect label="Tipe Syok" value={type} onChange={setType} options={types} />
        <CalcSelect label="Siklus" value={cycle} onChange={setCycle} options={[{ value: "1st", label: "Bolus 1" }, { value: "2nd", label: "Bolus 2" }, { value: "3rd", label: "Bolus 3+" }]} />
      </div>
      <CalcResult color="blue">
        <ResultGrid cols={2}>
          <ResultItem label="Volume" value={`${vol}`} unit="mL" />
          <ResultItem label="Rate" value={`${rate}`} unit="mL/jam" note="dalam 15 menit" />
        </ResultGrid>
        <InfoBox>
          <strong>Fluid:</strong> {type === "dka" ? "NS 0.9% — HINDARI bikarbonat!" : type === "hypo" ? "NS 0.9% (atau RL, koloid jika perlu)" : "NS 0.9% atau Ringer Lactat"}
        </InfoBox>
      </CalcResult>
    </CalcCard>
  );
}
