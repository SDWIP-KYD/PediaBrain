"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { drugSubtabs } from "./calculator-registry";
import { DrugDetail } from "./components/drug-detail";
import { EquipmentCalc } from "./components/equipment-calc";
import { LatinRef } from "./components/latin-ref";
import { drugs, type DrugDefinition, drugCategories } from "./data/drugs";

export function ReferensiObatClient() {
  const [activeTab, setActiveTab] = useState<string>(drugSubtabs[0]);
  const [selectedDrug, setSelectedDrug] = useState<DrugDefinition | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [customWeight, setCustomWeight] = useState(0);

  const filtered = drugs.filter((d) => {
    const matchesQuery =
      !searchQuery.trim() ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.brandNames.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.subcategory.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTab = true;
    if (activeTab === "Antibiotik") matchesTab = d.category === "Antibiotik";
    else if (activeTab === "Analgesik") matchesTab = d.category === "Analgesik/Antipiretik";
    else if (activeTab === "Kardiovaskuler") matchesTab = d.category === "Kardiovaskuler";
    else if (activeTab === "Lainnya")
      matchesTab = !["Antibiotik", "Analgesik/Antipiretik", "Kardiovaskuler"].includes(d.category);

    const matchesCategory = selectedCategory === "all" || d.category === selectedCategory;

    return matchesQuery && matchesTab && matchesCategory;
  });

  if (selectedDrug) {
    return <DrugDetail drug={selectedDrug} onBack={() => setSelectedDrug(null)} />;
  }

  if (activeTab === "Alat & Referensi") {
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 min-w-max pb-1">
            {drugSubtabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5",
                  activeTab === tab
                    ? "bg-neon/10 border-neon/30 text-neon"
                    : "bg-card border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <EquipmentCalc />
        <LatinRef />
      </div>
    );
  }

  const categoryOptions = [
    { value: "all", label: "Semua Kategori" },
    ...drugCategories.map((c) => ({ value: c, label: c })),
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 min-w-max pb-1">
          {drugSubtabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5",
                activeTab === tab
                  ? "bg-neon/10 border-neon/30 text-neon"
                  : "bg-card border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Cari Obat
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama obat atau brand..."
              className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neon/30 focus:border-neon/50"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Filter Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neon/30 focus:border-neon/50"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Berat Badan Anak (kg)
          </label>
          <input
            type="number"
            value={customWeight || ""}
            onChange={(e) => setCustomWeight(parseFloat(e.target.value) || 0)}
            placeholder="Masukkan berat badan untuk auto-dosis"
            min={0.5}
            step={0.5}
            className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neon/30 focus:border-neon/50"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Menampilkan {filtered.length} obat
      </p>

      <div className="grid gap-2">
        {filtered.map((drug) => (
          <DrugListItem
            key={drug.id}
            drug={drug}
            weight={customWeight}
            onClick={() => setSelectedDrug(drug)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Tidak ada obat ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}

function DrugListItem({
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
          <p className="text-[10px] text-muted-foreground">{drug.pediatricDosing.length} indikasi</p>
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
