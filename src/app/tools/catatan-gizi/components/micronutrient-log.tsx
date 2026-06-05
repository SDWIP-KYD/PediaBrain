"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, CalcButton, InfoBox } from "../../components/calc-ui";

interface Supplement {
  name: string;
  dose: string;
  frequency: string;
  route: string;
  indication: string;
  startDate: string;
}

export function MicronutrientLog() {
  const { ageMonths, weightGram } = usePatient();
  const weightKg = weightGram / 1000;
  const [supplements, setSupplements] = useState<Supplement[]>([
    { name: "Vitamin D", dose: "400", frequency: "daily", route: "oral", indication: "Profilaksis", startDate: new Date().toISOString().split("T")[0] },
  ]);
  const [copied, setCopied] = useState(false);

  const addSupplement = () => {
    setSupplements((prev) => [
      ...prev,
      { name: "", dose: "", frequency: "daily", route: "oral", indication: "", startDate: new Date().toISOString().split("T")[0] },
    ]);
  };

  const removeSupplement = (idx: number) => {
    setSupplements((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSupplement = (idx: number, field: keyof Supplement, value: string) => {
    setSupplements((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const ageYr = Math.floor(ageMonths / 12);
  const ageMo = ageMonths % 12;
  const ageStr = ageYr > 0 ? `${ageYr} thn ${ageMo} bln` : `${ageMo} bln`;

  const valid = supplements.filter((s) => s.name.trim());

  const output = `MICRONUTRIENT SUPPLEMENTATION LOG
====================================
Usia: ${ageStr} | BB: ${weightKg.toFixed(1)} kg

SUPLEMENTASI:
${valid.length > 0
  ? valid.map((s, i) =>
      `${i + 1}. ${s.name}
   Dose: ${s.dose} | Freq: ${s.frequency} | Route: ${s.route}
   Indikasi: ${s.indication || "-"}
   Start: ${s.startDate}`
  ).join("\n\n")
  : "Tidak ada suplementasi tercatat"}

TOTAL SUPLEMEN: ${valid.length}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Micronutrient Supplementation Log" icon="💊" color="purple">
      <div className="space-y-3">
        <InfoBox>
          Usia: {ageStr} · Track vitamin dan mineral supplementation dengan dose, frekuensi, dan indikasi.
        </InfoBox>

        {supplements.map((supp, idx) => (
          <div key={idx} className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-foreground">Suplemen {idx + 1}</p>
              {supplements.length > 1 && (
                <button onClick={() => removeSupplement(idx)} className="text-[10px] text-red-400 hover:text-red-300">
                  Hapus
                </button>
              )}
            </div>
            <CalcInput label="Nama" type="text" value={supp.name} onChange={(v) => updateSupplement(idx, "name", typeof v === "string" ? v : String(v))} placeholder="Vitamin D, Iron, Zinc..." />
            <div className="grid grid-cols-2 gap-2">
              <CalcInput label="Dose" type="text" value={supp.dose} onChange={(v) => updateSupplement(idx, "dose", typeof v === "string" ? v : String(v))} placeholder="400 IU, 5 mg..." />
              <CalcSelect label="Frekuensi" value={supp.frequency} onChange={(v) => updateSupplement(idx, "frequency", v)} options={[
                { value: "daily", label: "Harian" },
                { value: "bid", label: "2x/hari" },
                { value: "tid", label: "3x/hari" },
                { value: "weekly", label: "Mingguan" },
                { value: "monthly", label: "Bulanan" },
                { value: "prn", label: "PRN" },
              ]} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <CalcSelect label="Route" value={supp.route} onChange={(v) => updateSupplement(idx, "route", v)} options={[
                { value: "oral", label: "Oral" },
                { value: "iv", label: "IV" },
                { value: "im", label: "IM" },
                { value: "sc", label: "SC" },
              ]} />
              <CalcInput label="Tanggal Mulai" type="text" value={supp.startDate} onChange={(v) => updateSupplement(idx, "startDate", typeof v === "string" ? v : String(v))} placeholder="YYYY-MM-DD" />
            </div>
            <CalcInput label="Indikasi" type="text" value={supp.indication} onChange={(v) => updateSupplement(idx, "indication", typeof v === "string" ? v : String(v))} placeholder="Defisiensi, profilaksis..." />
          </div>
        ))}

        <button onClick={addSupplement} className="w-full rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:bg-accent transition-colors">
          + Tambah Suplemen
        </button>

        <CalcResult color="purple">
          <ResultGrid cols={2}>
            <ResultItem label="Total Suplemen" value={`${valid.length}`} />
            <ResultItem label="Status" value={valid.length > 0 ? "Sedang suplementasi" : "Tidak ada suplementasi"} />
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
