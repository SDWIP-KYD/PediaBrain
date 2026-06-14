"use client";

import { useState, useRef, useEffect } from "react";
import { Stethoscope, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessions, type ChatMessage } from "@/lib/use-sessions";
import { SessionList } from "@/components/session-list";

export function ClinicalTool() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sessions, activeSession, activeId, setActiveId, createSession, deleteSession, updateMessages, renameSession } = useSessions("ai-clinical");

  const messages = activeSession?.messages ?? [];

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, loading]);

  async function handleSend() {
    const content = input.trim();
    if (!content || loading || !activeId) return;
    setInput("");
    const userMsg: ChatMessage = { role: "user", content };
    const newMsgs = [...messages, userMsg];
    updateMessages(activeId, newMsgs);
    setLoading(true);
    try {
      const historyForApi = messages.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content }));
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history: historyForApi, intent: "chat" }),
      });
      const d = await res.json();
      updateMessages(activeId, [...newMsgs, { role: "ai", content: d.reply || d.error || "Tidak ada jawaban." }]);
    } catch (e) {
      updateMessages(activeId, [...newMsgs, { role: "ai", content: e instanceof Error ? e.message : "Error" }]);
    } finally { setLoading(false); }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-3 flex-1 h-full">
      <SessionList sessions={sessions} activeId={activeId} onSelect={() => {}} onNew={createSession} onDelete={deleteSession} onRename={renameSession} />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Stethoscope className="h-4 w-4 text-green-400" />
          <h2 className="text-sm font-semibold">Clinical Assistant</h2>
        </div>
        <p className="text-xs text-muted-foreground">Tanya seputar diagnosis, terapi, dosis, evidence-based medicine.</p>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 p-2 rounded-lg bg-muted/10">
          {messages.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">"Bedanya bronkitis dan pneumonia pada anak?"</p>}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <span className={`inline-block max-w-[85%] text-xs p-2 rounded-lg whitespace-pre-wrap text-left ${m.role === "user" ? "bg-neon/20" : "bg-muted/40"}`}>
                {m.content}
              </span>
            </div>
          ))}
          {loading && <div className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> AI menjawab...</div>}
        </div>

        <div className="flex gap-2">
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Tanya seputar kedokteran anak..." rows={2}
            className="flex-1 min-h-[48px] max-h-32 resize-none rounded-md border border-border bg-background px-3 py-2 text-xs focus:border-neon focus:outline-none" />
          <Button size="icon" onClick={handleSend} disabled={loading || !input.trim() || !activeId} className="h-10 w-10 self-end">
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
