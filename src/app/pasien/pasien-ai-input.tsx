"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, Sparkles, Check, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPatientWithVisit, findPatientByName } from "@/app/actions";
import { useRouter } from "next/navigation";

type ExtractedSections = {
  identitas: string;
  diagnosa: string;
  subjektif: string;
  objektif: string;
  pemeriksaan_penunjang: string;
  terapi: string;
};

type ExtractedData = {
  sections: ExtractedSections;
  patient: { name: string | null; birth_date: string | null; sex: string | null; parent_name: string | null; phone: string | null; medical_record_no: string | null };
  visit: { visit_date: string; chief_complaint: string | null; anamnesis: string | null; physical_exam: string | null; diagnosis_primary: string | null; diagnosis_secondary: string | null; therapy: string | null; notes: string | null };
  labs?: { test_name: string; result?: string | null; unit?: string | null; reference_range?: string | null; flag?: string | null }[];
  medications?: { drug_name: string; dose?: string | null; frequency?: string | null; duration?: string | null; route?: string | null; notes?: string | null }[];
};

type Message = { role: "user" | "assistant" | "system"; content: string; data?: ExtractedData; mode?: string };

const EXAMPLE_PROMPTS = [
  "An. Budi 5 tahun, demam 4 hari, batuk pilek, faring hiperemis. Dx: Demam Tifoid. Rx: Paracetamol 3x250mg, Amoksisilin 3x500mg.",
  "An. Sari 3 thn, BB 13kg, sesak 2 hari, wheezing bilateral. Riwayat asma. Dx: Asma eksaserbasi akut. Rx: Salbutamol nebulasi.",
];

