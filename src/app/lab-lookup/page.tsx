"use client";

import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search, Activity, TestTube, ExternalLink, Loader2, AlertCircle,
  ChevronsDownUp, ChevronsUpDown,
} from "lucide-react";
import type { APIResponse, PatientState } from "./types";
import { PatientResultCard } from "./components/patient-result-card";
import { parseMultiNorms, MAX_NORMS } from "@/lib/lab-utils";

// how many SIMRS-hitting lookups run at once (tunnel protection)
const CONCURRENCY = 6;
const POLL_INTERVAL_MS = 2000;
const POLL_MAX_TICKS = 90; // 3 min per patient

type Patch = Partial<PatientState>;

export default function LabLookupPage() {
  const [mrInput, setMrInput] = useState("");
  const [queries, setQueries] = useState<PatientState[]>([]);
  const [overflow, setOverflow] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [existsMap, setExistsMap] = useState<Record<string, string>>({});
  const genRef = useRef(0);

  function patch(norm: string, p: Patch, gen?: number) {
    if (gen !== undefined && genRef.current !== gen) return; // stale run
    setQueries((prev) =>
      prev.map((q) => (q.norm === norm ? { ...q, ...p } : q))
    );
  }

  async function pollFull(norm: string, jobId: string, gen: number) {
    for (let i = 0; i < POLL_MAX_TICKS; i++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      if (genRef.current !== gen) return;
      try {
        const res = await fetch(`/api/hema-lookup?job=${jobId}`);
        const job = (await res.json()) as APIResponse & { result?: APIResponse };
        if (job.status === "done" && job.result?.success) {
          patch(norm, {
            fullLoading: false,
            data: job.result,
            fullNote: `Lengkap: ${job.result.visits?.length ?? 0} kunjungan${
              job.result.special ? " + penunjang khusus" : ""
            }`,
          }, gen);
          return;
        }
        if (job.status === "error") {
          patch(norm, {
            fullLoading: false,
            fullNote: "Data lengkap gagal dimuat — menampilkan preview.",
          }, gen);
          return;
        }
      } catch {
        // transient poll failure — keep polling
      }
    }
    patch(norm, {
      fullLoading: false,
      fullNote: "Full fetch masih berjalan di server — ulangi search untuk hasil lengkap.",
    }, gen);
  }

  async function startFullJob(norm: string, gen: number, refresh = false) {
    patch(norm, { fullLoading: true }, gen);
    try {
      const res = await fetch(
        `/api/hema-lookup?norm=${norm}&full=1${refresh ? "&refresh=1" : ""}`
      );
      const started = await res.json();
      if (!started.success || !started.job_id) {
        patch(norm, {
          fullLoading: false,
          fullNote: refresh ? "Refetch gagal dimulai." : undefined,
        }, gen);
        return;
      }
      await pollFull(norm, started.job_id, gen);
    } catch {
      patch(norm, { fullLoading: false }, gen);
    }
  }

  async function runOne(norm: string, gen: number) {
    if (genRef.current !== gen) return;
    try {
      const res = await fetch(`/api/hema-lookup?norm=${norm}`);
      const d: APIResponse = await res.json();
      if (genRef.current !== gen) return;
      if (d.success && d.name) {
        patch(norm, { loading: false, data: d }, gen);
        if (d.is_partial) await startFullJob(norm, gen);
      } else {
        patch(norm, { loading: false, error: d.error || "Tidak ditemukan" }, gen);
      }
    } catch {
      patch(norm, { loading: false, error: "Gagal terhubung ke server" }, gen);
    }
  }

  async function runWithQueue(norms: string[], gen: number) {
    const queue = [...norms];
    const workers = Array.from(
      { length: Math.min(CONCURRENCY, norms.length) },
      async () => {
        while (queue.length) {
          const n = queue.shift()!;
          await runOne(n, gen);
        }
      }
    );
    await Promise.all(workers);
  }

  function handleSearch() {
    const { norms, overflow: of } = parseMultiNorms(mrInput);
    setOverflow(of);
    if (norms.length === 0) {
      setGlobalError("Masukkan minimal satu nomor rekam medis (angka 3-8 digit)");
      setQueries([]);
      return;
    }
    setGlobalError("");
    const gen = ++genRef.current;
    const init: PatientState[] = norms.map((n) => ({
      norm: n,
      loading: true,
      fullLoading: false,
      data: null,
      error: null,
      opened: false,
    }));
    setQueries(init);
    runWithQueue(norms, gen);
  }

  function handleRefetch(norm: string) {
    const gen = genRef.current;
    patch(norm, { error: null }, gen);
    startFullJob(norm, gen, true);
  }

  function setAllOpened(opened: boolean) {
    setQueries((prev) => prev.map((q) => ({ ...q, opened })));
  }

  function openExternal(base: string) {
    const first = queries[0]?.norm || parseMultiNorms(mrInput).norms[0];
    if (!first) return;
    window.open(`${base}${encodeURIComponent(first)}`, "_blank", "noopener,noreferrer");
  }

  // Batch-check which norms already exist in "My Patients" when results load
  useEffect(() => {
    const loadedNorms = queries.filter((q) => q.data?.success).map((q) => q.norm);
    if (loadedNorms.length === 0) return;

    const fetchExists = async () => {
      try {
        const res = await fetch(
          `/api/patients/exists?norms=${encodeURIComponent(loadedNorms.join(";"))}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        const map: Record<string, string> = {};
        for (const e of data.exists) map[e.norm] = e.id;
        setExistsMap(map);
      } catch {}
    };
    fetchExists();
  }, [queries]);

  // Clear exists map on new search
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (mrInput.trim() === "") setExistsMap({});
  }, [mrInput]);

  async function handleAddToMyPatients(
    norm: string,
    labData?: APIResponse
  ): Promise<{ success: boolean; id?: string; error?: string; savedVisits?: number }> {
    try {
      const res = await fetch("/api/patients/from-norm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ norm, labData }),
      });
      const data = await res.json();
      if (data.success && data.patient?.id) {
        setExistsMap((prev) => ({ ...prev, [norm]: data.patient.id }));
        return { success: true, id: data.patient.id, savedVisits: data.savedVisits };
      }
      return { success: false, error: data.error || "Gagal menambahkan pasien" };
    } catch {
      return { success: false, error: "Gagal terhubung ke server" };
    }
  }

  const totalPatients = queries.length;
  const loaded = queries.filter((q) => q.data).length;

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
          Cari hasil lab dari SIMRS — bisa banyak RM sekaligus, pisahkan dengan
          &quot;;&quot;, koma, spasi, atau baris baru
        </p>
      </div>

      <Card className="max-w-4xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pencarian Data Pasien</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder={"Contoh:\n1679157 ; 1469712 , 917718\n1690930"}
            value={mrInput}
            onChange={(e) => setMrInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSearch();
            }}
            className="min-h-20 text-sm font-mono"
            autoFocus
          />
          <div className="flex items-center gap-3">
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              Cari Data Lab
            </Button>
            <p className="text-xs text-muted-foreground">
              Ctrl+Enter juga jalan · maks {MAX_NORMS} RM
            </p>
          </div>
          {overflow && (
            <p className="text-xs text-orange-300">
              ⚠ Lebih dari {MAX_NORMS} RM — hanya {MAX_NORMS} pertama dipakai.
            </p>
          )}
          {globalError && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5" /> {globalError}
            </p>
          )}

          {totalPatients > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="outline" size="sm"
                className="gap-1.5 border-red-500/40 text-red-300 hover:bg-red-500/10"
                onClick={() =>
                  openExternal("https://sirs.kay.web.id/testing?norm=")
                }
              >
                <Activity className="h-4 w-4" /> SIMRS Live (RM pertama)
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button
                variant="outline" size="sm"
                className="gap-1.5 border-blue-500/40 text-blue-300 hover:bg-blue-500/10"
                onClick={() =>
                  openExternal("https://hema.ark-kay.my.id/lookup.html?norm=")
                }
              >
                <TestTube className="h-4 w-4" /> Hema Lab
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPatients > 0 && (
        <div className="flex items-center gap-2 max-w-4xl">
          <Badge variant="secondary" className="text-xs">
            {loaded}/{totalPatients} pasien termuat
          </Badge>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 ml-auto"
            onClick={() => setAllOpened(true)}>
            <ChevronsUpDown className="h-3.5 w-3.5" /> Expand all
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"
            onClick={() => setAllOpened(false)}>
            <ChevronsDownUp className="h-3.5 w-3.5" /> Collapse all
          </Button>
        </div>
      )}

      <div className="space-y-3 max-w-4xl">
        {queries.map((q, i) => (
          <PatientResultCard
            key={q.norm}
            patient={q}
            index={i}
            onToggle={(norm) =>
              setQueries((prev) =>
                prev.map((p) =>
                  p.norm === norm ? { ...p, opened: !p.opened } : p
                )
              )
            }
            onRefetch={handleRefetch}
            existingPatientId={existsMap[q.norm] || null}
            onAddToMyPatients={handleAddToMyPatients}
          />
        ))}
        {queries.length > 0 &&
          queries.every((q) => q.loading) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-neon" />
              Mengambil data dari SIMRS...
            </div>
          )}
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="text-sm">ℹ️ Cara Pakai</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Multi-RM:</strong> paste daftar
            RM dari WA/sensus (dipisah ; koma spasi atau baris baru) — semua
            pasien dicari paralel, hasil per pasien bisa dibuka-tutup.
          </p>
          <p>
            <strong className="text-foreground">Pencarian dua tahap:</strong>{" "}
            pratinjau 3 kunjungan terbaru muncul dulu (&lt;3 dtk), riwayat
            lengkap + penunjang khusus menyusul otomatis di background.
          </p>
          <p>
            <strong className="text-foreground">Cari parameter:</strong> ketik
            nama periksa (mis. &quot;hb&quot;, &quot;ureum&quot;) untuk memindai
            parameter tsb di SEMUA kunjungan pasien tersebut — muncul sebagai
            tabel trend tanggal.
          </p>
          <p className="text-xs pt-2 border-t border-border">
            Data di-cache server 6 jam; tombol &quot;Refetch&quot; memaksa
            pengambilan ulang dari SIMRS. Nilai di luar range diberi penanda
            ↓/↑ ringan — interpretasi klinis tetap sepenuhnya wewenang dokter.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
