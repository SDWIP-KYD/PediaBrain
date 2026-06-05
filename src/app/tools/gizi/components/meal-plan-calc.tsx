"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, InfoBox } from "../../components/calc-ui";

const distributions: Record<string, [number, string][]> = {
  "3meal": [[25, "Sarapan"], [15, "Selingan Pagi"], [30, "Makan Siang"], [15, "Selingan Sore"], [15, "Makan Malam"]],
  "5meal": [[20, "Makan 1"], [20, "Makan 2"], [20, "Makan 3"], [20, "Makan 4"], [20, "Makan 5"]],
  "6meal": [[17, "Makan 1"], [17, "Makan 2"], [17, "Makan 3"], [17, "Makan 4"], [17, "Makan 5"], [15, "Makan 6"]],
  "2main": [[25, "Makan Utama 1"], [15, "Selingan 1"], [25, "Makan Utama 2"], [15, "Selingan 2"], [20, "Selingan 3"]],
};

const patternOptions = [
  { value: "3meal", label: "3 makan utama + 2 selingan" },
  { value: "5meal", label: "5 kali makan kecil" },
  { value: "6meal", label: "6 kali (bayi/sakit)" },
  { value: "2main", label: "2 makan utama + 3 selingan" },
];

export function MealPlanCalc() {
  const [kcal, setKcal] = useState(1200);
  const [age, setAge] = useState(4);
  const [pattern, setPattern] = useState("3meal");

  const dist = distributions[pattern] || distributions["3meal"];
  const exampleKcal = Math.round(kcal * 0.25);

  return (
    <CalcCard title="Estimasi Menu Harian" subtitle="Distribusi kalori per waktu makan" icon="🗓️" color="orange">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <CalcInput label="Target Kalori/hari (kcal)" unit="kcal" value={kcal} onChange={(v) => setKcal(typeof v === "string" ? parseFloat(v) || 0 : v)} min={500} step={50} />
          <CalcInput label="Usia (thn)" unit="thn" value={age} onChange={(v) => setAge(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={18} />
        </div>
        <CalcSelect label="Pola Makan" value={pattern} onChange={setPattern} options={patternOptions} />
        <CalcResult color="orange">
          <div className="space-y-1.5">
            <p className="font-bold text-sm mb-2">Target {kcal} kkal/hari — {dist.length} kali makan</p>
            {dist.map(([pct, name], i) => (
              <div key={i} className="flex justify-between items-center text-xs">
                <span>{name}</span>
                <span className="font-mono font-bold">{Math.round(kcal * pct / 100)} kkal ({pct}%)</span>
              </div>
            ))}
          </div>
        </CalcResult>
        <InfoBox>
          Contoh porsi untuk {exampleKcal} kkal (sarapan): Nasi 100g (130 kkal) + Telur 1 btr (78 kkal) + Bayam 50g (12 kkal) + Minyak 5mL (45 kkal) ≈ 265 kkal
        </InfoBox>
      </div>
    </CalcCard>
  );
}
