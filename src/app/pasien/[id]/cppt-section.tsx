"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Stethoscope,
  Loader2,
  RefreshCw,
  AlertCircle,
  FileText,
  UserRoundSearch,
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

const STORAGE_KEY = "pediabrain-cppt-dpjp";

function loadStoredDpjp(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const n = parseInt(raw, 10);
    return Number.isNaN(n) ? null : n;
  } catch {
    return null;
  }
}

export function CpptSection({ norm }: { norm: string }) {
  const [data, setData] = useState<CpptVisit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<DpjpAccount[]>([]);
  const [dpjp, setDpjp] = useState<number | null>(null);
  const [dpjpLoading, setDpjpLoading] = useState(true);

  async function fetchCppt(idx: number) {
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
  }

  const handleDpjpChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10);
    if (Number.isNaN(idx)) return;
    setDpjp(idx);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(idx));
    } catch {
      // storage unavailable — selection just won't persist
    }
    fetchCppt(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [norm]);

  useEffect(() => {
    let alive = true;
    async function init() {
      let accs: DpjpAccount[] = [];
      try {
        const res = await fetch("/api/dpjp", { cache: "no-store" });
        const json = await res.json();
        if (json.ok && Array.isArray(json.accounts)) accs = json.accounts;
      } catch {
        // leave empty → picker shows fallback
      }
      if (!alive) return;
      setDpjpLoading(false);
      if (!accs.length) return;
      setAccounts(accs);
      const stored = loadStoredDpjp();
      const initial =
        stored !== null && accs.some((a) => a.i === stored)
          ? stored
          : accs[0].i;
      setDpjp(initial);
      fetchCppt(initial);
    }
    init();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [norm]);

  const picker = (
    <div className="flex items-center gap-2">
      <label className="text-xs text-muted-foreground" htmlFor="cppt-dpjp">
        DPJP
      </label>
      <select
        id="cppt-dpjp"
        className="h-7 rounded-md border border-border bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-neon"
        value={dpjp ?? ""}
        onChange={handleDpjpChange}
        disabled={dpjpLoading || !accounts.length}
      >
        {dpjpLoading && <option value="">Memuat akun...</option>}
        {!dpjpLoading && !accounts.length && (
          <option value="">DPJP tidak tersedia</option>
        )}
        {accounts.map((a) => (
          <option key={a.i} value={a.i}>
            {a.label}
          </option>
        ))}
      </select>
    </div>
  );

  if (dpjpLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-neon" />
          <span className="ml-2 text-sm text-muted-foreground">
            Memuat daftar DPJP...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (!accounts.length) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Daftar DPJP tidak dapat dimuat dari SIRS</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 gap-1"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-3 w-3" />
            Coba lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Stethoscope className="h-3.5 w-3.5 text-neon" />
            Riwayat CPPT
          </CardTitle>
          {picker}
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-neon" />
          <span className="ml-2 text-sm text-muted-foreground">
            Mengambil CPPT dari SIMRS...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Stethoscope className="h-3.5 w-3.5 text-neon" />
            Riwayat CPPT
          </CardTitle>
          {picker}
        </CardHeader>
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {error.includes("Sesi") ? (
              <UserRoundSearch className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span>{error}</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Catatan: DPJP hanya dapat melihat CPPT pasien yang menjadi
            tanggung jawabnya di SIMRS.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 gap-1"
            onClick={() => dpjp !== null && fetchCppt(dpjp)}
          >
            <RefreshCw className="h-3 w-3" />
            Coba lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Stethoscope className="h-3.5 w-3.5 text-neon" />
            Riwayat CPPT
          </CardTitle>
          {picker}
        </CardHeader>
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Belum ada catatan CPPT untuk pasien ini pada DPJP terpilih</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2 flex-wrap">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Stethoscope className="h-3.5 w-3.5 text-neon" />
          Riwayat CPPT ({data.length} kunjungan)
        </CardTitle>
        <div className="flex items-center gap-2">
          {picker}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs gap-1"
            onClick={() => dpjp !== null && fetchCppt(dpjp)}
            title="Segarkan data CPPT"
          >
            <RefreshCw className="h-3 w-3" />
            Segarkan
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((visit, i) => (
          <CpptVisitCard key={i} visit={visit} />
        ))}
      </CardContent>
    </Card>
  );
}

function CpptVisitCard({ visit }: { visit: CpptVisit }) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-3 space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="text-[10px] font-mono">
          {visit.tanggal}
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          {visit.kunjungan}
        </Badge>
        <span className="text-[10px] text-muted-foreground">
          Penulis: {visit.penulis}
        </span>
      </div>

      {/* SOAP Sections */}
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
