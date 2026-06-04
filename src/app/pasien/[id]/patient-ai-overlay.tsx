"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2, Sparkles, AlertCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createVisit } from "@/app/actions";
import { useRouter } from "next/navigation";

type ExtractedSections = {
  identitas: string;
  diagnosa: string;
  subjektif: string;
  objektif: string;
  pemeriksaan_penunjang: string;
  terapi: string;
};

type Message = { role: "user" | "assistant" | "system"; content: string; error?: string };

export function PatientAIOverlay({ patientId, patientName }: { patientId: string; patientName: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<{ sections: ExtractedSections; diagnosisPrimary: string | null; diagnosisSecondary: string | null } | null>(null);
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
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { role: "system", content: data.error, error: data.detail }]);
      } else if (data.data) {
        const d = data.data;
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Data diekstrak. Review lalu klik "Simpan sebagai Kunjungan Baru" untuk menambahkan ke ${patientName}.` },
        ]);
        setPreview({
          sections: d.sections,
          diagnosisPrimary: d.visit?.diagnosis_primary ?? null,
          diagnosisSecondary: d.visit?.diagnosis_secondary ?? null,
        });
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
      const now = new Date().toISOString().split("T")[0];
      const sections = preview.sections;
      await createVisit({
        patientId,
        visitDate: now,
        anamnesis: sections.subjektif || undefined,
        physicalExam: sections.objektif || undefined,
        diagnosisPrimary: preview.diagnosisPrimary || sections.diagnosa?.split("\n")[0] || undefined,
        diagnosisSecondary: preview.diagnosisSecondary || undefined,
        therapy: sections.terapi || undefined,
        sections: sections as unknown as Record<string, string>,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: `✅ Kunjungan baru berhasil ditambahkan ke ${patientName}!` }]);
      setPreview(null);
      router.refresh();
    } catch (e) {
      setMessages((prev) => [...prev, { role: "system", content: "Gagal menyimpan: " + (e instanceof Error ? e.message : "Unknown") }]);
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
          title={`Tambah kunjungan ke ${patientName}`}
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">AI Input</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 z-50 w-[min(420px,calc(100vw-2rem))] h-[min(550px,calc(100vh-2rem))] rounded-xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 p-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neon/20">
                <Bot className="h-3.5 w-3.5 text-neon" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">AI — {patientName}</p>
                <p className="text-[10px] text-muted-foreground">Paste laporan, jadi kunjungan baru</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)} className="h-7 w-7 p-0">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && !preview && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground text-center pt-2">
                  Paste laporan pasien. AI akan extract dan langsung ditambahkan sebagai kunjungan baru.
                </p>
                <button
                  onClick={() => handleSend("An. Budi 5 tahun, demam 3 hari, batuk pilek. Diagnosa: Bronkitis. Terapi: Paracetamol 3x250mg, Amoksisilin 3x250mg.")}
                  className="block w-full text-left text-[11px] p-2 rounded border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  Contoh: An. Budi 5 thn, demam 3 hari, batuk pilek...
                </button>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={`max-w-[85%] rounded-lg p-2.5 text-xs ${
                  m.role === "user"
                    ? "bg-neon/20 text-foreground"
                    : m.error
                      ? "border border-destructive/30 bg-destructive/5 text-destructive"
                      : "bg-muted/40 text-foreground"
                }`}>
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
                <p className="text-[10px] font-semibold text-neon uppercase tracking-wider">Preview — Kunjungan Baru</p>
                {preview.diagnosisPrimary && (
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground">Diagnosis:</p>
                    <p className="text-[11px]">{preview.diagnosisPrimary}</p>
                    {preview.diagnosisSecondary && <p className="text-[11px] text-muted-foreground">+ {preview.diagnosisSecondary}</p>}
                  </div>
                )}
                {Object.entries(preview.sections).filter(([, v]) => v).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-[10px] font-semibold text-neon">&lt;{key.replace("_", " ")}&gt;</p>
                    <p className="text-[10px] text-foreground whitespace-pre-wrap font-mono leading-relaxed max-h-20 overflow-y-auto">{val}</p>
                  </div>
                ))}
                <Button size="sm" onClick={handleSave} disabled={saving} className="w-full h-8 text-xs">
                  {saving ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Menyimpan...</> : "Simpan sebagai Kunjungan Baru"}
                </Button>
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>AI sedang mengekstrak...</span>
              </div>
            )}
          </div>

          {/* Input */}
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
              placeholder="Paste laporan pasien..."
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
