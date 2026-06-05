"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultItem, ResultGrid, InfoBox, ResultAlert } from "../../components/calc-ui";
import type { DrugDefinition } from "../data/drugs";

interface DrugDetailProps {
  drug: DrugDefinition;
  onBack: () => void;
}

export function DrugDetail({ drug, onBack }: DrugDetailProps) {
  const { weightKg } = usePatient();
  const [customWeight, setCustomWeight] = useState(weightKg);
  const [selectedIndication, setSelectedIndication] = useState(0);

  const currentDose = drug.pediatricDosing[selectedIndication];

  function parseDose(doseStr: string, weight: number): { min: number; max: number; unit: string } {
    const match = doseStr.match(/(\d+(?:\.\d+)?)-?(\d+(?:\.\d+)?)?\s*(mg|mcg|unit|mEq)/);
    if (!match) return { min: 0, max: 0, unit: "" };
    const low = parseFloat(match[1]);
    const high = match[2] ? parseFloat(match[2]) : low;
    const unit = match[3];
    return { min: low * weight, max: high * weight, unit };
  }

  function parseMaxDose(maxStr: string): { value: number; unit: string } | null {
    const match = maxStr.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|unit|mEq|g)/);
    if (!match) return null;
    const val = parseFloat(match[1]);
    const unit = match[2];
    if (unit === "g") return { value: val * 1000, unit: "mg" };
    return { value: val, unit };
  }

  const parsed = parseDose(currentDose.dose, customWeight);
  const maxDoseParsed = parseMaxDose(currentDose.maxDose);

  const calculatedDose = maxDoseParsed
    ? Math.min(parsed.max, maxDoseParsed.value)
    : parsed.max;

  const calculatedDoseLow = maxDoseParsed
    ? Math.min(parsed.min, maxDoseParsed.value)
    : parsed.min;

  const categoryColors: Record<string, string> = {
    "Antibiotik": "cyan",
    "Analgesik/Antipiretik": "purple",
    "Kardiovaskuler": "red",
    "Respirasi": "blue",
    "Gastrointestinal": "green",
    "Endokrin": "yellow",
    "Neurologi": "pink",
    "Hematologi": "orange",
    "Gawat Darurat": "green",
    "Alergi/Imunologi": "violet",
    "Nutrisi/Vitamin": "yellow",
    "Dermatologi/Topikal": "teal",
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        ← Kembali ke Pencarian
      </button>

      <CalcCard
        title={drug.name}
        subtitle={drug.brandNames.join(", ")}
        icon="💊"
        color={categoryColors[drug.category] || "slate"}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded border bg-blue-500/10 border-blue-500/20 text-blue-400">
              {drug.category}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {drug.subcategory}
            </span>
          </div>

          <CalcInput
            label="Berat Badan Anak (kg)"
            unit="kg"
            value={customWeight}
            onChange={(v) => setCustomWeight(typeof v === "string" ? parseFloat(v) || 0 : v)}
            min={0.5}
            step={0.5}
          />
        </div>
      </CalcCard>

      {drug.contraindications.length > 0 && (
        <ResultAlert type="danger">
          <p className="font-semibold text-[11px] uppercase tracking-wider mb-1">Kontraindikasi</p>
          <ul className="list-disc list-inside text-xs space-y-0.5">
            {drug.contraindications.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </ResultAlert>
      )}

      {drug.warnings.length > 0 && (
        <ResultAlert type="warning">
          <p className="font-semibold text-[11px] uppercase tracking-wider mb-1">Peringatan</p>
          <ul className="list-disc list-inside text-xs space-y-0.5">
            {drug.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </ResultAlert>
      )}

      <CalcCard title="Dosis Berdasarkan Indikasi" icon="⚖️" color="green">
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Indikasi
            </label>
            <select
              value={selectedIndication}
              onChange={(e) => setSelectedIndication(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neon/30 focus:border-neon/50"
            >
              {drug.pediatricDosing.map((d, i) => (
                <option key={i} value={i}>
                  {d.indication}
                </option>
              ))}
            </select>
          </div>

          {currentDose && (
            <CalcResult color="green">
              <ResultGrid cols={2}>
                <ResultItem label="Dosis Minimum" value={parsed.min.toFixed(1)} unit={parsed.unit} />
                <ResultItem label="Dosis Maksimum" value={parsed.max.toFixed(1)} unit={parsed.unit} />
              </ResultGrid>
              <ResultGrid cols={2}>
                <ResultItem
                  label="Dosis Efektif (Dibatasi Max)"
                  value={calculatedDose.toFixed(1)}
                  unit={parsed.unit}
                />
                <ResultItem label="Jalur" value={currentDose.route} />
              </ResultGrid>
              <ResultGrid cols={2}>
                <ResultItem label="Frekuensi" value={currentDose.frequency} />
                <ResultItem label="Dosis Maks Tercatat" value={currentDose.maxDose} />
              </ResultGrid>
            </CalcResult>
          )}

          {customWeight > 0 && parsed.max > 0 && (
            <InfoBox>
              Perhitungan otomatis: {parsed.max.toFixed(1)} {parsed.unit} × berat {customWeight} kg
              {maxDoseParsed
                ? ` (dibatasi ${maxDoseParsed.value} ${maxDoseParsed.unit})`
                : ""}
            </InfoBox>
          )}
        </div>
      </CalcCard>

      <CalcCard title="Semua Opsi Dosis" icon="📋" color="slate">
        <div className="space-y-3">
          {drug.pediatricDosing.map((d, i) => (
            <div
              key={i}
              className={`rounded-lg border p-3 space-y-1 ${
                i === selectedIndication
                  ? "border-cyan-500/30 bg-cyan-500/5"
                  : "border-border bg-muted/20"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{d.indication}</p>
                {i === selectedIndication && (
                  <span className="text-[10px] text-cyan-400">Aktif</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                <div>
                  <span className="text-muted-foreground">Dosis: </span>
                  <span className="font-mono">{d.dose}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Max: </span>
                  <span className="font-mono">{d.maxDose}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Rute: </span>
                  <span className="font-mono">{d.route}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Frekuensi: </span>
                  <span className="font-mono">{d.frequency}</span>
                </div>
              </div>
              {customWeight > 0 && (
                <DoseCalculation dose={d} weight={customWeight} />
              )}
            </div>
          ))}
        </div>
      </CalcCard>

      {drug.sideEffects.length > 0 && (
        <CalcCard title="Efek Samping" icon="⚠️" color="yellow">
          <div className="flex flex-wrap gap-1.5">
            {drug.sideEffects.map((se, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400"
              >
                {se}
              </span>
            ))}
          </div>
        </CalcCard>
      )}

      {drug.interactions.length > 0 && (
        <CalcCard title="Interaksi Obat" icon="🔗" color="orange">
          <ul className="space-y-1.5">
            {drug.interactions.map((inter, i) => (
              <li key={i} className="text-xs text-muted-foreground">
                • {inter}
              </li>
            ))}
          </ul>
        </CalcCard>
      )}

      {(drug.renalAdjustment || drug.hepaticAdjustment) && (
        <CalcCard title="Penyesuaian Dosis" icon="🫘" color="teal">
          <div className="space-y-2">
            {drug.renalAdjustment && (
              <InfoBox>
                <span className="font-semibold">Ginjal:</span> {drug.renalAdjustment}
              </InfoBox>
            )}
            {drug.hepaticAdjustment && (
              <InfoBox>
                <span className="font-semibold">Hati:</span> {drug.hepaticAdjustment}
              </InfoBox>
            )}
          </div>
        </CalcCard>
      )}

      <CalcCard title="Referensi" icon="📚" color="slate">
        <ul className="space-y-1">
          {drug.references.map((ref, i) => (
            <li key={i} className="text-[11px] text-muted-foreground">
              • {ref}
            </li>
          ))}
        </ul>
      </CalcCard>
    </div>
  );
}

function DoseCalculation({ dose, weight }: { dose: { dose: string; maxDose: string }; weight: number }) {
  const match = dose.dose.match(/(\d+(?:\.\d+)?)-?(\d+(?:\.\d+)?)?\s*(mg|mcg|unit|mEq)/);
  if (!match || !match[1]) return null;

  const low = parseFloat(match[1]) * weight;
  const high = (match[2] ? parseFloat(match[2]) : parseFloat(match[1])) * weight;
  const unit = match[3];

  const maxMatch = dose.maxDose.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|unit|mEq|g)/);
  let maxVal = Infinity;
  let maxUnit = unit;
  if (maxMatch) {
    maxVal = parseFloat(maxMatch[1]);
    maxUnit = maxMatch[2];
    if (maxUnit === "g") {
      maxVal *= 1000;
      maxUnit = "mg";
    }
  }

  const effectiveMax = Math.min(high, maxVal);

  return (
    <div className="mt-1.5 pt-1.5 border-t border-border/50">
      <p className="text-[10px] text-cyan-400 font-mono">
        ≈ {low.toFixed(1)}-{effectiveMax.toFixed(1)} {unit}
        {high > maxVal && maxVal !== Infinity && (
          <span className="text-amber-400"> (dibatasi {maxVal} {maxUnit})</span>
        )}
      </p>
    </div>
  );
}
