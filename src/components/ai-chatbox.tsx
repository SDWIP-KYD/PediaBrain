"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, Sparkles, Check, AlertCircle, User, FileText, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPatientWithVisit, findPatientByName, createNote, createFollowUp } from "@/app/actions";
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
  patient: {
    name: string | null;
    birth_date: string | null;
    sex: string | null;
    parent_name: string | null;
    phone: string | null;
    medical_record_no: string | null;
  };
  visit: {
    visit_date: string;
    chief_complaint: string | null;
    anamnesis: string | null;
    physical_exam: string | null;
    diagnosis_primary: string | null;
    diagnosis_secondary: string | null;
    therapy: string | null;
    notes: string | null;
  };
  labs?: { test_name: string; result?: string | null; unit?: string | null; reference_range?: string | null; flag?: string | null }[];
  medications?: { drug_name: string; dose?: string | null; frequency?: string | null; duration?: string | null; route?: string | null; notes?: string | null }[];
};

type Message = { role: "user" | "assistant" | "system"; content: string; data?: ExtractedData; mode?: string; error?: string; intent?: string };

const EXAMPLE_PROMPTS = [
  "Pasien An. Budi, 5 tahun, datang dengan demam 4 hari, batuk pilek, faring hiperemis. Diagnosis: Demam Tifoid. Therapy: Paracetamol 3x250mg, Amoksisilin 3x500mg. Lab: DL, Widal.",
  "Catatan: penting untuk diingat bahwa rotavirus adalah penyebab utama gastroenteritis pada anak di bawah 5 tahun",
  "Follow-up: An. Sari kontrol 3 hari lagi untuk cek kadar leukosit setelah antibiotik",
  "Apa bedanya bronkitis dan pneumonia pada anak?",
];

