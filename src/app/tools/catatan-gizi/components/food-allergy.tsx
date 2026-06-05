"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, CalcButton, InfoBox } from "../../components/calc-ui";

interface Allergen {
  name: string;
  reaction: string;
  severity: string;
  ofcResult: string;
}

export function FoodAllergy() {
  const { ageMonths, weightGram } = usePatient();
  const [allergens, setAllergens] = useState<Allergen[]>([
    { name: "", reaction: "", severity: "mild", ofcResult: "" },
  ]);
  const [copied, setCopied] = useState(false);

  const addAllergen = () => {
    setAllergens((prev) => [...prev, { name: "", reaction: "", severity: "mild", ofcResult: "" }]);
  };

  const removeAllergen = (idx: number) => {
    setAllergens((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateAllergen = (idx: number, field: keyof Allergen, value: string) => {
    setAllergens((prev) => prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));
  };

  const ageYr = Math.floor(ageMonths / 12);
  const ageMo = ageMonths % 12;
  const ageStr = ageYr > 0 ? `${ageYr} thn ${ageMo} bln` : `${ageMo} bln`;

  const validAllergens = allergens.filter((a) => a.name.trim());
  const severeCount = validAllergens.filter((a) => a.severity === "severe").length;

  const output = `CATATAN ALERGI MAKANAN
========================
Usia: ${ageStr} | BB: ${(weightGram / 1000).toFixed(1)} kg

ALERGEN:
${validAllergens.length > 0
  ? validAllergens.map((a, i) =>
      `${i + 1}. ${a.name}
   Reaksi: ${a.reaction || "-"}
   Severity: ${a.severity}
   OFC: ${a.ofcResult || "Belum dilakukan"}`
  ).join("\n\n")
  : "Tidak ada alergen tercatat"}

JUMLAH ALERGEN: ${validAllergens.length}
ALERGI BERAT: ${severeCount}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Food Allergy Record" icon="🥜" color="orange">
      <div className="space-y-3">
        <InfoBox>
          Usia: {ageStr} · Catat semua alergen makanan, jenis reaksi, dan hasil oral food challenge.
        </InfoBox>

        {allergens.map((allergen, idx) => (
          <div key={idx} className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-foreground">Allergen {idx + 1}</p>
              {allergens.length > 1 && (
                <button onClick={() => removeAllergen(idx)} className="text-[10px] text-red-400 hover:text-red-300">
                  Hapus
                </button>
              )}
            </div>
            <CalcInput label="Nama Makanan" type="text" value={allergen.name} onChange={(v) => updateAllergen(idx, "name", typeof v === "string" ? v : String(v))} placeholder="Susu, telur, kacang..." />
            <CalcInput label="Jenis Reaksi" type="text" value={allergen.reaction} onChange={(v) => updateAllergen(idx, "reaction", typeof v === "string" ? v : String(v))} placeholder="Urtikaria, sesak, muntah..." />
            <CalcSelect label="Severity" value={allergen.severity} onChange={(v) => updateAllergen(idx, "severity", v)} options={[
              { value: "mild", label: "Mild (urtikaria lokal)" },
              { value: "moderate", label: "Moderate (angioedema, GI)" },
              { value: "severe", label: "Severe (anafilaksis)" },
            ]} />
            <CalcInput label="Hasil OFC" type="text" value={allergen.ofcResult} onChange={(v) => updateAllergen(idx, "ofcResult", typeof v === "string" ? v : String(v))} placeholder="Positif/Negatif/..." />
          </div>
        ))}

        <button onClick={addAllergen} className="w-full rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:bg-accent transition-colors">
          + Tambah Allergen
        </button>

        <CalcResult color="orange">
          <ResultGrid cols={2}>
            <ResultItem label="Total Allergen" value={`${validAllergens.length}`} />
            <ResultItem label="Severe Allergy" value={`${severeCount}`} className={severeCount > 0 ? "text-red-400" : "text-green-400"} />
          </ResultGrid>
        </CalcResult>

        {severeCount > 0 && (
          <InfoBox>
            <strong>Anafilaksis:</strong> Pastikan EpiPen tersedia. Rujuk alergologis untuk evaluasi lebih lanjut.
          </InfoBox>
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
