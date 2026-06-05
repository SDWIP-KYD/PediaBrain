"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

const types = [
  { value: "septic", label: "Septic", vol: 10 },
  { value: "hypo", label: "Hypovolemic", vol: 20 },
  { value: "dka", label: "DKA", vol: 10 },
  { value: "burn", label: "Luka Bakar (Burn)", vol: 0 },
];

export function CairanSyokCalc() {
  const { weightGram } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [type, setType] = useState("septic");
  const [cycle, setCycle] = useState("1st");
  const [tbsa, setTbsa] = useState(25);

  const t = types.find((t) => t.value === type)!;
  const vol = type === "burn" ? Math.round(3 * w * tbsa) : t.vol * w;
  const rate = +(vol / 0.25).toFixed(0);

  return (
    <CalcCard title="Resusitasi Cairan Syok" subtitle="Fluid bolus calculation" icon="💧" color="blue">
      <InfoBox>
        <strong>Surviving Sepsis Campaign 2020:</strong> Bolus 10–20 mL/kg (bukan 20–40) → reassess. Total &lt;40–60 mL/kg dalam 1 jam pertama.
      </InfoBox>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcSelect label="Tipe Syok" value={type} onChange={setType} options={types} />
        <CalcSelect label="Siklus" value={cycle} onChange={setCycle} options={[{ value: "1st", label: "Bolus 1" }, { value: "2nd", label: "Bolus 2" }, { value: "3rd", label: "Bolus 3+" }]} />
      </div>
      {type === "burn" && (
        <div className="grid grid-cols-3 gap-3">
          <CalcInput label="%TBSA" value={tbsa} onChange={(v) => setTbsa(v as number)} />
        </div>
      )}
      <CalcResult color="blue">
        <ResultGrid cols={2}>
          <ResultItem label="Volume" value={`${vol}`} unit="mL" />
          <ResultItem label="Rate" value={`${rate}`} unit="mL/jam" note="dalam 15 menit" />
        </ResultGrid>
        <InfoBox>
          <strong>Fluid:</strong> {type === "dka" ? "NS 0.9% — HINDARI bikarbonat!" : type === "hypo" ? "NS 0.9% (atau RL, koloid jika perlu)" : type === "burn" ? `Ringer Laktat — Parkland: 3 mL × ${w} kg × ${tbsa}% TBSA = ${vol} mL dalam 24 jam` : "NS 0.9% atau Ringer Lactat"}
        </InfoBox>
        {type === "dka" && (
          <ResultAlert type="warning">
            ⚠️ DKA: Ganti cairan perlahan setelah stabilisasi. Target keseimbangan 48 jam. Cerebral edema watch!
          </ResultAlert>
        )}
        {type === "burn" && (
          <ResultAlert type="warning">
            ⚠️ Parkland: {vol} mL total 24 jam. Setengah dalam 8 jam pertama ({Math.round(vol / 2)} mL), sisanya 16 jam ({Math.round(vol / 2)} mL). Target UO: 0.5–1 mL/kgBB/jam.
          </ResultAlert>
        )}
        {(cycle === "3rd" && type !== "burn") && (
          <ResultAlert type="warning">
            ⚠️ Bolus ke-3: Nilai ulang dengan hati-hati. Tanda fluid overload? Pertimbangkan vasopressor.
          </ResultAlert>
        )}
      </CalcResult>
    </CalcCard>
  );
}
