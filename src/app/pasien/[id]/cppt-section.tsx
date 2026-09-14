"use client";

import { useState, useEffect } from "react";
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

export function CpptSection({ norm }: { norm: string }) {
  const [data, setData] = useState<CpptVisit[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchCppt() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cppt/${norm}`, { cache: "no-store" });
      const json: CpptResponse = await res.json();
      if (json.ok && json.cppt) {
        setData(json.cppt);
      } else {
        setError(json.error || "Tidak ada data CPPT");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCppt();
  }, [norm]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-neon" />
          <span className="ml-2 text-sm text-muted-foreground">
            Memuat data CPPT...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 gap-1"
            onClick={fetchCppt}
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
        <CardContent className="py-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Belum ada catatan CPPT untuk pasien ini</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Stethoscope className="h-3.5 w-3.5 text-neon" />
          Riwayat CPPT ({data.length} kunjungan)
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs gap-1"
          onClick={fetchCppt}
          title="Segarkan data CPPT"
        >
          <RefreshCw className="h-3 w-3" />
          Segarkan
        </Button>
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
