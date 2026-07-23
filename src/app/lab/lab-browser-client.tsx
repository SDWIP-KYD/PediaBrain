"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Beaker,
  Search,
  ChevronDown,
  ChevronRight,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const FLAG_COLORS: Record<string, string> = {
  KRITIS: "bg-red-500/20 text-red-300 border-red-500/30",
  Bermakna: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
  Normal: "bg-emerald-500/10 text-emerald-300 border-emerald-500/15",
  Rendah: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  Tinggi: "bg-orange-500/15 text-orange-300 border-orange-500/25",
};

type Patient = {
  id: string;
  name: string;
  medicalRecordNo: string | null;
  room: string | null;
  bed: string | null;
  sex: string | null;
  birthDate: string | null;
  dpjp: string | null;
  visits: { id: string; visitDate: string; diagnosisPrimary: string | null; diagnosisSecondary: string | null }[];
  labsByVisit: Record<string, LabResult[]>;
};

type LabResult = {
  id: string;
  visitId: string;
  testName: string;
  result: string | null;
  unit: string | null;
  referenceRange: string | null;
  flag: string | null;
  createdAt: string;
};

export default function LabBrowserPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [testFilter, setTestFilter] = useState("");
  const [flagFilter, setFlagFilter] = useState<string>("");
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams();
        if (roomFilter) params.set("room", roomFilter);
        if (search) params.set("q", search);
        const res = await fetch(`/api/lab-browser?${params}`);
        const data = await res.json();
        setPatients(data.patients || []);
        setRooms(data.rooms || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [roomFilter, search]);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Collect all unique test names
  const allTestNames = useMemo(() => {
    const names = new Set<string>();
    for (const p of patients) {
      for (const labs of Object.values(p.labsByVisit)) {
        for (const l of labs) {
          if (l.testName) names.add(l.testName);
        }
      }
    }
    return Array.from(names).sort();
  }, [patients]);

  // Filter tests
  const filteredTestNames = useMemo(() => {
    if (!testFilter) return allTestNames;
    return allTestNames.filter((n) =>
      n.toLowerCase().includes(testFilter.toLowerCase())
    );
  }, [allTestNames, testFilter]);

  // Get latest lab result for a patient + test
  const getLatestResult = useCallback(
    (patient: Patient, testName: string): LabResult | null => {
      const sortedVisits = [...patient.visits].sort(
        (a, b) =>
          new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
      );
      for (const v of sortedVisits) {
        const labs = patient.labsByVisit[v.id];
        if (labs) {
          const found = labs.find((l) => l.testName === testName);
          if (found) return found;
        }
      }
      return null;
    },
    []
  );

  // Get all lab results for a patient + test (chronological)
  const getAllResults = useCallback(
    (patient: Patient, testName: string): LabResult[] => {
      const results: LabResult[] = [];
      const sortedVisits = [...patient.visits].sort(
        (a, b) =>
          new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime()
      );
      for (const v of sortedVisits) {
        const labs = patient.labsByVisit[v.id];
        if (labs) {
          for (const l of labs) {
            if (l.testName === testName) results.push(l);
          }
        }
      }
      return results;
    },
    []
  );

  // Patients with flagged results
  const criticalCount = useMemo(() => {
    let count = 0;
    for (const p of patients) {
      for (const labs of Object.values(p.labsByVisit)) {
        if (labs.some((l) => l.flag === "KRITIS")) count++;
      }
    }
    return count;
  }, [patients]);

  function getFlagColor(flag: string | null): string {
    return FLAG_COLORS[flag || ""] || "bg-gray-500/10 text-gray-300 border-gray-500/15";
  }

  function toggleExpand(test: string) {
    setExpandedTests((prev) => {
      const next = new Set(prev);
      if (next.has(test)) next.delete(test);
      else next.add(test);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Beaker className="h-5 w-5 text-neon" />
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Lab Browser
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {criticalCount > 0 && (
              <span className="text-red-400 font-medium">
                ⚠️ {criticalCount} pasien dengan hasil KRITIS
                <span className="text-muted-foreground font-normal"> · </span>
              </span>
            )}
            {patients.length} pasien · {rooms.length} ruangan
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari pasien..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground"
          value={roomFilter}
          onChange={(e) => setRoomFilter(e.target.value)}
        >
          <option value="">Semua Ruangan</option>
          {rooms.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          className="px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground"
          value={flagFilter}
          onChange={(e) => setFlagFilter(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="KRITIS">KRITIS</option>
          <option value="Bermakna">Bermakna</option>
          <option value="Normal">Normal</option>
        </select>
      </div>

      {/* Patient list + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4">
        {/* Patient sidebar */}
        <Card className="h-[calc(100vh-280px)] overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-neon" />
              Daftar Pasien
              <Badge variant="secondary" className="ml-auto">
                {patients.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto h-[calc(100%-50px)]">
            {patients.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Tidak ada pasien ditemukan
              </div>
            ) : (
              <div className="divide-y divide-border">
                {patients.map((p) => {
                  const hasKritis = Object.values(p.labsByVisit).some((labs) =>
                    labs.some((l) => l.flag === "KRITIS")
                  );
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPatient(p)}
                      className={`w-full text-left px-3 py-2.5 hover:bg-accent/50 transition-colors ${
                        selectedPatient?.id === p.id
                          ? "bg-neon/10 border-l-2 border-neon"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            MR#{p.medicalRecordNo}
                            {p.room && ` · ${p.room}`}
                            {p.bed && ` ${p.bed}`}
                          </p>
                          {p.visits[0]?.diagnosisPrimary && (
                            <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">
                              {p.visits[0].diagnosisPrimary}
                            </p>
                          )}
                        </div>
                        {hasKritis && (
                          <Badge className="shrink-0 text-[9px] bg-red-500/20 text-red-300 border-red-500/30">
                            KRITIS
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lab detail panel */}
        <Card className="h-[calc(100vh-280px)] overflow-hidden">
          {!selectedPatient ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              <div className="text-center space-y-2">
                <Beaker className="h-12 w-12 mx-auto text-muted-foreground/30" />
                <p>Pilih pasien untuk melihat hasil laboratorium</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Patient header */}
              <div className="p-4 border-b border-border">
                <h2 className="text-base font-bold">{selectedPatient.name}</h2>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-1">
                  <span>MR# {selectedPatient.medicalRecordNo}</span>
                  {selectedPatient.room && (
                    <span>
                      {selectedPatient.room}{selectedPatient.bed ? ` ${selectedPatient.bed}` : ""}
                    </span>
                  )}
                  {selectedPatient.dpjp && <span>DPJP: {selectedPatient.dpjp}</span>}
                  {selectedPatient.visits[0]?.visitDate && (
                    <span>Kunjungan terakhir: {selectedPatient.visits[0].visitDate}</span>
                  )}
                </div>
                {selectedPatient.visits[0]?.diagnosisPrimary && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      {selectedPatient.visits[0].diagnosisPrimary}
                    </Badge>
                    {selectedPatient.visits[0].diagnosisSecondary && (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        {selectedPatient.visits[0].diagnosisSecondary}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Test search */}
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Filter pemeriksaan..."
                    className="pl-7 h-8 text-xs"
                    value={testFilter}
                    onChange={(e) => setTestFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-0.5">
                  {filteredTestNames.map((testName) => {
                    const result = getLatestResult(selectedPatient, testName);
                    if (flagFilter && result?.flag !== flagFilter) return null;
                    if (!result) return null;

                    const allResults = getAllResults(selectedPatient, testName);
                    const isExpanded = expandedTests.has(testName);

                    return (
                      <div key={testName}>
                        <button
                          onClick={() => toggleExpand(testName)}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors hover:bg-accent/50 ${
                            isExpanded ? "bg-accent/30" : ""
                          }`}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                          )}
                          <span className="flex-1 text-left font-medium">
                            {testName}
                          </span>
                          <span className="font-mono font-semibold">
                            {result.result || "-"}
                          </span>
                          {result.unit && (
                            <span className="text-[10px] text-muted-foreground">
                              {result.unit}
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${getFlagColor(
                              result.flag
                            )}`}
                          >
                            {result.flag || "Normal"}
                          </span>
                        </button>

                        {isExpanded && allResults.length > 0 && (
                          <div className="ml-6 pl-2 border-l border-border space-y-0.5">
                            {allResults.map((r) => (
                              <div
                                key={r.id}
                                className="flex items-center gap-2 px-2 py-1 text-[10px] text-muted-foreground"
                              >
                                <span className="w-24 shrink-0">
                                  {r.createdAt?.split("T")[0] || "-"}
                                </span>
                                <span className="font-mono font-medium text-foreground">
                                  {r.result || "-"}
                                </span>
                                {r.unit && (
                                  <span className="text-[9px]">{r.unit}</span>
                                )}
                                {r.referenceRange && (
                                  <span className="text-[9px] opacity-60">
                                    (ref: {r.referenceRange})
                                  </span>
                                )}
                                <span
                                  className={`px-1 py-0.5 rounded text-[8px] font-medium border ${getFlagColor(
                                    r.flag
                                  )}`}
                                >
                                  {r.flag || "N"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
