"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Search, FlaskConical, AlertTriangle, Droplets, Pill, Activity, ArrowLeft, ChevronDown, ChevronUp, BookOpen, Shield } from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────── */
interface DrugSummary {
  id: string; name: string; drug_class: string; quality_score: string; uses_preview?: string;
  is_pediatric_approved: boolean; neonatal_safe: boolean; is_discontinued: boolean;
  completeness_score?: number;
}

interface Indication {
  id: string; drug_id: string; indication: string; route: string;
  dose_per_kg: string | null; dose_unit: string; dose_frequency: string;
  max_single_dose: string | null; max_daily_dose: string | null; source_text: string | null;
}

interface DrugInteraction {
  id: string; drug_id: string; interacting_drug_name: string;
  severity: string; mechanism: string; clinical_effect: string;
}

interface DoseAdjustment {
  id: string; drug_id: string; adjustment_type: string;
  criteria: string; adjustment: string; age_group: string; source_text: string;
}

interface ClinicalContext {
  kids_list_risk: boolean; interaction_count: number; neonatal_safe: boolean;
  pediatric_approved: boolean; has_adjustments: boolean; contra_summary_length: number;
  requires_monitoring?: string;
}

interface DrugDetail {
  id: string; name: string; drug_class: string; is_pediatric_approved: boolean;
  neonatal_safe: boolean; is_discontinued: boolean; quality_score: string;
  completeness_score?: number; clinical_context?: ClinicalContext;
  dosing_summary: string; uses_summary: string; contraindications_summary: string;
  interactions_summary: string; pharmacokinetics_summary: string;
  dosing_raw: string; uses_raw: string; contraindications_raw: string;
  interactions_raw: string; pharmacokinetics_raw: string;
  dosing_formatted?: string; uses_formatted?: string;
  indications_structured: Indication[];
  interactions_structured: DrugInteraction[];
  dose_adjustments_structured: DoseAdjustment[];
  interactions_coverage: string; full_text: string;
  disclaimer: string;
}

/* ── API ──────────────────────────────────────────────────────────── */
const API_BASE = "/api/micromedex";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init, headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.text();
    try { throw new Error(JSON.parse(body).error || JSON.parse(body).detail || `API ${res.status}`); }
    catch { throw new Error(`API ${res.status}: ${body.slice(0, 200)}`); }
  }
  return res.json();
}

