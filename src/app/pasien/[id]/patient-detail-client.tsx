"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowLeft, User, Phone, Calendar, FileText, Beaker, Pill,
  ChevronDown, ChevronRight, ExternalLink, Stethoscope, ClipboardList, Activity, TestTube, Syringe, Upload,
  RefreshCw, ScanLine
} from "lucide-react";
import Link from "next/link";
import { DeletePatientButton } from "./delete-button";
import { DeleteVisitButton } from "./delete-visit-button";
import { AddVisitDialogWrapper } from "./add-visit-dialog";
import { PatientAIOverlay } from "./patient-ai-overlay";
import { SimrsDataCard } from "./simrs-data-card";
import { CpptSection } from "./cppt-section";
import { EditPatientDialog } from "./edit-patient-dialog";
import { EditVisitDialog } from "./edit-visit-dialog";
import { GrowthChartCard } from "@/components/growth-chart";
import { VisitGrowthCurve } from "@/components/visit-growth-curve";
import { LabExtractModal } from "@/components/lab-extract-modal";

type Patient = {
  id: string; name: string; birthDate: string | null; sex: string | null;
  medicalRecordNo: string | null; parentName: string | null; phone: string | null; address: string | null;
  room: string | null; bed: string | null;
};

type Visit = {
  id: string; patientId: string; visitDate: string;
  chiefComplaint: string | null; anamnesis: string | null; physicalExam: string | null;
  weightKg: string | null; heightCm: string | null; headCircumferenceCm: string | null;
  diagnosisPrimary: string | null; diagnosisSecondary: string | null;
  therapy: string | null; notes: string | null;
  sections: Record<string, string> | null;
  createdAt: Date; updatedAt: Date;
};

type LabResult = {
  id: string; visitId: string; testName: string; result: string | null;
  unit: string | null; referenceRange: string | null; flag: string | null; createdAt: Date;
};

type SpecialResult = {
  id: string;
  jenis: string;
  tanggal: string | null;
  klinis: string | null;
  kesan: string | null;
  kesimpulan: string | null;
  hasil: string | null;
  accession: string | null;
  viewerUrl: string | null;
  state: string | null;
  detail: Record<string, unknown> | null;
};

type Medication = {
  id: string; visitId: string; drugName: string; dose: string | null;
  frequency: string | null; duration: string | null; route: string | null;
  notes: string | null; createdAt: Date;
};

const SECTION_META: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  identitas: { label: "Identitas", icon: User, color: "text-blue-400" },
  diagnosa: { label: "Diagnosa / Assessment", icon: Stethoscope, color: "text-red-400" },
  subjektif: { label: "Subjektif", icon: ClipboardList, color: "text-yellow-400" },
  objektif: { label: "Objektif", icon: Activity, color: "text-green-400" },
  pemeriksaan_penunjang: { label: "Pemeriksaan Penunjang", icon: TestTube, color: "text-purple-400" },
  terapi: { label: "Terapi", icon: Syringe, color: "text-cyan-400" },
};
const SECTION_ORDER = ["identitas", "diagnosa", "subjektif", "objektif", "pemeriksaan_penunjang", "terapi"];

