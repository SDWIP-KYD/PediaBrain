"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

const ageThresholds: Record<string, { hr: number; rr: number; wbc: number; minBp: number }> = {
  "<1": { hr: 180, rr: 60, wbc: 34000, minBp: 70 },
  "1-3": { hr: 180, rr: 40, wbc: 19500, minBp: 74 },
  "3-8": { hr: 150, rr: 34, wbc: 15000, minBp: 80 },
  "≥8": { hr: 130, rr: 22, wbc: 13000, minBp: 90 },
};

function getAgeGroup(age: number): string {
  if (age < 1) return "<1";
  if (age < 3) return "1-3";
  if (age < 8) return "3-8";
  return "≥8";
}

export function SepsisScoreCalc() {
  const { weightGram, ageYears } = usePatient();
  const [age, setAge] = useState(ageYears);
  const [w, setW] = useState(weightGram / 1000);
  const [temp, setTemp] = useState(38.5);
  const [hr, setHR] = useState(160);
  const [rr, setRR] = useState(45);
  const [wbc, setWBC] = useState(20000);
  const [sys, setSys] = useState(80);

  const ag = getAgeGroup(age);
  const th = ageThresholds[ag];

  const sirs: string[] = [];
  if (temp > 38.5 || temp < 36) sirs.push(`Temp ${temp}°C`);
  if (hr > th.hr) sirs.push(`HR ${hr} > ${th.hr}`);
  if (rr > th.rr) sirs.push(`RR ${rr} > ${th.rr}`);
  if (wbc > th.wbc || wbc < 4000) sirs.push(`WBC ${wbc}`);

  const hasSIRS = sirs.length >= 2;
  const hasShock = hasSIRS && sys < th.minBp;

  return (
    <CalcCard title="Sepsis Criteria" subtitle="IPSCC 2005 / Sepsis-3 pediatric" icon="🦠" color="amber">
      <InfoBox>
        SIRS ≥2 + hipotensi/hipoperfusion = Septic Shock. Age group: {ag} tahun.
      </InfoBox>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="Usia (thn)" value={age} onChange={(v) => setAge(v as number)} />
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcInput label="Temp (°C)" value={temp} onChange={(v) => setTemp(v as number)} step={0.1} />
        <CalcInput label="HR" value={hr} onChange={(v) => setHR(v as number)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="RR" value={rr} onChange={(v) => setRR(v as number)} />
        <CalcInput label="WBC (/µL)" value={wbc} onChange={(v) => setWBC(v as number)} />
        <CalcInput label="Sistole" value={sys} onChange={(v) => setSys(v as number)} />
      </div>
      <CalcResult color="amber">
        <div className="space-y-1 text-xs">
          <p className="font-semibold">SIRS Criteria ({sirs.length}/4):</p>
          {sirs.length > 0 ? sirs.map((s, i) => <p key={i} className="text-amber-300">• {s}</p>) : <p className="text-muted-foreground">• Tidak ada SIRS</p>}
        </div>
        <ResultGrid cols={2}>
          <ResultItem label="SIRS" value={hasSIRS ? "POSITIF (≥2)" : "Negatif"} />
          <ResultItem label="Septic Shock" value={hasShock ? "YA ⚠️" : "Tidak"} />
        </ResultGrid>
        {hasShock && (
          <ResultAlert type="danger">
            ⚠️ SEPTIC SHOCK — SIRS {sirs.length} + BP {sys} {"<"} {th.minBp} mmHg. Hour-1 Bundle: 1. Kultur darah → Antibiotik dalam 1 JAM / 2. NS bolus 10mL/kg / 3. Norepinefrin / 4. Glukosa dan kalsium / 5. Intubasi bila perlu. Resusitasi agresif segera!
          </ResultAlert>
        )}
        {hasSIRS && !hasShock && (
          <ResultAlert type="warning">
            🟡 SEPSIS — Tangani sumber infeksi, kultur, antibiotik dalam 3 jam, monitor produksi urin.
          </ResultAlert>
        )}
      </CalcResult>
    </CalcCard>
  );
}
