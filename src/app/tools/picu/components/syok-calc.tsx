"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

const shockTypes = [
  { value: "septic", label: "Septic Shock" },
  { value: "hypovolemic", label: "Hypovolemic" },
  { value: "cardiogenic", label: "Cardiogenic" },
  { value: "obstructive", label: "Obstructive" },
];

export function SyokCalc() {
  const { weightGram, ageYears } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [age, setAge] = useState(ageYears);
  const [hr, setHR] = useState(150);
  const [sys, setSys] = useState(70);
  const [dia, setDia] = useState(40);
  const [type, setType] = useState("septic");

  const map = +((sys + 2 * dia) / 3).toFixed(0);
  const minBP = age < 1 ? 70 : age < 10 ? 70 + 2 * age : 90;
  const si = hr / sys;

  let mapTarget = 45;
  if (age >= 1 && age < 5) mapTarget = 55;
  else if (age >= 5 && age < 12) mapTarget = 65;
  else if (age >= 12) mapTarget = 70;

  const isShock = sys < minBP || si > 1.2 || map < mapTarget;

  const bolus = type === "hypovolemic" ? Math.round(20 * w) : Math.round(10 * w);

  return (
    <CalcCard title="Evaluasi Syok" subtitle="Shock assessment & targets" icon="❤️" color="red">
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcInput label="Usia (thn)" value={age} onChange={(v) => setAge(v as number)} />
        <CalcSelect label="Tipe Syok" value={type} onChange={setType} options={shockTypes} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="HR" value={hr} onChange={(v) => setHR(v as number)} />
        <CalcInput label="Sistole" value={sys} onChange={(v) => setSys(v as number)} />
        <CalcInput label="Diastole" value={dia} onChange={(v) => setDia(v as number)} />
      </div>
      <CalcResult color="red">
        <ResultGrid cols={2}>
          <ResultItem label="MAP" value={`${map}`} unit="mmHg" />
          <ResultItem label="MAP Target" value={`${mapTarget}`} unit="mmHg" />
          <ResultItem label="Min BP" value={`${minBP}`} unit="mmHg" />
          <ResultItem label="Shock Index" value={`${+si.toFixed(2)}`} note={si > 1.2 ? "⚠️ Tinggi" : "Normal"} />
        </ResultGrid>
        <ResultAlert type={isShock ? "danger" : "success"}>
          {isShock ? `⚠️ SHOCK TERDETEKSI — BP ${sys}/${dia}, MAP ${map}, SI ${+si.toFixed(2)}` : "✅ Hemodinamik stabil"}
        </ResultAlert>
        {isShock && (
          <div className="text-[11px] text-muted-foreground space-y-1">
            <p><strong>Bolus:</strong> {bolus} mL {type === "hypovolemic" ? "NS" : type === "septic" ? "NS/RL" : "Hati-hati!"} dalam 15 menit</p>
            {type === "cardiogenic" && <p className="text-amber-400">⚠️ Hindari bolus besar! Dobutamin/Milrinone. STAT Echo!</p>}
            {type === "obstructive" && <p className="text-amber-400">⚠️ Tension PTX → needle decompression. Tamponade → pericardiocentesis.</p>}
          </div>
        )}
      </CalcResult>
    </CalcCard>
  );
}