export function PatientDetailClient({
  patient, visits, labsByVisit, medsByVisit, specials,
}: {
  patient: Patient; visits: Visit[];
  labsByVisit: Record<string, LabResult[]>; medsByVisit: Record<string, Medication[]>;
  specials?: SpecialResult[];
}) {
  const [expandedVisit, setExpandedVisit] = useState<string | null>(null);
  const [popupVisit, setPopupVisit] = useState<Visit | null>(null);
  const [popupSections, setPopupSections] = useState<Record<string, string>>({});
  const [expandedPopupSection, setExpandedPopupSection] = useState<string | null>(null);

  const age = patient.birthDate ? calculateAge(patient.birthDate) : null;
  const latestVisit = visits[0] ?? null;

  function openFullReport(v: Visit) {
    setPopupVisit(v);
    let s: Record<string, string> | null = null;
    if (v.sections) {
      // Handle both object and stringified JSON
      if (typeof v.sections === "string") {
        try { s = JSON.parse(v.sections); } catch { s = null; }
      } else if (typeof v.sections === "object" && v.sections !== null) {
        s = v.sections as Record<string, string>;
      }
    }
    if (s && Object.keys(s).length > 0) {
      setPopupSections(s);
    } else {
      const fallback: Record<string, string> = {};
      if (v.chiefComplaint) fallback.subjektif = `Keluhan Utama: ${v.chiefComplaint}`;
      if (v.anamnesis) {
        fallback.subjektif = fallback.subjektif
          ? `${fallback.subjektif}\n\n${v.anamnesis}`
          : v.anamnesis;
      }
      if (v.physicalExam) fallback.objektif = v.physicalExam;
      if (v.therapy) fallback.terapi = v.therapy;
      if (v.diagnosisPrimary || v.diagnosisSecondary) {
        fallback.diagnosa = [v.diagnosisPrimary, v.diagnosisSecondary].filter(Boolean).join("\n");
      }
      // Anthropometry
      const antro: string[] = [];
      if (v.weightKg) antro.push(`BB: ${v.weightKg} kg`);
      if (v.heightCm) antro.push(`TB: ${v.heightCm} cm`);
      if (v.headCircumferenceCm) antro.push(`LK: ${v.headCircumferenceCm} cm`);
      if (antro.length > 0) {
        fallback.objektif = fallback.objektif
          ? `Antropometri: ${antro.join(", ")}\n\n${fallback.objektif}`
          : `Antropometri: ${antro.join(", ")}`;
      }
      if (v.notes) fallback.identitas = v.notes;
      setPopupSections(fallback);
    }
    setExpandedPopupSection(null);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href="/pasien" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl truncate">{patient.name}</h1>
          <p className="text-sm text-muted-foreground">
            {patient.sex === "L" ? "Laki-laki" : patient.sex === "P" ? "Perempuan" : "-"}
            {age && ` · ${age}`}
            {patient.medicalRecordNo && ` · RM: ${patient.medicalRecordNo}`}
            {patient.room && ` · ${patient.room}${patient.bed ? ` / ${patient.bed}` : ""}`}
          </p>
        </div>
        <EditPatientDialog patient={patient} />
        <DeletePatientButton id={patient.id} name={patient.name} />
      </div>

      {/* External data links (SIMRS live + Hema lookup) */}
      {patient.medicalRecordNo && (
        <div className="flex flex-wrap gap-2">
          <a
            href={`https://sirs.kay.web.id/testing?norm=${encodeURIComponent(patient.medicalRecordNo)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 text-xs border-red-500/40 text-red-300 hover:bg-red-500/10 hover:text-red-200" })}
          >
            <Activity className="h-3.5 w-3.5" />
            SIMRS Live
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
          <a
            href={`https://hema.ark-kay.my.id/lookup.html?norm=${encodeURIComponent(patient.medicalRecordNo)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm", className: "gap-1.5 text-xs border-blue-500/40 text-blue-300 hover:bg-blue-500/10 hover:text-blue-200" })}
          >
            <TestTube className="h-3.5 w-3.5" />
            Lab Lookup (Hema)
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </div>
      )}

      {/* Data Pasien */}
      <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium">Data Pasien</CardTitle>
            {patient.medicalRecordNo && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs gap-1"
                title="Segarkan data live dari SIMRS"
                onClick={async (e) => {
                  e.stopPropagation();
                  window.location.reload();
                }}
              >
                <RefreshCw className="h-3 w-3" /> Segarkan
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {patient.parentName && <Row icon={User} label="Orang Tua" value={patient.parentName} />}
            {patient.phone && <Row icon={Phone} label="Telepon" value={patient.phone} />}
            {patient.birthDate && <Row icon={Calendar} label="Tgl Lahir" value={patient.birthDate} />}
            {patient.address && <Row icon={FileText} label="Alamat" value={patient.address} multiline />}
            {!patient.parentName && !patient.phone && !patient.birthDate && !patient.address && (
              <p className="text-muted-foreground text-sm">Belum ada data tambahan</p>
            )}
          </CardContent>
      </Card>

      {/* Data RS Live (SIMRS via Hema) */}
      {patient.medicalRecordNo && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-neon" />
              Data RS Live (SIMRS)
            </CardTitle>
            <a
              href={`https://hema.ark-kay.my.id/lookup.html?norm=${encodeURIComponent(patient.medicalRecordNo)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "text-xs gap-1.5 border-blue-500/40 text-blue-300 hover:bg-blue-500/10",
              })}
            >
              <TestTube className="h-3 w-3" />
              Buka di Hema
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </CardHeader>
          <CardContent className="pt-3">
            <SimrsDataCard norm={patient.medicalRecordNo} patientId={patient.id} />
          </CardContent>
        </Card>
      )}

      {/* Hasil Special tersimpan (PA/RAD/BMP/LCS/Imuno/IHC) */}
      {specials && specials.length > 0 && (
        <SavedSpecialCard specials={specials} />
      )}

      {/* CPPT History (SIMRS) */}
      {patient.medicalRecordNo && (
        <CpptSection norm={patient.medicalRecordNo} />
      )}

      {/* Growth Chart */}
      {patient.birthDate && patient.sex && (visits.some(v => v.weightKg || v.heightCm || v.headCircumferenceCm)) && (
        <GrowthChartCard
          patientSex={patient.sex as "L" | "P"}
          birthDate={patient.birthDate}
          measurements={visits
            .map((v) => ({
              visitId: v.id,
              visitDate: v.visitDate,
              ageMonths: calcAgeMonths(patient.birthDate!, v.visitDate),
              weightKg: v.weightKg,
              heightCm: v.heightCm,
              headCircumferenceCm: v.headCircumferenceCm,
            }))
            .filter((m) => m.ageMonths >= 0)}
        />
      )}

      {/* Visit History */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-neon" />
            Riwayat Kunjungan ({visits.length})
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <AddVisitDialogWrapper patientId={patient.id} compact />
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <ClipboardList className="h-3 w-3" /> SOAP Creator
            </Button>
            {latestVisit && (
              <LabExtractModal
                visitId={latestVisit.id}
                patientName={patient.name}
                onSave={() => window.location.reload()}
                trigger={
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                    <Beaker className="h-3 w-3" /> Tambah Lab
                  </Button>
                }
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {visits.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">Belum ada kunjungan</p>
              <div className="mt-3 flex justify-center"><AddVisitDialogWrapper patientId={patient.id} /></div>
            </div>
          ) : (
            <div className="space-y-2">
              {visits.map((v) => {
                const isExpanded = expandedVisit === v.id;
                const sections = v.sections as Record<string, string> | null;
                const subjektif = sections?.subjektif || v.anamnesis;
                const terapi = sections?.terapi || v.therapy;
                const labs = labsByVisit[v.id] ?? [];
                const meds = medsByVisit[v.id] ?? [];

                return (
                  <div key={v.id} className="rounded-lg border border-border bg-card overflow-hidden">
                    <button
                      onClick={() => setExpandedVisit(isExpanded ? null : v.id)}
                      className="w-full flex items-center justify-between gap-2 p-3 text-left hover:bg-muted/20 transition-colors min-h-[48px]"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                        <Badge variant="outline" className="text-xs font-mono shrink-0">{v.visitDate}</Badge>
                        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                          {v.diagnosisPrimary && (
                            <Badge variant="default" className="text-xs truncate max-w-[250px]">{v.diagnosisPrimary}</Badge>
                          )}
                          {v.diagnosisSecondary && (
                            <Badge variant="secondary" className="text-xs truncate max-w-[200px]">{v.diagnosisSecondary}</Badge>
                          )}
                        </div>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    <div className="flex items-center gap-2 px-3 pb-2">
                      <button
                        onClick={() => openFullReport(v)}
                        className="text-xs text-neon hover:underline flex items-center gap-1.5 py-1 min-h-[36px]"
                      >
                        <FileText className="h-3.5 w-3.5" /> Buka Laporan Lengkap
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-3 border-t border-border/50">
                        {/* Anthropometry */}
                        {(v.weightKg || v.heightCm || v.headCircumferenceCm) && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold text-neon uppercase tracking-wider mb-1">Antropometri</p>
                            <div className="flex flex-wrap gap-3 text-sm font-mono">
                              {v.weightKg && <Badge variant="outline" className="text-xs">BB: {v.weightKg} kg</Badge>}
                              {v.heightCm && <Badge variant="outline" className="text-xs">TB: {v.heightCm} cm</Badge>}
                              {v.headCircumferenceCm && <Badge variant="outline" className="text-xs">LK: {v.headCircumferenceCm} cm</Badge>}
                            </div>
                          </div>
                        )}
                        {/* Mini Growth Chart */}
                        {patient.birthDate && patient.sex && (v.weightKg || v.heightCm || v.headCircumferenceCm) && (
                          <VisitGrowthCurve
                            sex={patient.sex as "L" | "P"}
                            weightKg={v.weightKg}
                            heightCm={v.heightCm}
                            headCircumferenceCm={v.headCircumferenceCm}
                            ageMonths={calcAgeMonths(patient.birthDate, v.visitDate)}
                          />
                        )}
                        {subjektif && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold text-neon uppercase tracking-wider mb-0.5">Subjektif</p>
                            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{subjektif}</p>
                          </div>
                        )}
                        {terapi && (
                          <div>
                            <p className="text-xs font-semibold text-neon uppercase tracking-wider mb-0.5">Terapi</p>
                            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{terapi}</p>
                          </div>
                        )}
                        {(labs.length > 0 || meds.length > 0) && (
                          <div className="grid gap-2 sm:grid-cols-2 pt-1">
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                  <Beaker className="h-3 w-3" /> Lab ({labs.length})
                                </p>
                                <LabExtractModal
                                  visitId={v.id}
                                  onSave={() => window.location.reload()}
                                  trigger={
                                    <span className="text-[10px] text-neon hover:underline cursor-pointer flex items-center gap-0.5">
                                      <Upload className="h-2.5 w-2.5" /> Upload
                                    </span>
                                  }
                                />
                              </div>
                              <div className="space-y-0.5">
                                {labs.length === 0 ? (
                                  <p className="text-xs text-muted-foreground italic">Belum ada data lab</p>
                                ) : (
                                  labs.map((l) => (
                                    <div key={l.id} className="text-xs font-mono">
                                      {l.testName}: {l.result ?? "-"} {l.unit ?? ""}
                                      {l.flag && <span className={l.flag === "high" || l.flag === "low" ? "text-yellow-500 ml-1" : "text-green-500 ml-1"}>({l.flag})</span>}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                            {meds.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-0.5">
                                  <Pill className="h-3 w-3" /> Obat ({meds.length})
                                </p>
                                <div className="space-y-0.5">
                                  {meds.map((m) => (
                                    <div key={m.id} className="text-xs font-mono">
                                      {m.drugName} {m.dose ? `(${m.dose})` : ""} {m.frequency ? `- ${m.frequency}` : ""} {m.duration ? `× ${m.duration}` : ""}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-1">
                          <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => openFullReport(v)}>
                            <ExternalLink className="h-3 w-3" /> Laporan Lengkap
                          </Button>
                          <div className="flex-1" />
                          <EditVisitDialog visit={v} />
                          <DeleteVisitButton id={v.id} patientId={patient.id} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Report Popup */}
      <Dialog open={!!popupVisit} onOpenChange={(open) => { if (!open) setPopupVisit(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-neon" />
              Laporan Lengkap — {popupVisit?.visitDate}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {SECTION_ORDER.map((key) => {
              const text = popupSections[key];
              if (!text) return null;
              const meta = SECTION_META[key];
              const Icon = meta.icon;
              const isOpen = expandedPopupSection === key;
              return (
                <div key={key} className="rounded-lg border border-border overflow-hidden">
                  <button
                    onClick={() => setExpandedPopupSection(isOpen ? null : key)}
                    className="w-full flex items-center gap-2 px-3 py-3 bg-muted/20 text-left text-sm font-semibold hover:bg-muted/40 transition-colors min-h-[44px]"
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${meta.color}`} />
                    <span className="flex-1">{meta.label}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-3 py-3 text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed max-h-60 overflow-y-auto border-t border-border/50 bg-card">
                      {text}
                    </div>
                  )}
                </div>
              );
            })}
            {Object.keys(popupSections).length === 0 && (
              <div className="text-center py-4 space-y-2">
                <p className="text-sm text-muted-foreground">Tidak ada data sections untuk kunjungan ini.</p>
                <p className="text-xs text-muted-foreground/70">Data bisa ditambahkan melalui AI Input atau Edit Kunjungan.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PatientAIOverlay patientId={patient.id} patientName={patient.name} />
    </div>
  );
}

