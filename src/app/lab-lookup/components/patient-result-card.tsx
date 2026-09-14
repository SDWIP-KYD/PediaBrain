"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  RefreshCw,
  AlertCircle,
  Search,
  X,
  Plus,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PatientState, APIResponse } from "../types";
import { VisitCard } from "./visit-card";
import { SpecialSection } from "./special-section";
import { SearchResultsTable } from "./search-results";
import { searchParams, countOutOfRange } from "@/lib/lab-utils";

const VISIBLE_VISITS = 20;

export function PatientResultCard({
  patient,
  index,
  onToggle,
  onRefetch,
  existingPatientId,
  onAddToMyPatients,
  showSave,
  savedNote,
}: {
  patient: PatientState;
  index: number;
  onToggle: (norm: string) => void;
  onRefetch: (norm: string) => void;
  existingPatientId: string | null;
  showSave?: boolean;
  savedNote?: string | null;
  onAddToMyPatients: (norm: string, labData?: APIResponse) => Promise<{ success: boolean; id?: string; error?: string; savedVisits?: number }>;
}) {
  const [paramQ, setParamQ] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const router = useRouter();

  async function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    setAdding(true);
    setAddError(null);
    const res = await onAddToMyPatients(patient.norm, patient.data ?? undefined);
    if (res.success) {
      // Parent (lab-lookup page) updates existsMap → card re-renders with existingPatientId
    } else {
      setAddError(res.error || "Gagal menambahkan");
    }
    setAdding(false);
  }

  async function handleRetryAdd(e: React.MouseEvent) {
    setAddError(null);
    handleAdd(e);
  }

  const visits = patient.data?.visits ?? [];
  const outOfRange = useMemo(() => countOutOfRange(visits), [visits]);
  const radSummary = useMemo(() => {
    const rad = patient.data?.special?.rad ?? [];
    if (rad.length === 0) return null;
    const unread = rad.filter(
      (r) => r.state === "unread" || r.state === "menunggu"
    ).length;
    return { total: rad.length, unread };
  }, [patient.data]);
  const searchRows = useMemo(
    () => (paramQ.trim() ? searchParams(visits, paramQ) : null),
    [paramQ, visits]
  );

  // ----- header (always rendered) -----
  const header = (
    <button
      onClick={() => onToggle(patient.norm)}
      className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-accent/30 transition-colors"
    >
      {patient.opened ? (
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      ) : (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm truncate">
            {patient.data?.name || `RM ${patient.norm}`}
          </span>
          <Badge variant="outline" className="text-[10px] font-mono">
            RM {patient.norm}
          </Badge>
          {visits.length > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {visits.length} sesi
            </span>
          )}
          {outOfRange > 0 && (
            <Badge
              variant="outline"
              className="text-[9px] border-orange-500/40 text-orange-300"
            >
              {outOfRange} di luar range
            </Badge>
          )}
          {radSummary && (
            <Badge
              variant="outline"
              className={`text-[9px] ${
                radSummary.unread > 0
                  ? "border-amber-500/40 text-amber-300"
                  : "border-green-500/40 text-green-300"
              }`}
            >
              Rad {radSummary.total}
              {radSummary.unread > 0 ? ` · ${radSummary.unread} basah` : " ✓"}
            </Badge>
          )}
        </div>
        {patient.error && (
          <div className="flex items-center gap-1.5 text-[11px] text-destructive mt-0.5">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {patient.error}
          </div>
        )}
        {patient.fullNote && !patient.error && (
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {patient.fullNote}
          </div>
        )}
      </div>
      {patient.loading && (
        <Badge variant="outline" className="text-[9px] shrink-0 flex items-center gap-1">
          <Loader2 className="h-2.5 w-2.5 animate-spin" /> memuat…
        </Badge>
      )}
      {patient.fullLoading && (
        <Badge variant="outline" className="text-[9px] shrink-0 flex items-center gap-1">
          <Loader2 className="h-2.5 w-2.5 animate-spin" /> riwayat lengkap…
        </Badge>
      )}
      {index === 0 && !patient.loading && !patient.fullLoading && (
        <Badge variant="secondary" className="text-[9px] shrink-0">
          terbaru
        </Badge>
      )}

      {/* Add / Save button */}
      {!patient.loading && patient.data?.success && !patient.error && (
        (existingPatientId && !showSave) ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/pasien/${existingPatientId}`);
            }}
            className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md border border-green-500/30 bg-green-500/10 text-green-300 text-[10px] hover:bg-green-500/20 transition-colors"
            title="Buka di My Patients"
          >
            <Check className="h-3 w-3" />
            Di My Patients
          </button>
        ) : addError ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleRetryAdd(e); }}
            className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-[10px] hover:bg-destructive/20 transition-colors"
            title={addError || "Gagal menambahkan pasien"}
          >
            <AlertCircle className="h-3 w-3" />
            Gagal, coba lagi
          </button>
        ) : adding ? (
          <button
            type="button"
            className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md border border-border bg-muted/50 text-muted-foreground text-[10px]"
          >
            <Loader2 className="h-3 w-3 animate-spin" />
            Menambahkan…
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleAdd(e); }}
            className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md border border-neon/30 bg-neon/10 text-neon text-[10px] hover:bg-neon/20 transition-colors"
            title={showSave ? "Simpan hasil lab ke My Patients" : "Tambah ke My Patients"}
          >
            <Plus className="h-3 w-3" />
            {showSave ? "Simpan Lab" : "Tambah"}
          </button>
        )
      )}
    </button>
  );

  return (
    <Card className="py-0 overflow-hidden">
      {header}

      {savedNote && !patient.loading && (
        <div className="px-3 py-1 text-[10px] text-green-400 bg-green-500/5 border-t border-border/40">
          {savedNote}
        </div>
      )}

      {patient.opened && (
        <CardContent className="pt-1 pb-4 space-y-3 border-t border-border/50">
          {/* per-patient parameter search (Hema-style) */}
          {visits.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={paramQ}
                  onChange={(e) => setParamQ(e.target.value)}
                  placeholder="🔍 Cari parameter… contoh: ureum, albumin, RET, hb"
                  className="pl-8 h-8 text-xs"
                />
              </div>
              {paramQ && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={() => setParamQ("")}
                >
                  <X className="h-3 w-3" /> Reset
                </Button>
              )}
            </div>
          )}

          {searchRows ? (
            <SearchResultsTable
              rows={searchRows}
              query={paramQ}
              visitCount={visits.length}
            />
          ) : (
            <div className="space-y-2">
              {(showAll ? visits : visits.slice(0, VISIBLE_VISITS)).map(
                (v, i) => (
                  <VisitCard key={i} visit={v} defaultOpen={i < 3} />
                )
              )}
              {!showAll && visits.length > VISIBLE_VISITS && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowAll(true)}
                >
                  Tampilkan semua ({visits.length} kunjungan)
                </Button>
              )}
            </div>
          )}

          {patient.data?.special && (
            <SpecialSection special={patient.data.special} />
          )}

          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] gap-1 text-muted-foreground"
              onClick={() => onRefetch(patient.norm)}
              disabled={patient.loading || patient.fullLoading}
            >
              <RefreshCw className="h-3 w-3" />
              Refetch dari SIMRS
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
