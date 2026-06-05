"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, CalcButton, InfoBox, ResultAlert } from "../../components/calc-ui";

interface IntakeEntry {
  source: string;
  volume: number;
}

interface OutputEntry {
  type: string;
  volume: number;
}

export function IntakeOutput() {
  const { weightGram, ageMonths } = usePatient();
  const weightKg = weightGram / 1000;

  const [intakes, setIntakes] = useState<IntakeEntry[]>([
    { source: "oral", volume: 0 },
  ]);
  const [outputs, setOutputs] = useState<OutputEntry[]>([
    { type: "urine", volume: 0 },
  ]);
  const [period, setPeriod] = useState("shift");
  const [copied, setCopied] = useState(false);

  const addIntake = () => setIntakes((prev) => [...prev, { source: "oral", volume: 0 }]);
  const addOutput = () => setOutputs((prev) => [...prev, { type: "urine", volume: 0 }]);
  const removeIntake = (idx: number) => setIntakes((prev) => prev.filter((_, i) => i !== idx));
  const removeOutput = (idx: number) => setOutputs((prev) => prev.filter((_, i) => i !== idx));

  const totalIntake = intakes.reduce((sum, e) => sum + e.volume, 0);
  const totalOutput = outputs.reduce((sum, e) => sum + e.volume, 0);
  const balance = totalIntake - totalOutput;
  const balancePerKg = weightKg > 0 ? balance / weightKg : 0;
  const intakePerKg = weightKg > 0 ? totalIntake / weightKg : 0;

  const ageYr = Math.floor(ageMonths / 12);
  const ageMo = ageMonths % 12;
  const ageStr = ageYr > 0 ? `${ageYr} thn ${ageMo} bln` : `${ageMo} bln`;

  const output = `INTAKE/OUTPUT RECORD
======================
Usia: ${ageStr} | BB: ${weightKg.toFixed(1)} kg
Periode: ${period === "shift" ? "Per Shift (8hr)" : "24 Jam"}

INTAKE:
${intakes.map((e, i) => `${i + 1}. ${e.source}: ${e.volume} mL`).join("\n")}
TOTAL INTAKE: ${totalIntake} mL (${intakePerKg.toFixed(1)} mL/kg)

OUTPUT:
${outputs.map((e, i) => `${i + 1}. ${e.type}: ${e.volume} mL`).join("\n")}
TOTAL OUTPUT: ${totalOutput} mL

FLUID BALANCE: ${balance >= 0 ? "+" : ""}${balance} mL (${balancePerKg >= 0 ? "+" : ""}${balancePerKg.toFixed(1)} mL/kg)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Intake/Output Record" icon="💧" color="blue">
      <div className="space-y-3">
        <CalcSelect label="Periode" value={period} onChange={setPeriod} options={[
          { value: "shift", label: "Per Shift (8 jam)" },
          { value: "24hr", label: "24 Jam" },
        ]} />

        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-blue-400">Intake</p>
          {intakes.map((entry, idx) => (
            <div key={idx} className="flex items-end gap-2">
              <div className="flex-1">
                <CalcSelect label="Sumber" value={entry.source} onChange={(v) => {
                  const newIntakes = [...intakes];
                  newIntakes[idx].source = v;
                  setIntakes(newIntakes);
                }} options={[
                  { value: "oral", label: "Oral" },
                  { value: "tpn", label: "TPN" },
                  { value: "enteral", label: "Enteral" },
                  { value: "iv", label: "IV Fluid" },
                  { value: "blood", label: "Blood Product" },
                  { value: "other", label: "Lainnya" },
                ]} />
              </div>
              <div className="flex-1">
                <CalcInput label="Volume (mL)" unit="mL" value={entry.volume} onChange={(v) => {
                  const newIntakes = [...intakes];
                  newIntakes[idx].volume = typeof v === "string" ? parseFloat(v) || 0 : v;
                  setIntakes(newIntakes);
                }} min={0} />
              </div>
              {intakes.length > 1 && (
                <button onClick={() => removeIntake(idx)} className="text-[10px] text-red-400 hover:text-red-300 pb-2">✕</button>
              )}
            </div>
          ))}
          <button onClick={addIntake} className="w-full rounded-lg border border-dashed border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-accent">
            + Tambah Intake
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-blue-400">Output</p>
          {outputs.map((entry, idx) => (
            <div key={idx} className="flex items-end gap-2">
              <div className="flex-1">
                <CalcSelect label="Jenis" value={entry.type} onChange={(v) => {
                  const newOutputs = [...outputs];
                  newOutputs[idx].type = v;
                  setOutputs(newOutputs);
                }} options={[
                  { value: "urine", label: "Urine" },
                  { value: "stool", label: "Stool" },
                  { value: "emesis", label: "Emesis" },
                  { value: "drain", label: "Drain" },
                  { value: "other", label: "Lainnya" },
                ]} />
              </div>
              <div className="flex-1">
                <CalcInput label="Volume (mL)" unit="mL" value={entry.volume} onChange={(v) => {
                  const newOutputs = [...outputs];
                  newOutputs[idx].volume = typeof v === "string" ? parseFloat(v) || 0 : v;
                  setOutputs(newOutputs);
                }} min={0} />
              </div>
              {outputs.length > 1 && (
                <button onClick={() => removeOutput(idx)} className="text-[10px] text-red-400 hover:text-red-300 pb-2">✕</button>
              )}
            </div>
          ))}
          <button onClick={addOutput} className="w-full rounded-lg border border-dashed border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-accent">
            + Tambah Output
          </button>
        </div>

        <CalcResult color="blue">
          <ResultGrid cols={2}>
            <ResultItem label="Total Intake" value={`${totalIntake} mL`} />
            <ResultItem label="Total Output" value={`${totalOutput} mL`} />
            <ResultItem label="Balance" value={`${balance >= 0 ? "+" : ""}${balance} mL`} className={balance < 0 ? "text-red-400" : "text-green-400"} />
            <ResultItem label="Balance/kg" value={`${balancePerKg >= 0 ? "+" : ""}${balancePerKg.toFixed(1)} mL/kg`} className={balancePerKg < -2 ? "text-red-400" : "text-green-400"} />
          </ResultGrid>
        </CalcResult>

        {balancePerKg < -2 && (
          <ResultAlert type="warning">
            Fluid balance negatif &gt;2 mL/kg — evaluasi intake dan pertimbangkan penyesuaian fluida.
          </ResultAlert>
        )}

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