export function AIChatbox() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{ name: string; existing: { id: string; name: string }[] } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  async function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content }]);
    setLoading(true);
    setDuplicateWarning(null);
    try {
      const historyForApi = messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history: historyForApi }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { role: "system", content: data.error, error: data.detail }]);
        return;
      }

      if (data.intent === "chat") {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "Tidak ada jawaban." }]);
        return;
      }

      if (data.intent === "note") {
        const nd = data.data;
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: `📝 Catatan akan disimpan: "${nd.title || 'Tanpa judul'}"`,
          intent: "note",
          data: { noteData: nd } as unknown as ExtractedData,
        }]);
        return;
      }

      if (data.intent === "followup") {
        const fd = data.data;
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: `📅 Follow-up: ${fd.title || 'Tanpa judul'}`,
          intent: "followup",
          data: { followupData: fd } as unknown as ExtractedData,
        }]);
        return;
      }

      // laporan intent
      if (data.data) {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: data.mode === "mock" ? "⚠️ Mode mock (env belum di-set). Preview data di bawah." : "Data berhasil diekstrak. Review di bawah lalu klik Simpan.",
          data: data.data,
          mode: data.mode,
          intent: "laporan",
        }]);
        if (data.data.patient?.name) {
          const existing = await findPatientByName(data.data.patient.name);
          if (existing.length > 0) {
            setDuplicateWarning({ name: data.data.patient.name, existing: existing.map((p) => ({ id: p.id, name: p.name })) });
          }
        }
      } else if (data.raw) {
        setMessages((prev) => [...prev, { role: "system", content: data.raw, error: data.error }]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "system", content: e instanceof Error ? e.message : "Error tidak diketahui" }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveLaporan(data: ExtractedData) {
    if (saving) return;
    setSaving(true);
    try {
      if (!data.patient.name) {
        alert("Nama pasien wajib diisi sebelum menyimpan.");
        setSaving(false);
        return;
      }
      const result = await createPatientWithVisit({
        patient: {
          name: data.patient.name,
          birthDate: data.patient.birth_date || undefined,
          sex: data.patient.sex || undefined,
          parentName: data.patient.parent_name || undefined,
          phone: data.patient.phone || undefined,
          medicalRecordNo: data.patient.medical_record_no || undefined,
        },
        visit: {
          visitDate: data.visit.visit_date,
          chiefComplaint: data.visit.chief_complaint || undefined,
          anamnesis: data.visit.anamnesis || undefined,
          physicalExam: data.visit.physical_exam || undefined,
          diagnosisPrimary: data.visit.diagnosis_primary || undefined,
          diagnosisSecondary: data.visit.diagnosis_secondary || undefined,
          therapy: data.visit.therapy || undefined,
          notes: data.visit.notes || undefined,
          sections: data.sections || undefined,
        },
        labs: data.labs?.filter((l) => l.test_name).map((l) => ({
          testName: l.test_name,
          result: l.result ?? undefined,
          unit: l.unit ?? undefined,
          referenceRange: l.reference_range ?? undefined,
          flag: l.flag ?? undefined,
        })),
        medications: data.medications?.filter((m) => m.drug_name).map((m) => ({
          drugName: m.drug_name,
          dose: m.dose ?? undefined,
          frequency: m.frequency ?? undefined,
          duration: m.duration ?? undefined,
          route: m.route ?? undefined,
          notes: m.notes ?? undefined,
        })),
      });
      setMessages((prev) => [
        ...prev,
        { role: "system", content: `✅ Tersimpan! Pasien "${result.patient.name}" + 1 visit. Buka tab Pasien?` },
      ]);
      setTimeout(() => router.push(`/pasien/${result.patient.id}`), 1500);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "system", content: "❌ Gagal menyimpan: " + (e instanceof Error ? e.message : "Unknown") }]);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveNote(noteData: { title: string; content: string; tags: string[] }) {
    if (saving) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("title", noteData.title || "Catatan Medis");
      fd.set("content", noteData.content || "");
      fd.set("tags", (noteData.tags || []).join(", "));
      await createNote(fd);
      setMessages((prev) => [...prev, { role: "system", content: `✅ Catatan "${noteData.title}" berhasil disimpan!` }]);
      setTimeout(() => router.push("/notes"), 1500);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "system", content: "❌ Gagal menyimpan catatan: " + (e instanceof Error ? e.message : "Unknown") }]);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveFollowUp(fd: { title: string; content: string; dueDate: string }) {
    if (saving) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("title", fd.title || "Follow-up");
      formData.set("content", fd.content || "");
      formData.set("dueDate", fd.dueDate || new Date().toISOString().split("T")[0]);
      formData.set("recurrence", "none");
      await createFollowUp(formData);
      setMessages((prev) => [...prev, { role: "system", content: `✅ Follow-up "${fd.title}" berhasil dibuat!` }]);
      setTimeout(() => router.push("/follow-ups"), 1500);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "system", content: "❌ Gagal menyimpan follow-up: " + (e instanceof Error ? e.message : "Unknown") }]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-neon text-background px-4 py-3 shadow-lg hover:bg-neon/90 transition-all hover:scale-105"
          title="AI Assistant"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">AI Assistant</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[min(420px,calc(100vw-2rem))] h-[min(600px,calc(100vh-2rem))] rounded-xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-2 p-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neon/20">
                <Bot className="h-3.5 w-3.5 text-neon" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">AI Assistant</p>
                <p className="text-[10px] text-muted-foreground">Laporan · Catatan · Follow-up · Chat</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)} className="h-7 w-7 p-0">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground text-center pt-2">
                  AI akan otomatis mendeteksi intent Anda:
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <FileText className="h-3 w-3 text-neon" />
                    <span><strong>Laporan pasien</strong> — extract & simpan ke tab Pasien</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <FileText className="h-3 w-3 text-blue-400" />
                    <span><strong>Catatan</strong> — simpan sebagai note</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <CalendarClock className="h-3 w-3 text-yellow-400" />
                    <span><strong>Follow-up</strong> — jadwalkan tindak lanjut</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Bot className="h-3 w-3 text-green-400" />
                    <span><strong>Chat</strong> — tanya seputar kedokteran anak</span>
                  </div>
                </div>
                <div className="space-y-1.5 mt-2">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Contoh:</p>
                  {EXAMPLE_PROMPTS.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(ex)}
                      className="block w-full text-left text-[11px] p-2 rounded border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <MessageBubble
                key={i}
                message={m}
                onSaveLaporan={handleSaveLaporan}
                onSaveNote={handleSaveNote}
                onSaveFollowUp={handleSaveFollowUp}
                saving={saving}
                duplicateWarning={duplicateWarning}
              />
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>AI sedang memproses...</span>
              </div>
            )}
          </div>

          <div className="border-t border-border p-2 flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ketik laporan, catatan, follow-up, atau tanya apa saja..."
              className="flex-1 min-h-[40px] max-h-24 resize-none rounded-md border border-border bg-background px-2 py-1.5 text-xs focus:border-neon focus:outline-none"
              rows={2}
            />
            <Button size="icon" onClick={() => handleSend()} disabled={loading || !input.trim()} className="h-10 w-10">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function MessageBubble({
  message,
  onSaveLaporan,
  onSaveNote,
  onSaveFollowUp,
  saving,
  duplicateWarning,
}: {
  message: Message;
  onSaveLaporan: (d: ExtractedData) => void;
  onSaveNote: (d: { title: string; content: string; tags: string[] }) => void;
  onSaveFollowUp: (d: { title: string; content: string; dueDate: string }) => void;
  saving: boolean;
  duplicateWarning: { name: string; existing: { id: string; name: string }[] } | null;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg bg-neon/20 text-foreground p-2.5 text-xs">
          <div className="flex items-center gap-1.5 mb-1 text-neon">
            <User className="h-2.5 w-2.5" />
            <span className="text-[10px] font-semibold">Anda</span>
          </div>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.role === "system") {
    return (
      <div className="flex justify-start">
        <div className={`max-w-[90%] rounded-lg p-2.5 text-xs ${
          message.content.startsWith("✅")
            ? "border border-green-500/30 bg-green-500/5 text-green-200"
            : "border border-destructive/30 bg-destructive/5 text-destructive"
        }`}>
          <p>{message.content}</p>
        </div>
      </div>
    );
  }

  // assistant
  if (message.intent === "note") {
    const nd = (message.data as unknown as { noteData: { title: string; content: string; tags: string[] } })?.noteData;
    return (
      <div className="flex justify-start">
        <div className="max-w-[95%] space-y-2">
          <div className="rounded-lg bg-muted/40 p-2.5 text-xs">
            <div className="flex items-center gap-1.5 mb-1.5">
              <FileText className="h-3 w-3 text-blue-400" />
              <span className="text-[10px] font-semibold">Catatan</span>
            </div>
            <p>{message.content}</p>
          </div>
          {nd && (
            <div className="rounded-lg border border-blue-400/30 bg-blue-400/5 p-2.5 text-xs space-y-2">
              <p className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider">Preview Catatan</p>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground">Judul:</p>
                <p className="text-[11px]">{nd.title}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground">Isi:</p>
                <p className="text-[11px] whitespace-pre-wrap max-h-32 overflow-y-auto">{nd.content}</p>
              </div>
              {nd.tags && nd.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {nd.tags.map((t, i) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">#{t}</span>
                  ))}
                </div>
              )}
              <Button size="sm" onClick={() => onSaveNote(nd)} disabled={saving} className="w-full h-8 text-xs">
                {saving ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Menyimpan...</> : <><Check className="h-3 w-3 mr-1" />Simpan Catatan</>}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (message.intent === "followup") {
    const fd = (message.data as unknown as { followupData: { title: string; content: string; dueDate: string } })?.followupData;
    return (
      <div className="flex justify-start">
        <div className="max-w-[95%] space-y-2">
          <div className="rounded-lg bg-muted/40 p-2.5 text-xs">
            <div className="flex items-center gap-1.5 mb-1.5">
              <CalendarClock className="h-3 w-3 text-yellow-400" />
              <span className="text-[10px] font-semibold">Follow-up</span>
            </div>
            <p>{message.content}</p>
          </div>
          {fd && (
            <div className="rounded-lg border border-yellow-400/30 bg-yellow-400/5 p-2.5 text-xs space-y-2">
              <p className="text-[10px] font-semibold text-yellow-300 uppercase tracking-wider">Preview Follow-up</p>
              <div className="space-y-1">
                <div className="flex gap-2"><span className="text-muted-foreground min-w-[60px]">Judul:</span><span>{fd.title}</span></div>
                <div className="flex gap-2"><span className="text-muted-foreground min-w-[60px]">Isi:</span><span>{fd.content}</span></div>
                <div className="flex gap-2"><span className="text-muted-foreground min-w-[60px]">Tanggal:</span><span>{fd.dueDate}</span></div>
              </div>
              <Button size="sm" onClick={() => onSaveFollowUp(fd)} disabled={saving} className="w-full h-8 text-xs">
                {saving ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Menyimpan...</> : <><Check className="h-3 w-3 mr-1" />Simpan Follow-up</>}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // laporan or chat
  return (
    <div className="flex justify-start">
      <div className="max-w-[95%] space-y-2">
        <div className="rounded-lg bg-muted/40 p-2.5 text-xs">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Bot className="h-3 w-3 text-neon" />
            <span className="text-[10px] font-semibold">AI {message.mode === "mock" && <span className="text-yellow-500">(mock)</span>}</span>
          </div>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {message.data && message.intent === "laporan" && (
          <ExtractedPreview data={message.data} onSave={onSaveLaporan} saving={saving} duplicateWarning={duplicateWarning} />
        )}
      </div>
    </div>
  );
}

const SECTION_LABELS: Record<keyof ExtractedSections, string> = {
  identitas: "Identitas",
  diagnosa: "Diagnosa / Assessment",
  subjektif: "Subjektif",
  objektif: "Objektif",
  pemeriksaan_penunjang: "Pemeriksaan Penunjang",
  terapi: "Terapi",
};

function ExtractedPreview({
  data,
  onSave,
  saving,
  duplicateWarning,
}: {
  data: ExtractedData;
  onSave: (d: ExtractedData) => void;
  saving: boolean;
  duplicateWarning: { name: string; existing: { id: string; name: string }[] } | null;
}) {
  const isDuplicate = duplicateWarning && data.patient.name && duplicateWarning.name === data.patient.name;
  const [openSection, setOpenSection] = useState<string | null>("identitas");

  return (
    <div className="rounded-lg border border-neon/30 bg-neon/5 p-2.5 text-xs space-y-2">
      <p className="text-[10px] font-semibold text-neon uppercase tracking-wider">Preview Data</p>

      {data.sections && (
        <div className="space-y-1">
          {(Object.keys(SECTION_LABELS) as (keyof ExtractedSections)[]).map((key) => {
            const text = data.sections[key];
            if (!text) return null;
            const isOpen = openSection === key;
            return (
              <div key={key} className="rounded border border-border overflow-hidden">
                <button
                  onClick={() => setOpenSection(isOpen ? null : key)}
                  className="w-full flex items-center justify-between gap-2 px-2 py-1.5 bg-muted/20 text-left text-[10px] font-semibold text-muted-foreground hover:bg-muted/40 transition-colors"
                >
                  <span className="text-neon">&lt;{SECTION_LABELS[key]}&gt;</span>
                  <span className="text-muted-foreground">{isOpen ? "▲" : "▼"}</span>
                </button>
                {isOpen && (
                  <div className="px-2 py-1.5 text-[10px] text-foreground whitespace-pre-wrap font-mono leading-relaxed max-h-40 overflow-y-auto">
                    {text}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-border pt-2 mt-1 space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Data Struktur</p>

        <Section label="Pasien">
          <KV k="Nama" v={data.patient.name} />
          <KV k="Tgl Lahir" v={data.patient.birth_date} />
          <KV k="JK" v={data.patient.sex} />
          <KV k="Orang tua" v={data.patient.parent_name} />
          <KV k="No RM" v={data.patient.medical_record_no} />
        </Section>

        <Section label="Visit">
          <KV k="Tanggal" v={data.visit.visit_date} />
          <KV k="Keluhan" v={data.visit.chief_complaint} />
          <KV k="Anamnesis" v={data.visit.anamnesis} multiline />
          <KV k="Pemeriksaan" v={data.visit.physical_exam} multiline />
          <KV k="Diagnosis utama" v={data.visit.diagnosis_primary} />
          <KV k="Diagnosis lain" v={data.visit.diagnosis_secondary} />
          <KV k="Catatan" v={data.visit.notes} multiline />
        </Section>

        {data.labs && data.labs.length > 0 && (
          <Section label={`Lab (${data.labs.length})`}>
            {data.labs.map((l, i) => (
              <div key={i} className="text-[10px] font-mono text-muted-foreground">
                {l.test_name}: {l.result ?? "-"} {l.unit ?? ""} {l.flag && <span className={l.flag === "high" || l.flag === "low" ? "text-yellow-500" : "text-green-500"}>({l.flag})</span>}
              </div>
            ))}
          </Section>
        )}

        {data.medications && data.medications.length > 0 && (
          <Section label={`Obat (${data.medications.length})`}>
            {data.medications.map((m, i) => (
              <div key={i} className="text-[10px] font-mono text-muted-foreground">
                {m.drug_name} {m.dose ? `(${m.dose})` : ""} {m.frequency ? `- ${m.frequency}` : ""} {m.duration ? `× ${m.duration}` : ""}
              </div>
            ))}
          </Section>
        )}
      </div>

      {isDuplicate && (
        <div className="rounded border border-yellow-500/30 bg-yellow-500/5 p-2 text-[10px] text-yellow-200">
          ⚠️ Pasien dengan nama serupa sudah ada. Tetap simpan? (akan dibuat pasien baru)
        </div>
      )}

      <Button size="sm" onClick={() => onSave(data)} disabled={saving} className="w-full h-8 text-xs">
        {saving ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Menyimpan...</> : <><Check className="h-3 w-3 mr-1" />Simpan ke Pasien</>}
      </Button>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="space-y-0.5 pl-1">{children}</div>
    </div>
  );
}

function KV({ k, v, multiline }: { k: string; v: string | null | undefined; multiline?: boolean }) {
  if (!v) return null;
  return (
    <div className={multiline ? "" : "flex gap-2"}>
      <span className="text-muted-foreground text-[10px] font-semibold min-w-[80px]">{k}:</span>
      <span className={`text-foreground flex-1 ${multiline ? "text-[11px] whitespace-pre-wrap" : "text-[11px]"}`}>{v}</span>
    </div>
  );
}