export function PasienAIInput() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<ExtractedData | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, preview]);

  async function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content }]);
    setLoading(true);
    setPreview(null);
    setDuplicateWarning(null);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { role: "system", content: data.error }]);
      } else if (data.data) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Data terekstrak. Review lalu klik Simpan." }]);
        setPreview(data.data);
        if (data.data.patient?.name) {
          const existing = await findPatientByName(data.data.patient.name);
          if (existing.length > 0) setDuplicateWarning(data.data.patient.name);
        }
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "system", content: e instanceof Error ? e.message : "Error" }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!preview || saving) return;
    setSaving(true);
    try {
      const result = await createPatientWithVisit({
        patient: {
          name: preview.patient.name!,
          birthDate: preview.patient.birth_date || undefined,
          sex: preview.patient.sex || undefined,
          parentName: preview.patient.parent_name || undefined,
          phone: preview.patient.phone || undefined,
          medicalRecordNo: preview.patient.medical_record_no || undefined,
        },
        visit: {
          visitDate: preview.visit.visit_date,
          chiefComplaint: preview.visit.chief_complaint || undefined,
          anamnesis: preview.visit.anamnesis || undefined,
          physicalExam: preview.visit.physical_exam || undefined,
          diagnosisPrimary: preview.visit.diagnosis_primary || undefined,
          diagnosisSecondary: preview.visit.diagnosis_secondary || undefined,
          therapy: preview.visit.therapy || undefined,
          notes: preview.visit.notes || undefined,
          sections: preview.sections || undefined,
        },
        labs: preview.labs?.filter((l) => l.test_name).map((l) => ({
          testName: l.test_name, result: l.result ?? undefined, unit: l.unit ?? undefined, referenceRange: l.reference_range ?? undefined, flag: l.flag ?? undefined,
        })),
        medications: preview.medications?.filter((m) => m.drug_name).map((m) => ({
          drugName: m.drug_name, dose: m.dose ?? undefined, frequency: m.frequency ?? undefined, duration: m.duration ?? undefined, route: m.route ?? undefined,
        })),
      });
      setMessages((prev) => [...prev, { role: "system", content: `✅ Pasien "${result.patient.name}" berhasil dibuat!` }]);
      setPreview(null);
      setTimeout(() => router.push(`/pasien/${result.patient.id}`), 1200);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "system", content: "❌ Gagal: " + (e instanceof Error ? e.message : "Unknown") }]);
    } finally {
      setSaving(false);
    }
  }

  const SECTION_LABELS: Record<string, string> = {
    identitas: "Identitas", diagnosa: "Diagnosa", subjektif: "Subjektif",
    objektif: "Objektif", pemeriksaan_penunjang: "Penunjang", terapi: "Terapi",
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-neon text-background px-4 py-3 shadow-lg hover:bg-neon/90 transition-all hover:scale-105"
      >
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium">AI Input</span>
      </button>

      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[min(420px,calc(100vw-2rem))] h-[min(600px,calc(100vh-2rem))] rounded-xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-2 p-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neon/20">
                <Bot className="h-3.5 w-3.5 text-neon" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">AI Input Pasien</p>
                <p className="text-[10px] text-muted-foreground">Paste laporan → buat pasien baru</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)} className="h-7 w-7 p-0">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && !preview && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground text-center pt-2">
                  Paste laporan pasien, AI akan extract & buat data pasien baru.
                </p>
                <div className="space-y-1.5">
                  {EXAMPLE_PROMPTS.map((ex, i) => (
                    <button key={i} onClick={() => handleSend(ex)}
                      className="block w-full text-left text-[11px] p-2 rounded border border-border bg-muted/20 hover:bg-muted/40 transition-colors">
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={`max-w-[85%] rounded-lg p-2.5 text-xs ${m.role === "user" ? "bg-neon/20" : m.content.startsWith("✅") ? "border border-green-500/30 bg-green-500/5 text-green-200" : m.content.startsWith("❌") ? "border border-destructive/30 bg-destructive/5 text-destructive" : "bg-muted/40"}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    {m.role === "user" ? <User className="h-2.5 w-2.5 text-neon" /> : <Bot className="h-3 w-3 text-neon" />}
                    <span className="text-[10px] font-semibold">{m.role === "user" ? "Anda" : "AI"}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}

            {preview && (
              <div className="rounded-lg border border-neon/30 bg-neon/5 p-2.5 text-xs space-y-2">
                <p className="text-[10px] font-semibold text-neon uppercase tracking-wider">Preview Pasien Baru</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                  <div><span className="text-muted-foreground">Nama: </span>{preview.patient.name}</div>
                  <div><span className="text-muted-foreground">RM: </span>{preview.patient.medical_record_no || "-"}</div>
                  <div><span className="text-muted-foreground">Lahir: </span>{preview.patient.birth_date || "-"}</div>
                  <div><span className="text-muted-foreground">JK: </span>{preview.patient.sex || "-"}</div>
                </div>
                {preview.visit.diagnosis_primary && (
                  <div className="text-[11px]"><span className="text-muted-foreground">Dx: </span>{preview.visit.diagnosis_primary}</div>
                )}
                {preview.sections && (
                  <div className="space-y-1 mt-1">
                    {Object.entries(preview.sections).filter(([, v]) => v).map(([key, val]) => (
                      <details key={key} className="rounded border border-border overflow-hidden group">
                        <summary className="px-2 py-1.5 bg-muted/20 text-[10px] font-semibold text-neon cursor-pointer hover:bg-muted/40 list-none flex items-center justify-between">
                          <span>{SECTION_LABELS[key] || key}</span>
                          <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
                        </summary>
                        <div className="px-2 py-1.5 text-[10px] text-foreground whitespace-pre-wrap font-mono leading-relaxed max-h-32 overflow-y-auto">{val}</div>
                      </details>
                    ))}
                  </div>
                )}
                {duplicateWarning && (
                  <p className="text-[10px] text-yellow-200">⚠️ Pasien "{duplicateWarning}" sudah ada.</p>
                )}
                <Button size="sm" onClick={handleSave} disabled={saving} className="w-full h-8 text-xs">
                  {saving ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Menyimpan...</> : <><Check className="h-3 w-3 mr-1" />Simpan Pasien Baru</>}
                </Button>
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>AI mengekstrak...</span>
              </div>
            )}
          </div>

          <div className="border-t border-border p-2 flex gap-2">
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Paste laporan pasien..." rows={2}
              className="flex-1 min-h-[40px] max-h-24 resize-none rounded-md border border-border bg-background px-2 py-1.5 text-xs focus:border-neon focus:outline-none" />
            <Button size="icon" onClick={() => handleSend()} disabled={loading || !input.trim()} className="h-10 w-10">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
