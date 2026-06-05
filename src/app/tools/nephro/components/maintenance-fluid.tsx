"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function MaintenanceFluidCalc() {
  const [w, setW] = useState(25);
  const [cond, setCond] = useState("normal");
  const [temp, setTemp] = useState(38);

  let base = w <= 10 ? w * 100 : w <= 20 ? 1000 + (w - 10) * 50 : 1500 + (w - 20) * 20;
  let mult = 1;
  if (cond === "fever") mult = 1 + 0.125 * Math.max(0, temp - 38);
  if (cond === "restrict") mult = 0.67;
  if (cond === "edema") mult = 0.5;
  const total = Math.round(base * mult);
  const rate = Math.round(total / 24 * 10) / 10;
  const pkg = Math.round(rate / w * 10) / 10;
  const type = cond === "restrict"
    ? "NS 0.9% + KCl 20mEq/L (restriksi)"
    : cond === "edema"
    ? "NS 0.9% (sangat ketat, target balance negatif)"
    : "NS 0.9% + 20 mEq/L KCl (isotonik modern)";

  return (
    <CalcCard title="Kebutuhan Cairan Maintenance" subtitle="Holliday-Segar & Isotonic recommendation" icon="💧" color="blue">
      <div className="space-y-3">
        <InfoBox>Holliday-Segar: 100 mL/kg (0–10 kg) + 50 mL/kg (10–20 kg) + 20 mL/kg (&gt;20 kg). Rekomendasi modern: Gunakan cairan isotonik (NS atau RL) untuk maintenance, bukan hipotonik.</InfoBox>
        <div className="grid grid-cols-3 gap-3">
          <CalcInput label="BB (kg)" unit="kg" value={w} onChange={(v) => setW(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} />
          <CalcSelect label="Kondisi" value={cond} onChange={setCond} options={[
            { value: "normal", label: "Normal" },
            { value: "fever", label: "Demam (+12.5%/°C di atas 38)" },
            { value: "restrict", label: "Restriksi (CKD/gagal jantung)" },
            { value: "edema", label: "Edema / Anasarka" },
          ]} />
          <CalcInput label="Suhu (°C) — jika demam" value={temp} onChange={(v) => setTemp(typeof v === "string" ? parseFloat(v) || 0 : v)} min={36} max={42} step={0.5} />
        </div>
        <CalcResult color="blue">
          <ResultGrid cols={3}>
            <ResultItem label="Total/hari" value={total} unit="mL" />
            <ResultItem label="Rate" value={rate} unit="mL/jam" />
            <ResultItem label="mL/kg/hr" value={pkg} />
          </ResultGrid>
          <ResultItem label="Jenis cairan" value={type} className="text-[11px] leading-tight" />
        </CalcResult>
        {cond === "restrict" && (
          <InfoBox>⚠️ Restriksi cairan pada CKD/gagal jantung: {total} mL/hr (⅔ maintenance). Monitor BB harian.</InfoBox>
        )}
      </div>
    </CalcCard>
  );
}