function Row({ icon: Icon, label, value, multiline }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; multiline?: boolean }) {
  return (
    <div className={multiline ? "space-y-0.5" : "flex items-start gap-2"}>
      <span className="text-muted-foreground flex items-center gap-1 min-w-[80px] text-xs uppercase tracking-wider">
        <Icon className="h-3 w-3" />{label}
      </span>
      <span className={`flex-1 text-foreground ${multiline ? "whitespace-pre-wrap break-words" : "break-words"}`}>{value}</span>
    </div>
  );
}

function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 1) return `${Math.max(0, Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)))} hari`;
  if (months < 24) return `${months} bulan`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return remMonths > 0 ? `${years} thn ${remMonths} bln` : `${years} tahun`;
}

function calcAgeMonths(birthDate: string, referenceDate: string): number {
  const birth = new Date(birthDate);
  const ref = new Date(referenceDate);
  const months = (ref.getFullYear() - birth.getFullYear()) * 12 + (ref.getMonth() - birth.getMonth());
  if (ref.getDate() < birth.getDate()) return months - 1;
  return Math.max(0, months);
}

const SPECIAL_JENIS_LABEL: Record<string, string> = {
  pa: "Patologi Anatomi",
  rad: "Radiologi",
  bmp: "BMP",
  lcs: "LCS",
  immuno: "Imunologi",
  ihc: "IHC",
};

