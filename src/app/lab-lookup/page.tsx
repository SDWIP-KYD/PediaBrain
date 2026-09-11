"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Activity, TestTube, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import type { APIResponse } from "./types";
import { VisitCard } from "./components/visit-card";
import { SpecialSection } from "./components/special-section";

const LabTrendChart = dynamic(
  () => import("@/components/lab-trend-chart").then((m) => m.LabTrendChart),
  { ssr: false, loading: () => <div className="h-40 animate-pulse rounded-lg bg-muted/30" /> }
);

export default function LabLookupPage() {
  const [mrNumber, setMrNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<APIResponse | null>(null);
  const [error, setError] = useState("");
  const [fullLoading, setFullLoading] = useState(false);
  const [fullNote, setFullNote] = useState("");
  const [showAll, setShowAll] = useState(false);

  async function fetchLabData() {
    if (!mrNumber.trim()) {
      setError("Masukkan nomor rekam medis");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);
    setFullNote("");
    setShowAll(false);

    try {
      // Phase 1: quick preview (3 visits, <3s)
      const res = await fetch(`/api/hema-lookup?norm=${encodeURIComponent(mrNumber.trim())}`);
      const result: APIResponse = await res.json();

      if (result.success && result.name) {
        setData(result);
        setLoading(false);
        // Phase 2: full history via background job
        fetchFullData(mrNumber.trim());
      } else {
        setError(result.error || "Tidak dapat mengambil data pasien");
        setLoading(false);
      }
    } catch {
      setError("Tidak dapat terhubung ke server");
      setLoading(false);
    }
  }

  async function fetchFullData(norm: string) {
    setFullLoading(true);
    try {
      const startRes = await fetch(`/api/hema-lookup?norm=${norm}&full=1`);
      const started = await startRes.json();
      if (!started.success || !started.job_id) {
        setFullNote("Data lengkap tidak dapat dimuat — menampilkan 3 kunjungan terakhir.");
        return;
      }

      // poll job status every 2s, max 3 min (cold full fetch ~40-90s)
      for (let attempt = 0; attempt < 90; attempt++) {
        await new Promise((r) => setTimeout(r, 2000));
        const statusRes = await fetch(`/api/hema-lookup?job=${started.job_id}`);
        const job = await statusRes.json();

        if (job.status === "done" && job.result?.success) {
          setData(job.result);
          setFullNote(`Lengkap: ${job.result.visits?.length ?? 0} kunjungan${job.result.special ? " + penunjang khusus" : ""}`);
          setFullLoading(false);
          return;
        }
        if (job.status === "error" || job.success === false) {
          setFullNote("Data lengkap gagal dimuat — menampilkan 3 kunjungan terakhir.");
          setFullLoading(false);
          return;
        }
      }
      setFullNote("Full fetch masih berjalan — refresh halaman lagi untuk data lengkap.");
    } catch {
      setFullNote("Gagal memuat data lengkap.");
    } finally {
      setFullLoading(false);
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
        <div className="space-y-4 max-w-4xl">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                <Activity className="h-4 w-4 text-neon" />
                {data.name}
                {data.cached && (
                  <Badge variant="secondary" className="text-xs">
                    Cached
                  </Badge>
                )}
                {fullLoading && (
                  <Badge variant="outline" className="text-xs ml-auto flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> memuat data lengkap...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  RM: {data.norm}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {data.visits?.length ?? 0} kunjungan ditampilkan
                  {data.is_partial ? " (preview terbaru)" : ""}
                </span>
              </div>
              {fullNote && (
                <p className="text-xs text-muted-foreground">{fullNote}</p>
              )}
            </CardContent>
          </Card>

          {data.visits && data.visits.length > 0 && (
            <LabTrendChart visits={data.visits} />
          )}

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
              <CardContent className="space-y-2">
                {(showAll ? data.visits : data.visits.slice(0, 20)).map(
                  (visit, idx) => (
                    <VisitCard key={idx} visit={visit} defaultOpen={idx < 3} />
                  )
                )}
                {!showAll && data.visits.length > 20 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowAll(true)}
                  >
                    Tampilkan semua ({data.visits.length} kunjungan)
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {data.special && <SpecialSection special={data.special} />}
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
