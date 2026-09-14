"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Stethoscope,
  Loader2,
  RefreshCw,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// Matches SIRS /api/cppt response format
type CpptVisit = {
  tanggal: string;
  kunjungan: string;
  penulis: string;       // "dr. X (Sp.A)" — DPJP + spesialis
  subjektif: string;
  objektif: string;
  assesment: string;
  terapi: string;
  planning: string;
};

type CpptResponse = {
  ok: boolean;
  error?: string;
  total?: number;
  cppt?: CpptVisit[];
};

type DpjpAccount = { i: number; label: string };

const DPJP_STORAGE_KEY = "pediabrain-cppt-dpjp";

function loadStoredDpjp(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DPJP_STORAGE_KEY);
    if (raw === null) return null;
    const n = parseInt(raw, 10);
    return Number.isNaN(n) ? null : n;
  } catch {
    return null;
  }
}

export function CpptSection({ norm }: { norm: string }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<CpptVisit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<DpjpAccount[]>([]);
  const [dpjp, setDpjp] = useState<number | null>(null);
  const [filterPenulis, setFilterPenulis] = useState<string>("all");

  const loadedRef = useRef(false);

  const fetchCppt = useCallback(
    async (idx: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/cppt/${norm}?dpjp=${idx}`, {
          cache: "no-store",
        });
        const json: CpptResponse = await res.json();
        if (json.ok) {
          setData(json.cppt || []);
        } else {
          setData(null);
          setError(json.error || "Tidak ada data CPPT");
        }
      } catch {
        setData(null);
        setError("Gagal terhubung ke server");
      } finally {
        setLoading(false);
      }
    },
    [norm]
  );

  async function ensureAccountsAndFetch(): Promise<number | null> {
    if (dpjp !== null) {
      await fetchCppt(dpjp);
      return dpjp;
    }
    let accs = accounts;
    if (!accs.length) {
      try {
        const res = await fetch("/api/dpjp", { cache: "no-store" });
        const json = await res.json();
        if (json.ok && Array.isArray(json.accounts)) accs = json.accounts;
      } catch {
        // fall through
      }
    }
    if (!accs.length) {
      setError("Daftar DPJP tidak dapat dimuat dari SIRS");
      return null;
    }
    setAccounts(accs);
    const stored = loadStoredDpjp();
    const initial =
      stored !== null && accs.some((a) => a.i === stored) ? stored : accs[0].i;
    setDpjp(initial);
    await fetchCppt(initial);
    return initial;
  }

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && !loadedRef.current) {
      loadedRef.current = true;
      void ensureAccountsAndFetch();
    }
  }

  useEffect(() => {
    loadedRef.current = false;
     
  }, [norm]);

  function handleDpjpChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const idx = parseInt(e.target.value, 10);
    if (Number.isNaN(idx)) return;
    setDpjp(idx);
    try {
      window.localStorage.setItem(DPJP_STORAGE_KEY, String(idx));
    } catch {
      // storage unavailable — selection just won't persist
    }
    setFilterPenulis("all");
    void fetchCppt(idx);
  }

  const penulisOptions = useMemo(() => {
    if (!data) return [];
    const counts = new Map<string, number>();
    for (const c of data) {
      counts.set(c.penulis, (counts.get(c.penulis) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filterPenulis === "all") return data;
    return data.filter((c) => c.penulis === filterPenulis);
  }, [data, filterPenulis]);

  return (
    <Card className="py-0 overflow-hidden">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-accent/30 transition-colors"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span className="text-sm font-medium flex items-center gap-2 flex-1 min-w-0">
          <Stethoscope className="h-3.5 w-3.5 text-neon shrink-0" />
          Riwayat CPPT
        </span>
        {loading && (
          <Badge variant="outline" className="text-[9px] shrink-0 flex items-center gap-1">
            <Loader2 className="h-2.5 w-2.5 animate-spin" /> memuat…
          </Badge>
        )}
        {!loading && data !== null && (
          <Badge variant="secondary" className="text-[9px] shrink-0">
            {filtered.length}
            {filterPenulis !== "all" && data.length !== filtered.length
              ? ` dari ${data.length}`
              : ""}{" "}
            kunjungan
          </Badge>
        )}
        {!loading && error && (
          <Badge variant="outline" className="text-[9px] shrink-0 border-destructive/40 text-destructive">
            gagal
          </Badge>
        )}
      </button>

      {open && (
        <CardContent className="pt-0 pb-4 space-y-3 border-t border-border/50">
          {/* DPJP + refresh row */}
          <div className="flex items-center gap-2 flex-wrap pt-2">
            <label className="text-xs text-muted-foreground" htmlFor="cppt-dpjp">
              DPJP
            </label>
            <select
              id="cppt-dpjp"
              className="h-7 rounded-md border border-border bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-neon"
              value={dpjp ?? ""}
              onChange={handleDpjpChange}
              disabled={loading || !accounts.length}
            >
              {!accounts.length && <option value="">Memuat akun...</option>}
              {accounts.map((a) => (
                <option key={a.i} value={a.i}>
                  {a.label}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 ml-auto"
              onClick={() => dpjp !== null && fetchCppt(dpjp)}
              disabled={loading || dpjp === null}
              title="Segarkan data CPPT dari SIMRS"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Segarkan
            </Button>
          </div>

          {loading && !data && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-neon" />
              <span className="ml-2 text-sm text-muted-foreground">
                Mengambil CPPT dari SIMRS...
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Catatan: DPJP hanya dapat melihat CPPT pasien yang menjadi
                tanggung jawabnya di SIMRS. Coba pilih DPJP lain.
              </p>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Filter penulis — like SIRS CPPT page */}
              <div className="flex items-center gap-2 flex-wrap rounded-lg bg-muted/30 border border-border/50 px-3 py-2">
                <label
                  className="text-xs text-muted-foreground"
                  htmlFor="cpptFilter"
                >
                  Filter penulis:
                </label>
                <select
                  id="cpptFilter"
                  className="h-7 rounded-md border border-border bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-neon"
                  value={filterPenulis}
                  onChange={(e) => setFilterPenulis(e.target.value)}
                >
                  <option value="all">
                    Semua ({data.length})
                  </option>
                  {penulisOptions.map(([p, n]) => (
                    <option key={p} value={p}>
                      {p} ({n})
                    </option>
                  ))}
                </select>
              </div>

              {filtered.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <FileText className="h-4 w-4" />
                  <span>Tidak ada CPPT dari penulis ini</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((visit, i) => (
                    <CpptVisitCard key={`${visit.kunjungan}-${i}`} visit={visit} />
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}


function CpptVisitCard({ visit }: { visit: CpptVisit }) {
  const [expanded, setExpanded] = useState(false);
  const hasContent =
    visit.subjektif || visit.objektif || visit.assesment || visit.terapi || visit.planning;

  return (
    <div className="rounded-lg border border-border bg-card/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent/20 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <Badge variant="secondary" className="text-[10px] font-mono shrink-0">
          {visit.tanggal?.slice(0, 16)}
        </Badge>
        <span className="text-[11px] text-muted-foreground truncate min-w-0">
          {visit.penulis}
        </span>
        {!expanded && visit.assesment && (
          <span className="text-[11px] text-foreground/80 truncate hidden sm:block">
            — {visit.assesment.split("\n").find(Boolean)}
          </span>
        )}
      </button>
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-border/50 pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px] font-mono">
              {visit.kunjungan}
            </Badge>
          </div>
          {visit.subjektif && (
            <SoapSection label="Subjektif" content={visit.subjektif} />
          )}
          {visit.objektif && (
            <SoapSection label="Objektif" content={visit.objektif} />
          )}
          {visit.assesment && (
            <SoapSection label="Assesment" content={visit.assesment} />
          )}
          {visit.terapi && (
            <SoapSection label="Terapi" content={visit.terapi} />
          )}
          {visit.planning && (
            <SoapSection label="Planning" content={visit.planning} />
          )}
          {!hasContent && (
            <p className="text-xs text-muted-foreground">(catatan kosong)</p>
          )}
        </div>
      )}
    </div>
  );
}

function SoapSection({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-neon uppercase tracking-wider">
        {label}
      </p>
      <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed mt-0.5">
        {content}
      </p>
    </div>
  );
}
