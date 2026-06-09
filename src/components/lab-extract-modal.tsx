"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, X, Check, Loader2, AlertCircle, MessageSquare, Send, Plus, Trash2, Paperclip } from "lucide-react";

interface LabResult {
  testName: string;
  result: string;
  unit: string;
  referenceRange: string;
  flag: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface LabExtractModalProps {
  visitId: string;
  patientName?: string;
  trigger: React.ReactNode;
  onSave?: () => void;
}

export function LabExtractModal({ visitId, patientName, trigger, onSave }: LabExtractModalProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"upload" | "chat">("upload");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("visitId", visitId);

    try {
      const res = await fetch("/api/lab-extract", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setImageUrl(data.imageUrl);

      if (data.extracted && data.extracted.length > 0) {
        setLabResults(data.extracted);
        // Auto-generate AI summary
        const summary = data.extracted.map((r: LabResult) =>
          `${r.testName}: ${r.result} ${r.unit}${r.referenceRange ? ` (ref: ${r.referenceRange})` : ""} ${r.flag !== "normal" ? `[${r.flag?.toUpperCase()}]` : ""}`
        ).join("\n");
        await sendAutoSummary(summary, data.extracted);
        setTab("upload"); // Switch to upload tab to show preview table
      } else {
        setLabResults([emptyRow()]);
        setMessages([{ role: "assistant", content: "Saya tidak bisa mendeteksi parameter lab dari gambar ini. Silakan input manual atau coba foto yang lebih jelas.\n\nAtau ketik langsung hasil lab di chat, contoh:\nHb 10.5, Leukosit 15000, Trombosit 200000" }]);
        setTab("chat");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memproses gambar");
      setMessages([{ role: "assistant", content: "Upload gagal. Silakan input manual atau ketik hasil lab di chat." }]);
      setTab("chat");
    } finally {
      setLoading(false);
    }
  };

  const sendAutoSummary = async (summary: string, extracted: LabResult[]) => {
    setChatLoading(true);
    try {
      const abnormal = extracted.filter((r: LabResult) => r.flag === "high" || r.flag === "low");
      const prompt = `Anda adalah dokter spesialis anak. Analisis hasil laboratorium berikut dan berikan interpretasi singkat dalam Bahasa Indonesia:

${summary}

${abnormal.length > 0 ? `\nParameter abnormal (${abnormal.length}):
${abnormal.map((r: LabResult) => `- ${r.testName}: ${r.result} ${r.unit} (${r.flag})`).join("\n")}` : "Semua parameter dalam batas normal."}

Format respons:
1. **Ringkasan**: Kalimat singkat tentang gambaran umum
2. **Temuan Penting**: Parameter abnormal + signifikansi klinis (bullet points)
3. **Saran**: Apakah perlu tatalaksana/rekomendasi lanjutan

Jawab dalam bahasa Indonesia yang natural dan profesional.`;

      const res = await fetch("/api/vision-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, isChat: true }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([
          { role: "assistant", content: `📊 **${extracted.length} parameter terdeteksi** dari gambar.\n\nBerikut hasil analisisnya:\n` },
          { role: "assistant", content: data.response || "Gagal generate analisis." },
        ]);
      }
    } catch {
      setMessages([{ role: "assistant", content: "📊 Gambar terupload. Silakan lihat tabel hasil di atas atau tanyakan sesuatu di chat." }]);
    } finally {
      setChatLoading(false);
    }
    setTab("chat");
  };

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    // Check if user is inputting lab data inline
    const labPatterns = text.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
    const parsedLabs: LabResult[] = [];
    for (const p of labPatterns) {
      const m = p.match(/^(.+?)\s+([\d.]+)\s*(.*)$/);
      if (m) {
        parsedLabs.push({ testName: m[1].trim(), result: m[2], unit: m[3] || "", referenceRange: "", flag: "unknown" });
      }
    }
    if (parsedLabs.length > 0) {
      setLabResults(parsedLabs);
    }

    const contextLabs = parsedLabs.length > 0
      ? `\n\nData lab baru dari user:\n${parsedLabs.map((l) => `${l.testName}: ${l.result} ${l.unit}`).join("\n")}`
      : labResults.length > 0
        ? `\n\nData lab yang sudah diinput:\n${labResults.map((l) => `${l.testName}: ${l.result} ${l.unit} ${l.flag !== "normal" ? `[${l.flag}]` : ""}`).join("\n")}`
        : "";

    const fullPrompt = `Anda adalah dokter spesialis anak yang membantu menginterpretasi hasil laboratorium. ${patientName ? `Pasien: ${patientName}.` : ""}${contextLabs}

Pertanyaan/user input: ${text}

Jawab dalam Bahasa Indonesia yang natural dan profesional. Jika ada data lab, berikan interpretasi klinis. Jika user memberikan data lab baru, konfirmasi apa yang terdeteksi dan berikan analisis singkat.`;

    try {
      const res = await fetch("/api/vision-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt, isChat: true }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.response || "Maaf, tidak bisa memproses." }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Maaf, terjadi kesalahan pada server." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Koneksi error. Coba lagi." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const emptyRow = (): LabResult => ({
    testName: "", result: "", unit: "", referenceRange: "", flag: "normal",
  });

