"use client";

import { useState, useRef } from "react";
import { Calculator, ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  {
    id: "neonatologi",
    title: "Neonatologi",
    description: "NICU tools: drugs, fluids, ventilator, scores, ABG, nutrition",
    file: "/tools/neonatologi-calculator.html",
  },
  {
    id: "catatan-klinis",
    title: "Catatan Klinis",
    description: "Pediatric clinical reference: BSID, growth, drug doses",
    file: "/tools/Catatan-Klinis-Anak.html",
  },
  {
    id: "referensi-obat",
    title: "Referensi Obat",
    description: "Pediatric drug reference: dose calculator, emergency drugs, latin abbreviations",
    file: "/tools/referensi-obat-anak.html",
  },
  {
    id: "sepsis-2026",
    title: "Sepsis 2026",
    description: "SSC pediatric sepsis guidelines 2026",
    file: "/tools/sepsis-anak-2026.html",
  },
  {
    id: "picu",
    title: "PICU",
    description: "PICU calculator: resuscitation, ventilator, hemodynamics, sedation",
    file: "/tools/picu-calculator.html",
  },
  {
    id: "catatan-gizi",
    title: "Catatan Gizi",
    description: "Nutrition notes: malnutrition, milk, growth charts, TPN, formulas",
    file: "/tools/catatan-gizi.html",
  },
  {
    id: "nutrition",
    title: "Nutrition",
    description: "Nutrition calculator: BMI, calorie, macro, fluid, refeeding",
    file: "/tools/nutrition-calculator.html",
  },
  {
    id: "nephrology",
    title: "Nephrology",
    description: "Pediatric nephrology: GFR, electrolytes, AKI, hypertension, dialysis",
    file: "/tools/nephrology-calculator.html",
  },
];

export function ToolsClient() {
  const [activeId, setActiveId] = useState(tools[0].id);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const activeTool = tools.find((t) => t.id === activeId) ?? tools[0];

  return (
    <div className="space-y-3 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-neon" />
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Clinical Tools
            </h1>
            <p className="text-xs text-muted-foreground">
              Kalkulator dan referensi klinis pediatric
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
            title="Reload"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reload</span>
          </button>
          <a
            href={activeTool.file}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neon/30 bg-neon/10 px-3 py-1.5 text-xs font-medium text-neon hover:bg-neon/20 transition-colors"
            title="Buka di tab baru"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Buka Tab Baru</span>
          </a>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 min-w-max pb-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveId(tool.id)}
              className={cn(
                "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                activeId === tool.id
                  ? "bg-neon/10 border-neon/30 text-neon"
                  : "bg-card border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {tool.title}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-muted/30">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{activeTool.title}</p>
            <p className="text-[11px] text-muted-foreground truncate">
              {activeTool.description}
            </p>
          </div>
        </div>

        <iframe
          key={`${activeId}-${reloadKey}`}
          ref={iframeRef}
          src={activeTool.file}
          title={activeTool.title}
          className="w-full border-0"
          style={{ height: "calc(100vh - 250px)", minHeight: "400px" }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
