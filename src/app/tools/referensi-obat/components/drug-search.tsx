"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";
import { drugs, type DrugDefinition } from "../data/drugs";

interface DrugSearchProps {
  onSelectDrug: (drug: DrugDefinition) => void;
}

export function DrugSearch({ onSelectDrug }: DrugSearchProps) {
  const { weightKg } = usePatient();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [autoWeight, setAutoWeight] = useState(weightKg);

  const filtered = drugs.filter((d) => {
    const matchesQuery =
      !query.trim() ||
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.brandNames.some((b) => b.toLowerCase().includes(query.toLowerCase())) ||
      d.category.toLowerCase().includes(query.toLowerCase()) ||
      d.subcategory.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory === "all" || d.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  const categoryOptions = [
    { value: "all", label: "Semua Kategori" },
    { value: "Antibiotik", label: "Antibiotik" },
    { value: "Analgesik/Antipiretik", label: "Analgesik/Antipiretik" },
    { value: "Kardiovaskuler", label: "Kardiovaskuler" },
    { value: "Respirasi", label: "Respirasi" },
    { value: "Gastrointestinal", label: "Gastrointestinal" },
    { value: "Endokrin", label: "Endokrin" },
    { value: "Neurologi", label: "Neurologi" },
    { value: "Hematologi", label: "Hematologi" },
    { value: "Gawat Darurat", label: "Gawat Darurat" },
  ];

  return (
    <div className="space-y-4">
      <CalcCard title="Pencarian Obat" icon="💊" color="cyan">
        <div className="space-y-3">
          <CalcInput
            label="Cari Obat (nama generik/brand)"
            value={query}
            onChange={(v) => setQuery(typeof v === "string" ? v : String(v))}
            type="text"
            placeholder="Contoh: paracetamol, amoxicillin..."
          />
          <CalcSelect
            label="Kategori"
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categoryOptions}
          />
          <CalcInput
            label="Berat Badan (kg)"
            unit="kg"
            value={autoWeight}
            onChange={(v) => setAutoWeight(typeof v === "string" ? parseFloat(v) || 0 : v)}
            min={0.5}
            step={0.5}
          />
          <InfoBox>
            Berat badan pasien saat ini: {weightKg} kg — dapat digunakan untuk auto-dosis
          </InfoBox>
        </div>
      </CalcCard>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Menampilkan {filtered.length} obat
        </p>
        <div className="grid gap-2">
          {filtered.map((drug) => (
            <DrugSearchCard
              key={drug.id}
              drug={drug}
              weight={autoWeight}
              onClick={() => onSelectDrug(drug)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Tidak ada obat ditemukan untuk pencarian ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DrugSearchCard({
  drug,
  weight,
  onClick,
}: {
  drug: DrugDefinition;
  weight: number;
  onClick: () => void;
}) {
  const categoryColors: Record<string, string> = {
    "Antibiotik": "bg-blue-500/10 border-blue-500/20 text-blue-400",
    "Analgesik/Antipiretik": "bg-purple-500/10 border-purple-500/20 text-purple-400",
    "Kardiovaskuler": "bg-red-500/10 border-red-500/20 text-red-400",
    "Respirasi": "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    "Gastrointestinal": "bg-green-500/10 border-green-500/20 text-green-400",
    "Endokrin": "bg-amber-500/10 border-amber-500/20 text-amber-400",
    "Neurologi": "bg-pink-500/10 border-pink-500/20 text-pink-400",
    "Hematologi": "bg-orange-500/10 border-orange-500/20 text-orange-400",
    "Gawat Darurat": "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    "Alergi/Imunologi": "bg-violet-500/10 border-violet-500/20 text-violet-400",
    "Nutrisi/Vitamin": "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    "Dermatologi/Topikal": "bg-teal-500/10 border-teal-500/20 text-teal-400",
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-border bg-card hover:bg-accent/50 p-3 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{drug.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            {drug.brandNames.slice(0, 3).join(", ")}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded border ${categoryColors[drug.category] || "bg-slate-500/10 border-slate-500/20"}`}
            >
              {drug.category}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {drug.subcategory}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] text-muted-foreground">{drug.pediatricDosing.length} dosis</p>
          {weight > 0 && drug.pediatricDosing[0] && (
            <DosePreview drug={drug} weight={weight} />
          )}
        </div>
      </div>
    </button>
  );
}

function DosePreview({ drug, weight }: { drug: DrugDefinition; weight: number }) {
  const firstDose = drug.pediatricDosing[0];
  const doseMatch = firstDose.dose.match(/(\d+(?:\.\d+)?)-?(\d+(?:\.\d+)?)?\s*(mg|mcg|unit)/);
  if (!doseMatch || !doseMatch[1]) return null;

  const lowDose = parseFloat(doseMatch[1]);
  const highDose = doseMatch[2] ? parseFloat(doseMatch[2]) : lowDose;
  const unit = doseMatch[3];

  const lowTotal = lowDose * weight;
  const highTotal = highDose * weight;

  return (
    <p className="text-[10px] text-cyan-400 font-mono">
      ≈ {lowTotal.toFixed(1)}-{highTotal.toFixed(1)} {unit}
    </p>
  );
}
