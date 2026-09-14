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
  Thermometer,
  Heart,
  Activity,
  Wind,
  Droplets,
} from "lucide-react";

type VitalSigns = {
  suhu?: string;
  nadi?: string;
  sistole?: string;
  diastole?: string;
  rr?: string;
  spo2?: string;
};

type CpptVisit = {
  tanggal: string;
  kunjungan: string;
  dpjp: string;
  subjektif: string;
  objektif: string;
  assesment: string;
  plan: string;
  vital?: VitalSigns;
};

type CpptResponse = {
  success: boolean;
  error?: string;
  norm?: string;
  name?: string;
  visits?: CpptVisit[];
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
      if (json.success && json.visits) {
        setData(json.visits);
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
  const vital = visit.vital;
  const hasVital = vital && Object.values(vital).some(Boolean);

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
          DPJP: {visit.dpjp}
        </span>
      </div>

      {/* Vital Signs */}
      {hasVital && (
        <div className="flex gap-1.5 flex-wrap">
          {vital.suhu && (
            <Badge className="bg-red-500/10 text-red-300 text-[10px] gap-1">
              <Thermometer className="h-2.5 w-2.5" />
              {vital.suhu}°C
            </Badge>
          )}
          {vital.nadi && (
            <Badge className="bg-pink-500/10 text-pink-300 text-[10px] gap-1">
              <Heart className="h-2.5 w-2.5" />
              {vital.nadi}/m
            </Badge>
          )}
          {vital.sistole && vital.diastole && (
            <Badge className="bg-blue-500/10 text-blue-300 text-[10px] gap-1">
              <Activity className="h-2.5 w-2.5" />
              {vital.sistole}/{vital.diastole}
            </Badge>
          )}
          {vital.rr && (
            <Badge className="bg-green-500/10 text-green-300 text-[10px] gap-1">
              <Wind className="h-2.5 w-2.5" />
              {vital.rr}/m
            </Badge>
          )}
          {vital.spo2 && (
            <Badge className="bg-cyan-500/10 text-cyan-300 text-[10px] gap-1">
              <Droplets className="h-2.5 w-2.5" />
              O₂ {vital.spo2}%
            </Badge>
          )}
        </div>
      )}

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
      {visit.plan && <SoapSection label="Plan" content={visit.plan} />}
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
