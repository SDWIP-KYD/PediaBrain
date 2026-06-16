"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { divisionData } from "./division-data";
import { calculatorRegistry, getAllCalculatorCategories } from "./calculator-registry";
import { SectionAccordion } from "./components/section-renderer";
import {
  GIRCalc,
  CairanRumatanCalc,
  IWLCalc,
  BicnatCalc,
  PRCCalc,
  ANCCalc,
  MentzerCalc,
  VasoCalc,
  NikardipinCalc,
  MAPCalc,
  RRCalc,
  EpiAnafilaksisCalc,
  PCTParacetamolCalc,
  ETTCalc,
} from "./components/calculators";

const calcComponents: Record<string, React.FC> = {
  gir: GIRCalc,
  rumatan: CairanRumatanCalc,
  iwl: IWLCalc,
  bicnat: BicnatCalc,
  prc: PRCCalc,
  anc: ANCCalc,
  mentzer: MentzerCalc,
  vaso: VasoCalc,
  nikardipin: NikardipinCalc,
  map: MAPCalc,
  rr: RRCalc,
  epi: EpiAnafilaksisCalc,
  pct: PCTParacetamolCalc,
  ett: ETTCalc,
};

type View = "home" | "division" | "calc-list" | "calc" | "search";

function buildSearchIndex() {
  const index: { divId: string; divName: string; sectionIdx: number; title: string; body: string }[] = [];
  divisionData.forEach((d) => {
    d.sections.forEach((s, si) => {
      const body = s.blocks
        .map((b) => {
          if (b.sub) return b.sub;
          if (b.p) return b.p;
          if (b.note) return b.note;
          if (b.formula) return b.formula;
          if (b.warn) return b.warn;
          if (b.list) return b.list.join(" ");
          if (b.table) return b.table.head.join(" ") + " " + b.table.rows.map((r) => r.join(" ")).join(" ");
          return "";
        })
        .join(" ");
      index.push({ divId: d.id, divName: d.name, sectionIdx: si, title: s.title, body });
    });
  });
  return index;
}

const searchIndex = buildSearchIndex();