/* ── Main Component ────────────────────────────────────────────────── */
export function MicromedexClient() {
  const [view, setView] = useState<"search" | "detail">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DrugSummary[]>([]);
  const [selected, setSelected] = useState<DrugDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState<{ suggestions?: string[] } | null>(null);

  const [calcWeight, setCalcWeight] = useState(10);
  const [calcAge, setCalcAge] = useState(24);
  const [calcRoute, setCalcRoute] = useState("PO");
  const [calcIndication, setCalcIndication] = useState("");
  const [calcResult, setCalcResult] = useState<any>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    dosing: true, uses: true, contraindications: false, interactions: false,
    adjustments: false, pk: false, dosing_raw: false,
  });

  const toggleSection = (key: string) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    setLoading(true);
    apiFetch<{ results: DrugSummary[] }>("/search?q=&limit=20")
      .then(() => setResults([]))
      .catch((e: any) => setError(e.message || "Failed to load drug data"))
      .finally(() => setLoading(false));
  }, []);

  /* ── Search ── */
  const doSearch = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(""); setNotFound(null);
    try {
      const data = await apiFetch<{ results: DrugSummary[] }>(`/search?q=${encodeURIComponent(query)}&limit=30`);
      setResults(data.results);
    } catch (e: any) {
      setError(e.message || "Search failed");
      setResults([]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter") doSearch(); };

  /* ── Load monograph ── */
  const loadDrug = async (name: string) => {
    setLoading(true); setError(""); setNotFound(null);
    try {
      const drug = await apiFetch<DrugDetail>(`/drugs/${encodeURIComponent(name)}`);
      setSelected(drug);
      setView("detail");
    } catch (e: any) {
      setNotFound({ suggestions: [] });
    }
    setLoading(false);
  };

  /* ── Dosing calc ── */
  const doCalc = async () => {
    if (!selected || !calcWeight || calcWeight <= 0) return;
    setCalcLoading(true); setCalcResult(null);
    try {
      const result = await apiFetch<any>("/dosing", {
        method: "POST",
        body: JSON.stringify({
          drug_name: selected.name,
          weight_kg: calcWeight,
          age_months: calcAge || null,
          route: calcRoute,
          indication: calcIndication || null,
        }),
      });
      setCalcResult(result);
    } catch (e: any) { setCalcResult({ error: e.message || "Calculation failed" }); }
    setCalcLoading(false);
  };

  const goBack = () => { setView("search"); setSelected(null); setCalcResult(null); setNotFound(null); };

  /* ── Classes ── */
  const [classes, setClasses] = useState<{ class: string; count: number }[]>([]);
  useEffect(() => {
    apiFetch<{ results: DrugSummary[] }>("/search?q=antibiotic&limit=50")
      .then((data) => {
        const counts = new Map<string, number>();
        data.results.forEach((d) => counts.set(d.drug_class, (counts.get(d.drug_class) || 0) + 1));
        setClasses(Array.from(counts.entries()).map(([c, count]) => ({ class: c, count })));
      })
      .catch(() => {});
  }, []);

  /* ── Not Found View ── */
  if (view === "detail" && notFound) {
    return (
      <div className="space-y-4">
        <button onClick={goBack} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to search
        </button>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto" />
          <h2 className="text-lg font-semibold">Drug Not Found</h2>
          <p className="text-sm text-muted-foreground">Not in Micromedex 2026 database</p>
        </div>
      </div>
    );
  }

  /* ── Render: Search View ── */
  if (view === "search") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-neon" />
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Micromedex Drug Reference</h1>
            <p className="text-xs text-muted-foreground">Pediatric drug monographs — Micromedex 2026</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Search by Indonesian or English drug name..."
              className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neon/30 focus:border-neon/50" />
          </div>
          <button onClick={doSearch} disabled={loading || !query.trim()}
            className="rounded-xl px-5 py-3 bg-neon text-black text-sm font-semibold hover:opacity-85 transition-opacity disabled:opacity-40">
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-400">{error}</div>}

        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{results.length} results</p>
            <div className="grid gap-2">
              {results.map((drug) => (
                <button key={drug.id} onClick={() => loadDrug(drug.name)}
                  className="w-full text-left rounded-xl border border-border bg-card hover:bg-accent/50 p-4 transition-all hover:border-neon/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold">{drug.name}</p>
                        {drug.neonatal_safe && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/20">Neonatal Safe</span>}
                        <CompletenessBadge score={drug.completeness_score ?? Number(drug.quality_score)} />
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">{drug.drug_class}</span>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", drug.is_pediatric_approved ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400")}>
                          {drug.is_pediatric_approved ? "✓ Pediatric" : "⚠️ Off-label"}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {!query && classes.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Browse by Drug Class</p>
            <div className="flex flex-wrap gap-2">
              {classes.filter(c => c.count >= 5).slice(0, 20).map((c) => (
                <button key={c.class} onClick={() => { setQuery(c.class || ""); doSearch(); }}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  {c.class} <span className="text-neon/60">({c.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-muted-foreground">
          <strong className="text-amber-400">⚠️ Important:</strong> This tool is a drug reference based on Micromedex 2026. Always verify dosing with current clinical guidelines. Not for autonomous clinical decision-making.
        </div>
      </div>
    );
  }

  /* ── Render: Detail View ── */
  if (!selected) return null;
  const d = selected;

  return (
    <div className="space-y-4">
      <button onClick={goBack} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to search
      </button>

      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{d.name}</h1>
              {d.neonatal_safe && <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/30">Neonatal Safe</span>}
              {d.is_discontinued && <span className="text-xs px-2 py-0.5 rounded bg-red-500/15 text-red-400 font-medium border border-red-500/30">Discontinued</span>}
              <CompletenessBadge score={d.completeness_score ?? Number(d.quality_score)} />
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">{d.drug_class}</span>
              <span className={cn("text-xs px-2 py-0.5 rounded border font-medium", d.is_pediatric_approved ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400")}>
                {d.is_pediatric_approved ? "✓ Pediatric Approved" : "⚠️ Adult Drug"}
              </span>
              {d.clinical_context?.kids_list_risk && <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">⚠️ KIDs List Risk</span>}
              {d.clinical_context?.requires_monitoring && <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">🔬 {d.clinical_context.requires_monitoring}</span>}
              <span className="text-xs text-muted-foreground">{d.indications_structured?.length || 0} indications</span>
              <span className="text-xs text-muted-foreground">{d.interactions_structured?.length || 0} interactions</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {d.clinical_context && d.clinical_context.interaction_count > 0 && (
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-cyan-400">
              💊 {d.clinical_context.interaction_count} interaction(s) indexed — check before co-prescribing
            </div>
          )}

          <SectionCard icon={<Pill className="h-4 w-4" />} title="Clinical Uses / Indications" sectionKey="uses" defaultOpen={true} openSections={openSections} onToggle={toggleSection}>
            <StructuredIndicationsTable data={d.indications_structured} />
            {d.uses_formatted && <div className="mt-3"><h4 className="text-xs text-muted-foreground font-medium mb-1">Summary</h4><p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{d.uses_formatted}</p></div>}
          </SectionCard>

          <SectionCard icon={<FlaskConical className="h-4 w-4" />} title="Dosing" sectionKey="dosing" defaultOpen={true} openSections={openSections} onToggle={toggleSection}>
            {d.dosing_formatted && <div className="mb-3"><h4 className="text-xs text-muted-foreground font-medium mb-1">Summary</h4><p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{d.dosing_formatted}</p></div>}
            {d.dosing_raw && (
              <div className="mt-2">
                <button onClick={() => toggleSection("dosing_raw")} className="text-xs text-neon/70 hover:text-neon transition-colors flex items-center gap-1">
                  {openSections.dosing_raw ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />} Raw dosing text
                </button>
                {openSections.dosing_raw && <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed mt-2">{d.dosing_raw}</p>}
              </div>
            )}
          </SectionCard>

          <SectionCard icon={<Shield className="h-4 w-4" />} title="Contraindications & Precautions" sectionKey="contraindications" defaultOpen={false} openSections={openSections} onToggle={toggleSection}>
            {d.contraindications_summary ? <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{d.contraindications_summary}</p> : <p className="text-sm text-muted-foreground italic">No specific contraindications data available.</p>}
          </SectionCard>

          <SectionCard icon={<AlertTriangle className="h-4 w-4" />} title="Drug Interactions" sectionKey="interactions" defaultOpen={false} openSections={openSections} onToggle={toggleSection}>
            {d.interactions_structured && d.interactions_structured.length > 0 ? (
              <div className="space-y-2">
                {d.interactions_structured.map((ix, i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-center gap-2"><SeverityBadge severity={ix.severity} /><span className="text-sm font-medium">{ix.interacting_drug_name}</span></div>
                    {ix.mechanism && <p className="text-xs text-muted-foreground mt-1">{ix.mechanism}</p>}
                    {ix.clinical_effect && <p className="text-xs text-muted-foreground/70 mt-0.5">{ix.clinical_effect}</p>}
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground italic">No structured interaction data available.</p>}
            <div className="mt-3 text-xs text-amber-400/80">Coverage: {d.interactions_coverage}</div>
          </SectionCard>

          <SectionCard icon={<Droplets className="h-4 w-4" />} title="Dose Adjustments (Renal/Hepatic)" sectionKey="adjustments" defaultOpen={false} openSections={openSections} onToggle={toggleSection}>
            {d.dose_adjustments_structured && d.dose_adjustments_structured.length > 0 ? (
              <div className="space-y-2">
                {d.dose_adjustments_structured.map((adj, i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-center gap-2"><span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", adj.adjustment_type === "renal" ? "bg-amber-500/15 text-amber-400 border border-amber-500/20" : adj.adjustment_type === "hepatic" ? "bg-purple-500/15 text-purple-400 border border-purple-500/20" : "bg-blue-500/15 text-blue-400 border border-blue-500/20")}>{adj.adjustment_type}</span></div>
                    <p className="text-xs text-muted-foreground mt-1">{adj.criteria}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{adj.adjustment}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground italic">No dose adjustment data available.</p>}
          </SectionCard>

          <SectionCard icon={<Activity className="h-4 w-4" />} title="Pharmacokinetics" sectionKey="pk" defaultOpen={false} openSections={openSections} onToggle={toggleSection}>
            {d.pharmacokinetics_summary ? <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{d.pharmacokinetics_summary}</p> : <p className="text-sm text-muted-foreground italic">No pharmacokinetics data available.</p>}
          </SectionCard>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 sticky top-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><FlaskConical className="h-4 w-4 text-neon" /> Dosing Calculator</h3>
            <div className="space-y-3">
              <div className="space-y-1"><label className="text-[11px] text-muted-foreground font-medium">Weight (kg)</label><input type="number" value={calcWeight} onChange={(e) => setCalcWeight(parseFloat(e.target.value) || 0)} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-mono" min={0.1} step={0.1} /></div>
              <div className="space-y-1"><label className="text-[11px] text-muted-foreground font-medium">Age (months)</label><input type="number" value={calcAge} onChange={(e) => setCalcAge(parseFloat(e.target.value) || 0)} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-mono" min={0} max={240} /></div>
              <div className="space-y-1"><label className="text-[11px] text-muted-foreground font-medium">Route</label><select value={calcRoute} onChange={(e) => setCalcRoute(e.target.value)} className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm"><option value="PO">PO (Oral)</option><option value="IV">IV (Intravenous)</option><option value="IM">IM (Intramuscular)</option><option value="SC">SC (Subcutaneous)</option><option value="PR">PR (Rectal)</option><option value="TOP">TOP (Topical)</option><option value="INH">INH (Inhalation)</option></select></div>
              <div className="space-y-1"><label className="text-[11px] text-muted-foreground font-medium">Indication (optional)</label><input type="text" value={calcIndication} onChange={(e) => setCalcIndication(e.target.value)} placeholder="e.g. otitis media" className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm" /></div>
              <button onClick={doCalc} disabled={calcLoading || !calcWeight} className="w-full rounded-lg bg-neon text-black py-2.5 text-sm font-semibold hover:opacity-85 transition-opacity disabled:opacity-40">{calcLoading ? "Calculating..." : "Calculate Dose"}</button>
            </div>

            {calcResult && (
              <div className={cn("rounded-lg border p-3 space-y-2", calcResult.error ? "border-red-500/20 bg-red-500/5" : calcResult.calculated_dose ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5")}>
                {calcResult.error ? (
                  <p className="text-xs text-red-400">{calcResult.error}</p>
                ) : calcResult.calculated_dose ? (
                  <>
                    <div className="text-xl font-bold text-emerald-400">{calcResult.calculated_dose}</div>
                    {calcResult.dose_per_kg && <div className="text-xs text-muted-foreground">{calcResult.dose_per_kg}</div>}
                    {calcResult.frequency && <div className="text-xs text-muted-foreground">⏰ {calcResult.frequency}</div>}
                    {calcResult.max_single_dose && <div className="text-xs text-muted-foreground">⬆️ Max single: {calcResult.max_single_dose}</div>}
                    {calcResult.max_daily_dose && <div className="text-xs text-muted-foreground">📈 Max daily: {calcResult.max_daily_dose}</div>}
                    {calcResult.warnings?.length > 0 && <div className="text-xs text-amber-400 space-y-0.5">{calcResult.warnings.map((w: string, i: number) => <p key={i}>{w}</p>)}</div>}
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground italic">Structured dosing not available for this drug/route/indication.</div>
                )}
                {calcResult?.source_text && <details className="mt-2"><summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">Source text</summary><p className="text-[10px] text-muted-foreground/70 mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap">{calcResult.source_text}</p></details>}
              </div>
            )}
            <p className="text-[10px] text-amber-400/60">⚠️ Always verify with current clinical guidelines.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompletenessBadge({ score }: { score: number }) {
  return <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-mono font-bold", score >= 80 ? "bg-green-500/10 border-green-500/20 text-green-400" : score >= 50 ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-red-500/10 border-red-500/20 text-red-400")}>Data: {score}%</span>;
}

function SectionCard({ icon, title, sectionKey, defaultOpen, openSections, onToggle, children }: { icon: React.ReactNode; title: string; sectionKey: string; defaultOpen: boolean; openSections: Record<string, boolean>; onToggle: (key: string) => void; children: React.ReactNode }) {
  const isOpen = openSections[sectionKey] ?? defaultOpen;
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button onClick={() => onToggle(sectionKey)} className="w-full flex items-center justify-between p-4 hover:bg-accent/30 transition-colors text-left">
        <div className="flex items-center gap-2"><span className="text-neon">{icon}</span><h3 className="text-sm font-semibold">{title}</h3></div>
        {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function StructuredIndicationsTable({ data }: { data: Indication[] }) {
  if (!data || data.length === 0) return <p className="text-sm text-muted-foreground italic">No structured indication data.</p>;
  return (
    <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-border"><th className="text-left py-2 pr-3 text-muted-foreground font-medium">Indication</th><th className="text-left py-2 pr-3 text-muted-foreground font-medium">Route</th><th className="text-left py-2 pr-3 text-muted-foreground font-medium">Dose</th><th className="text-left py-2 pr-3 text-muted-foreground font-medium">Frequency</th><th className="text-left py-2 text-muted-foreground font-medium">Max</th></tr></thead><tbody>{data.map((ind, i) => <tr key={i} className="border-b border-border/50 last:border-0"><td className="py-2 pr-3 font-medium">{ind.indication || "General"}</td><td className="py-2 pr-3"><span className="px-1.5 py-0.5 rounded bg-muted">{ind.route || "—"}</span></td><td className="py-2 pr-3 font-mono">{ind.dose_per_kg ? `${ind.dose_per_kg} ${ind.dose_unit || 'mg'}/kg` : "—"}</td><td className="py-2 pr-3 font-mono">{ind.dose_frequency || "—"}</td><td className="py-2 font-mono">{ind.max_single_dose ? `${ind.max_single_dose} ${ind.dose_unit || 'mg'}` : "—"}</td></tr>)}</tbody></table></div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const c: Record<string, string> = { contraindicated: "bg-red-500/15 border-red-500/30 text-red-400", severe: "bg-red-500/15 border-red-500/30 text-red-400", high: "bg-orange-500/15 border-orange-500/30 text-orange-400", moderate: "bg-amber-500/15 border-amber-500/30 text-amber-400", mild: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400", unknown: "bg-muted text-muted-foreground border-border" };
  const l: Record<string, string> = { contraindicated: "Contraindicated", high: "High", moderate: "Moderate", mild: "Mild", severe: "Severe" };
  return <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", c[severity.toLowerCase()] || c.unknown)}>{l[severity.toLowerCase()] || severity}</span>;
}