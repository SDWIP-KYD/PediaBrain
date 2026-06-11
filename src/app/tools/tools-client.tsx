"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Calculator, ExternalLink } from "lucide-react";
import { PatientPanel } from "./components/patient-panel";

const legacyTools = [
  { title: "Neonatologi (HTML)", file: "/tools/neonatologi-calculator.html" },
  { title: "PICU (HTML)", file: "/tools/picu-calculator.html" },
  { title: "Nephrology (HTML)", file: "/tools/nephrology-calculator.html" },
  { title: "Nutrition (HTML)", file: "/tools/nutrition-calculator.html" },
  { title: "Catatan Klinis (HTML)", file: "/tools/Catatan-Klinis-Anak.html" },
  { title: "Referensi Obat (HTML)", file: "/tools/referensi-obat-anak.html" },
  { title: "Sepsis 2026 (HTML)", file: "/tools/sepsis-anak-2026.html" },
  { title: "Catatan Gizi (HTML)", file: "/tools/catatan-gizi.html" },
];

const categories = [
  {
    id: "neonatologi",
    title: "Neonatologi",
    subtitle: "NICU tools: obat, cairan, ventilator, skor, AGD",
    icon: "👶",
    href: "/tools/neonatologi",
    color: "cyan",
    count: 21,
  },
  {
    id: "picu",
    title: "PICU",
    subtitle: "Resusitasi, ventilator, hemodinamik, sedasi",
    icon: "🚨",
    href: "/tools/picu",
    color: "red",
    count: 26,
  },
  {
    id: "nephrology",
    title: "Nefrologi",
    subtitle: "GFR, elektrolit, AKI, dialisis, transplantasi",
    icon: "🫘",
    href: "/tools/nephro",
    color: "green",
    count: 21,
  },
  {
    id: "nutrition",
    title: "Gizi",
    subtitle: "BMI, kalori, makronutrien, mikronutrien, feeding",
    icon: "🍼",
    href: "/tools/gizi",
    color: "orange",
    count: 16,
  },
  {
    id: "catatan-klinis",
    title: "Catatan Klinis",
    subtitle: "SOAP, resume, rujukan, pemeriksaan fisik, prosedur, surat",
    icon: "📋",
    href: "/tools/catatan-klinis",
    color: "purple",
    count: 13,
  },
  {
    id: "micromedex",
    title: "Micromedex Reference",
    subtitle: "953+ pediatric drug monographs — dosing, interactions, PK, neonatal safety",
    icon: "📚",
    href: "/tools/micromedex",
    color: "pink",
    count: 953,
  },
  {
    id: "referensi-obat",
    title: "Quick Drug Calc",
    subtitle: "50 obat pediatric + auto-dose calculator",
    icon: "💊",
    href: "/tools/referensi-obat",
    color: "purple",
    count: 50,
  },
  {
    id: "sepsis",
    title: "Sepsis 2026",
    subtitle: "SSC pediatric sepsis guidelines",
    icon: "🦠",
    href: "/tools/sepsis",
    color: "yellow",
    count: 1,
  },
  {
    id: "catatan-gizi",
    title: "Catatan Gizi",
    subtitle: "Nutrition notes & growth charts",
    icon: "📊",
    href: "/tools/catatan-gizi",
    color: "teal",
    count: 8,
  },
];

const colorMap: Record<string, string> = {
  cyan: "border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10",
  red: "border-red-500/20 bg-red-500/5 hover:bg-red-500/10",
  green: "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10",
  orange: "border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10",
  purple: "border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10",
  pink: "border-pink-500/20 bg-pink-500/5 hover:bg-pink-500/10",
  yellow: "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10",
  teal: "border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10",
};

const activeColorMap: Record<string, string> = {
  cyan: "border-cyan-500/40 bg-cyan-500/15",
  red: "border-red-500/40 bg-red-500/15",
  green: "border-emerald-500/40 bg-emerald-500/15",
  orange: "border-orange-500/40 bg-orange-500/15",
  purple: "border-purple-500/40 bg-purple-500/15",
  pink: "border-pink-500/40 bg-pink-500/15",
  yellow: "border-amber-500/40 bg-amber-500/15",
  teal: "border-teal-500/40 bg-teal-500/15",
};

export function ToolsClient() {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-neon" />
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Clinical Tools</h1>
          <p className="text-xs text-muted-foreground">Kalkulator dan referensi klinis pediatric</p>
        </div>
      </div>

      <PatientPanel />

      {/* Category grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => {
          const isActive = pathname === cat.href || pathname.startsWith(cat.href + "/");

          return (
            <Link
              key={cat.id}
              href={cat.href}
              className={cn(
                "rounded-xl border p-4 transition-all",
                isActive ? activeColorMap[cat.color] : colorMap[cat.color]
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{cat.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{cat.subtitle}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-2">{cat.count} tools</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {/* Legacy HTML tools for crosschecking */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground">Versi HTML (Crosscheck)</p>
        <div className="flex flex-wrap gap-2">
          {legacyTools.map((t) => (
            <a
              key={t.file}
              href={t.file}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              {t.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
