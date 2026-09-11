"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Activity, TestTube, ExternalLink, Loader2, AlertCircle, Calendar } from "lucide-react";

type LabParam = {
  name: string;
  hasil: string;
  normal: string;
  satuan: string;
};

type LabVisit = {
  tgl: string;
  params: LabParam[];
};

type APIResponse = {
  success: boolean;
  norm?: string;
  name?: string;
  visits?: LabVisit[];
  error?: string;
  cached?: boolean;
};

export default function LabLookupPage() {
  const [mrNumber, setMrNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<APIResponse | null>(null);
  const [error, setError] = useState("");

  async function fetchLabData() {
    if (!mrNumber.trim()) {
      setError("Masukkan nomor rekam medis");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(`/api/hema-lookup?norm=${encodeURIComponent(mrNumber.trim())}`);
      const result: APIResponse = await res.json();

      if (result.success && result.name) {
        setData(result);
      } else {
        setError(result.error || "Tidak dapat mengambil data pasien");
      }
    } catch {
      setError("Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  function openSIMRS() {
    if (!mrNumber.trim()) {
      alert("Masukkan nomor rekam medis terlebih dahulu");
      return;
    }
    const url = `https://sirs.kay.web.id/testing?norm=${encodeURIComponent(mrNumber.trim())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function openHemaLab() {
    if (!mrNumber.trim()) {
      alert("Masukkan nomor rekam medis terlebih dahulu");
      return;
    }
    const url = `https://hema.ark-kay.my.id/lookup.html?norm=${encodeURIComponent(mrNumber.trim())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      fetchLabData();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-neon" />
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Lab Lookup
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Cari hasil laboratorium dan data pasien berdasarkan nomor rekam medis
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Pencarian Data Pasien</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="mr-input" className="text-sm font-medium">
              Nomor Rekam Medis
            </label>
            <Input
              id="mr-input"
              type="text"
              placeholder="Contoh: 1679157"
              value={mrNumber}
              onChange={(e) => setMrNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-base"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Tekan Enter untuk cari data lab
            </p>
          </div>

          <Button
            onClick={fetchLabData}
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengambil data...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Cari Data Lab
              </>
            )}
          </Button>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              onClick={openSIMRS}
              variant="outline"
              size="sm"
              className="gap-1.5 border-red-500/40 text-red-300 hover:bg-red-500/10"
            >
              <Activity className="h-4 w-4" />
              SIMRS Live
              <ExternalLink className="h-3 w-3" />
            </Button>

            <Button
              onClick={openHemaLab}
              variant="outline"
              size="sm"
              className="gap-1.5 border-blue-500/40 text-blue-300 hover:bg-blue-500/10"
            >
              <TestTube className="h-4 w-4" />
              Hema Lab
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card className="max-w-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-neon" />
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="max-w-2xl border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Error</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data?.success && data.name && (
        <div className="space-y-4 max-w-2xl">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-neon" />
                Data Pasien
                {data.cached && (
                  <Badge variant="secondary" className="text-xs ml-auto">
                    Cached
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-lg font-bold text-foreground">{data.name}</p>
                <Badge variant="outline" className="text-xs mt-1">
                  RM: {data.norm}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {data.visits && data.visits.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TestTube className="h-4 w-4 text-neon" />
                  Hasil Laboratorium
                  <Badge variant="secondary" className="text-xs ml-auto">
                    {data.visits.length} kunjungan
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.visits.map((visit, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {visit.tgl}
                    </div>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted text-xs">
                          <tr>
                            <th className="text-left p-2 font-medium">Parameter</th>
                            <th className="text-right p-2 font-medium">Hasil</th>
                            <th className="text-right p-2 font-medium">Normal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visit.params.map((param, pidx) => {
                            const isAbnormal = param.normal !== "-" && 
                              param.hasil !== "-" && 
                              !param.normal.includes(param.hasil);
                            
                            return (
                              <tr key={pidx} className="border-t border-border">
                                <td className="p-2">{param.name}</td>
                                <td className={`p-2 text-right font-mono ${isAbnormal ? 'text-yellow-500 font-semibold' : ''}`}>
                                  {param.hasil} {param.satuan}
                                </td>
                                <td className="p-2 text-right text-xs text-muted-foreground">
                                  {param.normal}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-sm">ℹ️ Informasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Lab Lookup:</strong> Cari hasil laboratorium pasien langsung dari sistem SIMRS tanpa perlu buka tab baru.
          </p>
          <p>
            <strong className="text-foreground">SIMRS Live & Hema Lab:</strong> Link ke sistem eksternal untuk data lengkap jika diperlukan.
          </p>
          <p className="text-xs pt-2 border-t border-border">
            Data di-cache 5 menit untuk performa optimal.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
