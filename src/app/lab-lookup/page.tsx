"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Activity, TestTube, ExternalLink } from "lucide-react";

export default function LabLookupPage() {
  const [mrNumber, setMrNumber] = useState("");

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
      openSIMRS();
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
              placeholder="Contoh: 123456"
              value={mrNumber}
              onChange={(e) => setMrNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-base"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Tekan Enter untuk langsung buka SIMRS Live
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              onClick={openSIMRS}
              variant="outline"
              className="h-auto py-4 flex-col gap-2 border-red-500/40 text-red-300 hover:bg-red-500/10 hover:text-red-200"
            >
              <Activity className="h-5 w-5" />
              <span className="font-semibold">SIMRS Live</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                Data pasien lengkap <ExternalLink className="h-3 w-3" />
              </span>
            </Button>

            <Button
              onClick={openHemaLab}
              variant="outline"
              className="h-auto py-4 flex-col gap-2 border-blue-500/40 text-blue-300 hover:bg-blue-500/10 hover:text-blue-200"
            >
              <TestTube className="h-5 w-5" />
              <span className="font-semibold">Hema Lab Lookup</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                Hasil laboratorium <ExternalLink className="h-3 w-3" />
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-sm">ℹ️ Informasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">SIMRS Live:</strong> Sistem informasi rumah sakit untuk melihat data pasien lengkap termasuk riwayat kunjungan, diagnosis, dan terapi.
          </p>
          <p>
            <strong className="text-foreground">Hema Lab Lookup:</strong> Database hasil laboratorium untuk tracking trend lab pasien dari waktu ke waktu.
          </p>
          <p className="text-xs pt-2 border-t border-border">
            Kedua sistem akan terbuka di tab baru. Pastikan popup blocker tidak aktif.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
