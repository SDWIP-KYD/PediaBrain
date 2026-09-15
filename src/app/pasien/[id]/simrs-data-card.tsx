"use client";

import { useState, useEffect, useRef } from "react";
import type { APIResponse, PatientState } from "@/app/lab-lookup/types";
import { PatientResultCard } from "@/app/lab-lookup/components/patient-result-card";

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_TICKS = 90; // 3 min per patient

/**
 * Reusable wrapper that drives a single PatientResultCard with live SIMRS data.
 * Fetches quick preview + background full-fetch job, same logic as LabLookupPage.
 */
export function SimrsDataCard({
  norm,
  patientId,
}: {
  norm: string;
  patientId: string;
}) {
  const [state, setState] = useState<PatientState>({
    norm,
    loading: true,
    fullLoading: false,
    data: null,
    error: null,
    opened: true,
  });

  const genRef = useRef(0);

  async function runOne() {
    const gen = genRef.current;
    try {
      const res = await fetch(`/api/hema-lookup?norm=${norm}`, {
        signal: AbortSignal.timeout(25000),
      });
      const d: APIResponse = await res.json();
      if (genRef.current !== gen) return;

      if (d.success && d.name) {
        setState({
          norm,
          loading: false,
          fullLoading: false,
          data: d,
          error: null,
          opened: true,
          fullNote: undefined,
        });
        // Persist this snapshot silently; upgraded later if a full fetch follows.
        void autoSave(d);
        if (d.is_partial) {
          startFullJob(d.job_id!, gen);
        }
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: d.error || "Pasien tidak ditemukan di SIMRS",
        }));
      }
    } catch {
      if (genRef.current === gen) {
        setState((prev) => ({ ...prev, loading: false, error: "Gagal terhubung ke server" }));
      }
    }
  }

  async function startFullJob(jobId: string, gen: number) {
    setState((prev) => ({ ...prev, fullLoading: true }));

    // If job_id wasn't returned, start a new one
    if (!jobId) {
      try {
        const res = await fetch(
          `/api/hema-lookup?norm=${norm}&full=1&refresh=1`,
          { signal: AbortSignal.timeout(25000) }
        );
        const started: APIResponse & { job_id?: string } = await res.json();
        if (!started.success || !started.job_id) {
          setState((prev) => ({ ...prev, fullLoading: false }));
          return;
        }
        jobId = started.job_id;
      } catch {
        setState((prev) => ({ ...prev, fullLoading: false }));
        return;
      }
    }

    // Poll for completion
    for (let i = 0; i < POLL_MAX_TICKS; i++) {
      if (genRef.current !== gen) return;
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      try {
        const res = await fetch(`/api/hema-lookup?job=${jobId}`, {
          signal: AbortSignal.timeout(15000),
        });
        const job: APIResponse & { status?: string; result?: APIResponse } =
          await res.json();

        if (job.status === "done" && job.result?.success) {
          setState((prev) => ({
            ...prev,
            fullLoading: false,
            data: job.result!,
            fullNote: `Lengkap: ${job.result!.visits?.length ?? 0} kunjungan`,
          }));
          // Upgrade the auto-saved snapshot with the complete data.
          void autoSave(job.result!);
          return;
        }
        if (job.status === "error") {
          setState((prev) => ({
            ...prev,
            fullLoading: false,
            fullNote: "Data lengkap gagal dimuat — menampilkan preview.",
          }));
          return;
        }
      } catch {
        // keep polling
      }
    }
    setState((prev) => ({
      ...prev,
      fullLoading: false,
      fullNote: "Full fetch masih berjalan di server.",
    }));
  }

  async function handleRefetch() {
    genRef.current++;
    setState({
      norm,
      loading: true,
      fullLoading: false,
      data: null,
      error: null,
      opened: true,
    });
    runOne();
  }

  const [savedNote, setSavedNote] = useState<string | null>(null);

  // Signature of the last auto-saved snapshot, so we only save once per change.
  const autoSaveSigRef = useRef<string | null>(null);

  // Build a cheap fingerprint of loaded lab data to detect real changes.
  function dataSignature(d: APIResponse): string {
    const visits = d.visits ?? [];
    const special = d.special ?? {};
    const specialCount = Object.values(special).reduce<number>(
      (n, arr) => n + (Array.isArray(arr) ? arr.length : 0),
      0
    );
    const lastTanggal = visits[0]?.tgl ?? "";
    return `${visits.length}|${specialCount}|${lastTanggal}`;
  }

  // Silent auto-save: persist the freshly-loaded live snapshot to My Patients.
  // Skipped while a full fetch is still running (we save once, with final data).
  const autoSavingRef = useRef(false);

  async function autoSave(d: APIResponse) {
    if (autoSavingRef.current) return;
    const sig = dataSignature(d);
    if (autoSaveSigRef.current === sig) return;
    autoSavingRef.current = true;
    autoSaveSigRef.current = sig;
    try {
      const res = await fetch('/api/patients/from-norm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ norm, labData: d }),
        signal: AbortSignal.timeout(30000),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        const visits = json.savedVisits ?? 0;
        const special = json.savedSpecial ?? 0;
        setSavedNote(`Otomatis tersimpan: ${visits} kunjungan lab${special ? ` + ${special} hasil special` : ''}`);
      } else {
        // Allow a later attempt to retry this snapshot.
        autoSaveSigRef.current = null;
      }
    } catch {
      autoSaveSigRef.current = null;
    } finally {
      autoSavingRef.current = false;
    }
  }

  async function handleAddToMyPatients(
    n: string,
    labData?: APIResponse
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    // Already in My Patients — persist/refresh this patient's lab snapshot instead
    if (!labData?.success) {
      return { success: false, error: 'Data lab belum termuat' };
    }
    try {
      const res = await fetch('/api/patients/from-norm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ norm: n, labData }),
        signal: AbortSignal.timeout(30000),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        return { success: false, error: json?.error || `Gagal (${res.status})` };
      }
      const visits = json.savedVisits ?? 0;
      const special = json.savedSpecial ?? 0;
      setSavedNote(`Tersimpan: ${visits} kunjungan lab${special ? ` + ${special} hasil special` : ''}`);
      return { success: true, id: patientId };
    } catch {
      return { success: false, error: 'Gagal menyimpan ke database' };
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runOne();
  }, []);

  return (
    <PatientResultCard
      patient={state}
      index={0}
      onToggle={() => {
        setState((prev) => ({ ...prev, opened: !prev.opened }));
      }}
      onRefetch={handleRefetch}
      existingPatientId={patientId}
      showSave
      savedNote={savedNote}
      onAddToMyPatients={handleAddToMyPatients}
    />
  );
}