export function CatatanKlinisClient() {
  const [view, setView] = useState<View>("home");
  const [activeDivision, setActiveDivision] = useState<string | null>(null);
  const [activeCalc, setActiveCalc] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    return searchIndex
      .map((it) => {
        const hay = (it.title + " " + it.divName + " " + it.body).toLowerCase();
        let score = 0;
        terms.forEach((w) => {
          if (it.title.toLowerCase().includes(w)) score += 5;
          else if (hay.includes(w)) score += 1;
        });
        return { ...it, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 40);
  }, [searchQuery]);

  const categories = useMemo(() => getAllCalculatorCategories(), []);

  const highlightText = (text: string, terms: string[]) => {
    // Escape HTML entities first to prevent XSS
    let result = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
    terms.forEach((w) => {
      if (w.length < 2) return;
      const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(`(${escaped})`, "ig"), "<mark>$1</mark>");
    });
    return result;
  };

  const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);

  function goHome() {
    setView("home");
    setActiveDivision(null);
    setActiveCalc(null);
    setSearchQuery("");
  }

  function goDivision(id: string, sectionIdx?: number) {
    setView("division");
    setActiveDivision(id);
    setActiveCalc(null);
    setSearchQuery("");
    setOpenSection(sectionIdx ?? 0);
  }

  function goCalcList() {
    setView("calc-list");
    setActiveCalc(null);
    setSearchQuery("");
  }

  function goCalc(id: string) {
    setView("calc");
    setActiveCalc(id);
    setSearchQuery("");
  }

  const division = activeDivision ? divisionData.find((d) => d.id === activeDivision) : null;
  const calc = activeCalc ? calculatorRegistry.find((c) => c.id === activeCalc) : null;
  const CalcComponent = activeCalc ? calcComponents[activeCalc] : null;

  if (view === "search" && searchQuery.length >= 2) {
    return (
      <div className="space-y-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.length >= 2) setView("search");
            }}
            placeholder="Cari obat, rumus, kondisi..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-neon/30"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                goHome();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{searchResults.length} hasil untuk &ldquo;{searchQuery}&rdquo;</p>
        {searchResults.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Tidak ada hasil untuk &ldquo;{searchQuery}&rdquo;.
          </div>
        )}
        {searchResults.map((r, i) => (
          <button
            key={i}
            onClick={() => goDivision(r.divId, r.sectionIdx)}
            className="w-full text-left bg-card border border-border rounded-xl p-3 hover:border-neon/50 transition-colors shadow-sm"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-neon">{r.divName}</p>
            <p className="text-sm font-semibold text-foreground mt-0.5" dangerouslySetInnerHTML={{ __html: highlightText(r.title, terms) }} />
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2" dangerouslySetInnerHTML={{ __html: highlightText(r.body.slice(0, 140) + "…", terms) }} />
          </button>
        ))}
      </div>
    );
  }

  if (view === "calc" && CalcComponent && calc) {
    return (
      <div className="space-y-3">
        <button onClick={goCalcList} className="inline-flex items-center gap-1.5 text-neon text-sm font-semibold">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Semua kalkulator
        </button>
        <CalcComponent />
      </div>
    );
  }

  if (view === "calc-list") {
    return (
      <div className="space-y-3">
        <button onClick={goHome} className="inline-flex items-center gap-1.5 text-neon text-sm font-semibold">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Beranda
        </button>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-neon mb-1">Alat Hitung</p>
          <h2 className="text-xl font-bold text-foreground">Kalkulator</h2>
          <p className="text-xs text-muted-foreground">Masukkan nilai, hasil tampil otomatis.</p>
        </div>
        {categories.map((cat) => (
          <div key={cat}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-4 mb-2">{cat}</p>
            <div className="space-y-2">
              {calculatorRegistry
                .filter((c) => c.category === cat)
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => goCalc(c.id)}
                    className="w-full flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-neon/50 transition-colors shadow-sm text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-neon/10 flex items-center justify-center text-neon font-bold text-sm shrink-0">
                      {c.id.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.description}</p>
                    </div>
                    <svg className="w-4 h-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (view === "division" && division) {
    const idx = divisionData.indexOf(division) + 1;
    return (
      <div className="space-y-3">
        <button onClick={goHome} className="inline-flex items-center gap-1.5 text-neon text-sm font-semibold">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Beranda
        </button>
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-white bg-neon px-2.5 py-0.5 rounded-full">
            Divisi {idx < 10 ? "0" : ""}{idx}
          </span>
          <h2 className="text-xl font-bold text-foreground mt-2">{division.name}</h2>
          <p className="text-xs text-muted-foreground">{division.full}</p>
        </div>
        <div className="space-y-2">
          {division.sections.map((s, i) => (
            <SectionAccordion
              key={i}
              title={s.title}
              blocks={s.blocks}
              defaultOpen={i === openSection}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Halo, Dokter 👋</h2>
        <p className="text-xs text-muted-foreground">Pilih divisi atau cari catatan &amp; rumus dengan cepat.</p>
      </div>

      <button
        onClick={goCalcList}
        className="w-full flex items-center gap-3 bg-gradient-to-r from-navy to-blue text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <path d="M8 6h8M8 10h2M14 10h2M8 14h2M14 14h2M8 18h2M14 18h2" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold">Kalkulator Bedside</p>
          <p className="text-xs text-white/80">GIR, transfusi, vasoaktif, dosis &amp; lainnya</p>
        </div>
        <svg className="w-5 h-5 text-white/80 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      <p className="text-[11px] font-bold uppercase tracking-wider text-neon">13 Divisi</p>

      <div className="grid grid-cols-2 gap-2.5">
        {divisionData.map((d, i) => (
          <button
            key={d.id}
            onClick={() => goDivision(d.id)}
            className="relative bg-card border border-border rounded-xl p-3 text-left hover:border-neon/50 hover:shadow-md transition-all shadow-sm overflow-hidden"
          >
            <span className="absolute top-2 right-3 font-serif text-2xl font-bold text-muted/30">
              {i + 1 < 10 ? "0" : ""}{i + 1}
            </span>
            <div className="w-8 h-8 rounded-lg bg-neon/10 flex items-center justify-center text-lg mb-2">
              {d.icon}
            </div>
            <p className="text-sm font-bold text-foreground">{d.name}</p>
            <p className="text-[11px] text-muted-foreground">{d.full}</p>
            <p className="text-[10px] text-neon font-semibold mt-1">{d.sections.length} topik</p>
          </button>
        ))}
      </div>
    </div>
  );
}