  const addRow = () => setLabResults([...labResults, emptyRow()]);
  const removeRow = (idx: number) => { if (labResults.length > 1) setLabResults(labResults.filter((_, i) => i !== idx)); };
  const updateRow = (idx: number, field: keyof LabResult, value: string) => {
    const updated = [...labResults];
    updated[idx] = { ...updated[idx], [field]: value };
    setLabResults(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const valid = labResults.filter((r) => r.testName && r.result);
      if (valid.length === 0) {
        setError("Minimal 1 parameter lab harus diisi");
        setSaving(false);
        return;
      }
      await fetch("/api/lab-extract/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId, results: valid }),
      });
      setOpen(false);
      onSave?.();
      resetModal();
    } catch {
      setError("Gagal menyimpan data lab");
    } finally {
      setSaving(false);
    }
  };

  const resetModal = () => {
    setTab("upload");
    setImageUrl(null);
    setLabResults([]);
    setMessages([]);
    setError(null);
    setChatInput("");
  };

  const flagIcon = (flag: string) => {
    if (flag === "high") return "⬆️";
    if (flag === "low") return "⬇️";
    return "✅";
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <Dialog open={open} onOpenChange={(o) => { if (!o) resetModal(); setOpen(o); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Laboratorium
            </DialogTitle>
          </DialogHeader>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setTab("upload")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${tab === "upload" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Upload className="h-3.5 w-3.5" /> Upload / Edit
            </button>
            <button
              onClick={() => setTab("chat")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${tab === "chat" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <MessageSquare className="h-3.5 w-3.5" /> AI Chat
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center py-8 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-neon" />
              <p className="text-sm text-muted-foreground">Memproses gambar...</p>
            </div>
          )}

          {/* Upload / Edit tab */}
          {tab === "upload" && !loading && (
            <div className="space-y-3">
              {/* Lab results table */}
              {labResults.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Parameter Lab ({labResults.length})
                    </p>
                    <Button variant="ghost" size="sm" onClick={addRow} className="h-6 text-xs gap-1">
                      <Plus className="h-3 w-3" /> Tambah
                    </Button>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                      <div className="col-span-4">Parameter</div>
                      <div className="col-span-2">Nilai</div>
                      <div className="col-span-2">Unit</div>
                      <div className="col-span-3">Range</div>
                      <div className="col-span-1"></div>
                    </div>
                    {labResults.map((row, i) => (
                      <div key={i} className="grid grid-cols-12 gap-1 items-center">
                        <div className="col-span-4">
                          <Input value={row.testName} onChange={(e) => updateRow(i, "testName", e.target.value)} placeholder="Hemoglobin" className="h-7 text-xs" />
                        </div>
                        <div className="col-span-2">
                          <Input value={row.result} onChange={(e) => updateRow(i, "result", e.target.value)} placeholder="10.5" className="h-7 text-xs" />
                        </div>
                        <div className="col-span-2">
                          <Input value={row.unit} onChange={(e) => updateRow(i, "unit", e.target.value)} placeholder="g/dL" className="h-7 text-xs" />
                        </div>
                        <div className="col-span-3">
                          <Input value={row.referenceRange} onChange={(e) => updateRow(i, "referenceRange", e.target.value)} placeholder="12-16" className="h-7 text-xs" />
                        </div>
                        <div className="col-span-1 flex items-center gap-0.5">
                          {row.flag && row.flag !== "normal" && <span className="text-xs">{flagIcon(row.flag)}</span>}
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeRow(i)}>
                            <Trash2 className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload area */}
              {imageUrl && (
                <img src={imageUrl} alt="Lab result" className="w-full rounded-lg border max-h-32 object-contain" />
              )}

              <div
                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-neon/50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Foto / Upload screenshot lab</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG — AI akan ekstrak otomatis</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />

              {/* Quick add buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => { setLabResults([emptyRow()]); }}>
                  + Input Manual
                </Button>
                {labResults.length > 0 && (
                  <Button onClick={handleSave} disabled={saving} size="sm" className="flex-1 text-xs">
                    {saving ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Menyimpan...</> : <><Check className="h-3 w-3 mr-1" /> Simpan</>}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* AI Chat tab */}
          {tab === "chat" && !loading && (
            <div className="space-y-3">
              {/* Chat messages */}
              <div className="bg-muted/50 rounded-xl p-3 space-y-3 max-h-64 overflow-y-auto min-h-[120px]">
                {messages.length === 0 && !chatLoading && (
                  <div className="text-center py-6 text-muted-foreground text-xs">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium mb-1">Tanyakan tentang hasil lab</p>
                    <p>Contoh:</p>
                    <p>• "Hb 10.5, Leukosit 15000, Trombosit 200k"</p>
                    <p>• "Apa artinya CRP tinggi?"</p>
                    <p>• "Bagaimana tatalaksana anemia ini?"</p>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-neon/20 text-foreground"
                        : "bg-card border border-border text-foreground"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs">
                      <Loader2 className="h-3 w-3 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Lab data badges */}
              {labResults.length > 0 && labResults.some((r) => r.testName) && (
                <div className="flex gap-1 flex-wrap">
                  <span className="text-[10px] text-muted-foreground mr-1">Data:</span>
                  {labResults.filter((r) => r.testName && r.result).map((r, i) => (
                    <Badge key={i} variant={r.flag === "high" || r.flag === "low" ? "destructive" : "secondary"} className="text-[10px]">
                      {r.testName}: {r.result} {r.unit}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Chat input */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => fileRef.current?.click()}
                  title="Upload foto lab"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                  placeholder="Ketik hasil lab atau tanyakan... (Enter kirim)"
                  className="text-xs"
                />
                <Button size="icon" onClick={sendChat} disabled={chatLoading || !chatInput.trim()} className="shrink-0">
                  {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>

              {/* Save button */}
              {labResults.length > 0 && labResults.some((r) => r.testName && r.result) && (
                <Button onClick={handleSave} disabled={saving} className="w-full" size="sm">
                  {saving ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Menyimpan...</> : <><Check className="h-3 w-3 mr-1" /> Simpan {labResults.filter((r) => r.testName && r.result).length} Parameter</>}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
