"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ClipboardList, Send, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createNote } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useSessions, type ChatMessage } from "@/lib/use-sessions";
import { SessionList } from "@/components/session-list";

type NoteDraft = { title: string; content: string; tags: string[] };

export function NoteTool() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { sessions, activeSession, activeId, setActiveId, createSession, deleteSession, updateMessages, updateDraft, renameSession } = useSessions<NoteDraft>("ai-note");

  const messages = activeSession?.messages ?? [];
  const draft = activeSession?.draft ?? null;

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, loading]);

  function handleNew() { createSession(); }

  async function handleSend() {
    const content = input.trim();
    if (!content || loading || !activeId) return;
    setInput("");
    const userMsg: ChatMessage = { role: "user", content };
    const newMsgs = [...messages, userMsg];
    updateMessages(activeId, newMsgs);
    setLoading(true);
    try {
      const historyForApi: { role: "user" | "assistant"; content: string }[] = [];
      for (const m of messages) {
        historyForApi.push({ role: m.role === "ai" ? "assistant" : "user", content: m.content });
      }
      if (draft) {
        historyForApi.push({ role: "assistant", content: `Draft saat ini:\nJudul: ${draft.title}\nIsi:\n${draft.content}\nTags: ${draft.tags.join(", ")}` });
      }
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history: historyForApi, intent: "note" }),
      });
      const d = await res.json();
      if (d.data) {
        const newDraft: NoteDraft = { title: d.data.title || draft?.title || "Catatan Medis", content: d.data.content || draft?.content || "", tags: d.data.tags || draft?.tags || [] };
        updateDraft(activeId, newDraft);
        updateMessages(activeId, [...newMsgs, { role: "ai", content: "Draft diperbarui. Review, lalu ketik perubahan atau klik Simpan." }]);
      } else if (d.reply) {
        // Fallback: treat raw reply as content
        updateMessages(activeId, [...newMsgs, { role: "ai", content: d.reply }]);
      } else {
        updateMessages(activeId, [...newMsgs, { role: "ai", content: `❌ ${d.error || "Gagal mendapatkan respons"}` }]);
      }
    } catch (e) {
      updateMessages(activeId, [...newMsgs, { role: "ai", content: `❌ ${e instanceof Error ? e.message : "Error"}` }]);
    } finally { setLoading(false); }
  }

  async function handleSave() {
    if (!draft || saving || !activeId) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("title", draft.title || "Catatan Medis");
      fd.set("content", draft.content || "");
      fd.set("tags", (draft.tags || []).join(", "));
      await createNote(fd);
      updateMessages(activeId, [...messages, { role: "ai", content: `✅ Catatan "${draft.title}" disimpan!` }]);
      updateDraft(activeId, null);
      setTimeout(() => router.push("/notes"), 1200);
    } catch (e) {
      updateMessages(activeId, [...messages, { role: "ai", content: `❌ ${e instanceof Error ? e.message : "Error"}` }]);
    } finally { setSaving(false); }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-3 flex-1 h-full">
      <SessionList sessions={sessions} activeId={activeId} onSelect={() => {}} onNew={handleNew} onDelete={deleteSession} onRename={renameSession} />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardList className="h-4 w-4 text-blue-400" />
          <h2 className="text-sm font-semibold">Notes</h2>
        </div>
        <p className="text-xs text-muted-foreground">Buat catatan medis interaktif. Auto-title & auto-tag.</p>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 p-2 rounded-lg bg-muted/10">
          {messages.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">"Catatan: An. Budi 5 thn, demam 3 hari, bronkitis"</p>}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <span className={`inline-block max-w-[85%] text-xs p-2 rounded-lg whitespace-pre-wrap text-left ${m.role === "user" ? "bg-neon/20" : m.content.startsWith("✅") ? "bg-green-500/10 text-green-200" : m.content.startsWith("❌") ? "bg-destructive/10 text-destructive" : "bg-muted/40"}`}>
                {m.content}
              </span>
            </div>
          ))}
          {loading && <div className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> AI memproses...</div>}
        </div>

        {draft && (
          <div className="rounded-lg border border-blue-400/30 bg-blue-400/5 p-3 text-sm space-y-2">
            <p className="font-semibold text-blue-300 text-xs uppercase">Draft Catatan</p>
            <div>
              <label className="text-xs text-muted-foreground">Judul</label>
              <input value={draft.title} onChange={(e) => activeId && updateDraft(activeId, { ...draft, title: e.target.value })}
                className="w-full h-8 rounded border border-border bg-background px-2 text-xs mt-0.5 focus:border-neon focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Isi</label>
              <textarea value={draft.content} onChange={(e) => activeId && updateDraft(activeId, { ...draft, content: e.target.value })} rows={4}
                className="w-full rounded border border-border bg-background px-2 py-1.5 text-xs mt-0.5 focus:border-neon focus:outline-none resize-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Tags</label>
              <div className="flex gap-1 flex-wrap mt-0.5">
                {draft.tags.map((t, i) => <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">#{t}</span>)}
                {draft.tags.length === 0 && <span className="text-xs text-muted-foreground">Belum ada tags</span>}
              </div>
            </div>
            <Button size="sm" onClick={handleSave} disabled={saving} className="w-full h-8 text-xs">
              {saving ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Menyimpan...</> : <><Check className="h-3 w-3 mr-1" />Simpan ke Notes</>}
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={draft ? "Minta perubahan: tambah bagian X, rapikan..." : "Tulis atau paste catatan medis..."}
            rows={3}
            className="flex-1 min-h-[60px] max-h-40 resize-none rounded-md border border-border bg-background px-3 py-2 text-xs focus:border-neon focus:outline-none" />
          <Button size="icon" onClick={handleSend} disabled={loading || !input.trim() || !activeId} className="h-10 w-10 self-end">
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
