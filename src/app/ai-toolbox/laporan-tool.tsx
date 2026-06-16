"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FileText, Send, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPatientWithVisit } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useSessions, type ChatMessage } from "@/lib/use-sessions";
import { SessionList } from "@/components/session-list";

type Sections = Record<string, string>;
type LabResult = Record<string, string>;
type Medication = Record<string, string>;
type Data = { sections: Sections; patient: Record<string, string | null>; visit: Record<string, string | null>; labs?: LabResult[]; medications?: Medication[] };

export function LaporanTool() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<Data | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { sessions, activeSession, activeId, setActiveId, createSession, deleteSession, updateMessages, renameSession } = useSessions("ai-laporan");

  const messages = activeSession?.messages ?? [];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  function handleNew() { createSession(); setPreview(null); }

  async function handleSend() {
    const content = input.trim();
    if (!content || loading || !activeId) return;
    setInput("");
    setPreview(null);
    const userMsg: ChatMessage = { role: "user", content };
    const newMsgs = [...messages, userMsg];
    updateMessages(activeId, newMsgs);
    setLoading(true);
    try {
      const historyForApi = messages.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content }));
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history: historyForApi, intent: "laporan" }),
      });
      const d = await res.json();
      if (d.data) {
        updateMessages(activeId, [...newMsgs, { role: "ai", content: "Data terekstrak. Review di bawah." }]);
        setPreview(d.data);
      } else {
        updateMessages(activeId, [...newMsgs, { role: "ai", content: `❌ ${d.error || "Gagal mengekstrak"}` }]);
      }
    } catch (e) {
      updateMessages(activeId, [...newMsgs, { role: "ai", content: `❌ ${e instanceof Error ? e.message : "Error"}` }]);
    } finally { setLoading(false); }
  }

  async function handleSave() {
    if (!preview || saving) return;
    setSaving(true);
    try {
      const r = await createPatientWithVisit({
        patient: { name: preview.patient.name!, birthDate: preview.patient.birth_date || undefined, sex: preview.patient.sex || undefined, medicalRecordNo: preview.patient.medical_record_no || undefined },
        visit: { visitDate: preview.visit.visit_date as string, anamnesis: preview.visit.anamnesis || undefined, physicalExam: preview.visit.physical_exam || undefined, diagnosisPrimary: preview.visit.diagnosis_primary || undefined, diagnosisSecondary: preview.visit.diagnosis_secondary || undefined, therapy: preview.visit.therapy || undefined, sections: Array.isArray(preview.sections) ? preview.sections : [preview.sections as unknown as string] },
      });
      if (activeId) updateMessages(activeId, [...messages, { role: "ai", content: `✅ Pasien "${r.patient.name}" berhasil dibuat!` }]);
      setPreview(null);
      setTimeout(() => router.push(`/pasien/${r.patient.id}`), 1200);
    } catch (e) {
      if (activeId) updateMessages(activeId, [...messages, { role: "ai", content: `❌ ${e instanceof Error ? e.message : "Error"}` }]);
    } finally { setSaving(false); }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-3 flex-1 h-full">
      <SessionList sessions={sessions} activeId={activeId} onSelect={() => setPreview(null)} onNew={handleNew} onDelete={deleteSession} onRename={renameSession} />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-neon" />
          <h2 className="text-sm font-semibold">Laporan Pasien</h2>
        </div>
        <p className="text-xs text-muted-foreground">Paste laporan, AI extract & buat pasien baru.</p>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 p-2 rounded-lg bg-muted/10">
          {messages.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Belum ada percakapan di sesi ini</p>}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <span className={`inline-block max-w-[80%] text-xs p-2 rounded-lg whitespace-pre-wrap text-left ${m.role === "user" ? "bg-neon/20" : m.content.startsWith("✅") ? "bg-green-500/10 text-green-200" : m.content.startsWith("❌") ? "bg-destructive/10 text-destructive" : "bg-muted/40"}`}>
                {m.content}
              </span>
            </div>
          ))}
          {loading && <div className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Mengekstrak...</div>}
        </div>

        {preview && (
          <div className="rounded-lg border border-neon/30 bg-neon/5 p-3 text-sm space-y-2">
            <p className="font-semibold text-neon text-xs uppercase">Preview Pasien Baru</p>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <div><span className="text-muted-foreground">Nama: </span>{preview.patient.name}</div>
              <div><span className="text-muted-foreground">RM: </span>{preview.patient.medical_record_no || "-"}</div>
              <div><span className="text-muted-foreground">Lahir: </span>{preview.patient.birth_date || "-"}</div>
              <div><span className="text-muted-foreground">Dx: </span>{preview.visit.diagnosis_primary || "-"}</div>
            </div>
            <Button size="sm" onClick={handleSave} disabled={saving} className="w-full h-8 text-xs">
              {saving ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Menyimpan...</> : <><Check className="h-3 w-3 mr-1" />Simpan Pasien Baru</>}
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Paste laporan pasien..." rows={2}
            className="flex-1 min-h-[48px] max-h-32 resize-none rounded-md border border-border bg-background px-3 py-2 text-xs focus:border-neon focus:outline-none" />
          <Button size="icon" onClick={handleSend} disabled={loading || !input.trim() || !activeId} className="h-10 w-10 self-end">
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