function SavedSpecialCard({ specials }: { specials: SpecialResult[] }) {
  const [open, setOpen] = useState(false);
  const grouped = useMemo(() => {
    const g = new Map<string, SpecialResult[]>();
    for (const s of specials) {
      if (!g.has(s.jenis)) g.set(s.jenis, []);
      g.get(s.jenis)!.push(s);
    }
    return [...g.entries()];
  }, [specials]);

  return (
    <Card className="py-0 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-accent/30 transition-colors"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span className="text-sm font-medium flex items-center gap-2 flex-1 min-w-0">
          <ScanLine className="h-3.5 w-3.5 text-neon shrink-0" />
          Hasil Special Tersimpan
        </span>
        <Badge variant="secondary" className="text-[9px] shrink-0">
          {specials.length} item
        </Badge>
      </button>
      {open && (
        <CardContent className="pt-0 pb-4 space-y-3 border-t border-border/50">
          {grouped.map(([jenis, items]) => (
            <div key={jenis}>
              <p className="text-xs font-semibold text-neon uppercase tracking-wider mt-3 mb-1">
                {SPECIAL_JENIS_LABEL[jenis] ?? jenis} ({items.length})
              </p>
              <div className="space-y-2">
                {items.map((s) => (
                  <div key={s.id} className="rounded-lg border border-border bg-card/50 p-3 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {s.tanggal && (
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {s.tanggal}
                        </Badge>
                      )}
                      {s.state && (
                        <Badge variant="outline" className="text-[9px]">
                          {s.state}
                        </Badge>
                      )}
                      {s.viewerUrl && (
                        <a
                          href={s.viewerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-neon hover:underline"
                        >
                          Buka PACS
                        </a>
                      )}
                    </div>
                    {s.klinis && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold">Klinis:</span> {s.klinis}
                      </p>
                    )}
                    {s.kesan && (
                      <p className="text-xs text-foreground whitespace-pre-wrap">
                        <span className="font-semibold">Kesan:</span> {s.kesan}
                      </p>
                    )}
                    {s.kesimpulan && (
                      <p className="text-xs text-foreground whitespace-pre-wrap">
                        <span className="font-semibold">Kesimpulan:</span> {s.kesimpulan}
                      </p>
                    )}
                    {s.hasil && !s.kesan && !s.kesimpulan && (
                      <p className="text-xs text-foreground whitespace-pre-wrap">{s.hasil}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
