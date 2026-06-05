"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultItem, ResultGrid, CalcButton, InfoBox } from "../../components/calc-ui";

interface GrowthEntry {
  date: string;
  weight: number;
  height: number;
  hc: number;
}

function calcBMI(w: number, h: number): number {
  return h > 0 ? w / (h / 100) ** 2 : 0;
}

export function GrowthLog() {
  const { weightGram, heightCm, ageMonths, sex, patient } = usePatient();
  const headCircumference = patient.headCircumference;
  const [entries, setEntries] = useState<GrowthEntry[]>([
    {
      date: new Date().toISOString().split("T")[0],
      weight: weightGram / 1000,
      height: heightCm,
      hc: headCircumference,
    },
  ]);
  const [copied, setCopied] = useState(false);

  const addEntry = () => {
    const last = entries[entries.length - 1];
    setEntries((prev) => [
      ...prev,
      {
        date: new Date().toISOString().split("T")[0],
        weight: last?.weight || 0,
        height: last?.height || 0,
        hc: last?.hc || 0,
      },
    ]);
  };

  const removeEntry = (idx: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateEntry = (idx: number, field: keyof GrowthEntry, value: string | number) => {
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));
  };

  const latest = entries[entries.length - 1];
  const prev = entries.length > 1 ? entries[entries.length - 2] : null;
  const bmi = latest ? calcBMI(latest.weight, latest.height) : 0;
  const prevBmi = prev ? calcBMI(prev.weight, prev.height) : 0;
  const bmiChange = bmi - prevBmi;

  const weightChange = latest && prev ? latest.weight - prev.weight : 0;
  const heightChange = latest && prev ? latest.height - prev.height : 0;

  const ageYr = Math.floor(ageMonths / 12);
  const ageMo = ageMonths % 12;

  const output = `GROWTH MONITORING LOG
========================
Usia: ${ageYr} thn ${ageMo} bln | JK: ${sex === "L" ? "Laki-laki" : "Perempuan"}

DATA GROWTH:
${entries.map((e, i) => `${e.date} | BB: ${e.weight.toFixed(1)} kg | TB: ${e.height} cm | LK: ${e.hc} cm | BMI: ${calcBMI(e.weight, e.height).toFixed(1)}`).join("\n")}

LATEST:
- BB: ${latest?.weight.toFixed(1) || "-"} kg (${weightChange >= 0 ? "+" : ""}${weightChange.toFixed(1)} kg)
- TB: ${latest?.height || "-"} cm (${heightChange >= 0 ? "+" : ""}${heightChange.toFixed(1)} cm)
- BMI: ${bmi.toFixed(1)} (${bmiChange >= 0 ? "+" : ""}${bmiChange.toFixed(1)})`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Growth Monitoring Log" icon="📏" color="green">
      <div className="space-y-3">
        <InfoBox>
          WHO Growth Charts — Z-score tracking. Input data berat badan, tinggi badan, dan lingkar kepala dari waktu ke waktu.
        </InfoBox>

        {entries.map((entry, idx) => (
          <div key={idx} className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-foreground">Entry {idx + 1}</p>
              {entries.length > 1 && (
                <button onClick={() => removeEntry(idx)} className="text-[10px] text-red-400 hover:text-red-300">
                  Hapus
                </button>
              )}
            </div>
            <CalcInput label="Tanggal" type="text" value={entry.date} onChange={(v) => updateEntry(idx, "date", typeof v === "string" ? v : String(v))} placeholder="YYYY-MM-DD" />
            <div className="grid grid-cols-3 gap-2">
              <CalcInput label="BB (kg)" unit="kg" value={entry.weight} onChange={(v) => updateEntry(idx, "weight", typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} step={0.1} />
              <CalcInput label="TB (cm)" unit="cm" value={entry.height} onChange={(v) => updateEntry(idx, "height", typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
              <CalcInput label="LK (cm)" unit="cm" value={entry.hc} onChange={(v) => updateEntry(idx, "hc", typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
            </div>
            <p className="text-[10px] text-muted-foreground">BMI: {calcBMI(entry.weight, entry.height).toFixed(1)} kg/m²</p>
          </div>
        ))}

        <button onClick={addEntry} className="w-full rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:bg-accent transition-colors">
          + Tambah Entry
        </button>

        <CalcResult color="green">
          <ResultGrid cols={2}>
            <ResultItem label="Latest BB" value={latest ? `${latest.weight.toFixed(1)} kg` : "-"} />
            <ResultItem label="Latest TB" value={latest ? `${latest.height} cm` : "-"} />
            <ResultItem label="Latest BMI" value={bmi > 0 ? `${bmi.toFixed(1)}` : "-"} />
            <ResultItem label="BB Change" value={`${weightChange >= 0 ? "+" : ""}${weightChange.toFixed(1)} kg`} className={weightChange < 0 ? "text-red-400" : "text-green-400"} />
          </ResultGrid>
        </CalcResult>

        <CalcResult>
          <pre className="whitespace-pre-wrap text-xs font-mono text-foreground leading-relaxed">{output}</pre>
        </CalcResult>
        <CalcButton onClick={handleCopy} color="cyan">
          {copied ? "✓ Tersalin!" : "📋 Copy to Clipboard"}
        </CalcButton>
      </div>
    </CalcCard>
  );
}
