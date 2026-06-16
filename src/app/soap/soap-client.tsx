"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2, Send, Check, Copy, ChevronDown, User, Bot, Save,
  ClipboardList, MessageSquare, FileText, ArrowLeft, Calendar, Pencil,
  UserPlus, X,
} from "lucide-react";
import { createVisit, createPatient } from "@/app/actions";
import { cn } from "@/lib/utils";

type Patient = {
  id: string;
  name: string;
  medicalRecordNo: string | null;
  bed: string | null;
  room: string | null;
  birthDate: string | null;
  sex: string | null;
  status: string | null;
  notes: string | null;
  dpjp: string | null;
  diagnosis: string | null;
};

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const FORM_FIELDS = {
  identitas: "Identitas",
  subjektif: "Subjektif",
  objektif: "Objektif",
  assesment: "Assesment",
  terapi: "Terapi",
} as const;

type FormField = keyof typeof FORM_FIELDS;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatBirthDate(d: string | null): string {
  if (!d) return "";
  return d;
}

function ageFromBirthDate(d: string | null): string {
  if (!d) return "";
  const birth = new Date(d);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 24) return `${months} bln`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return remMonths > 0 ? `${years} thn ${remMonths} bln` : `${years} thn`;
}

export default function SoapClient({ patients }: { patients: Patient[] }) {
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [mode, setMode] = useState<"chat" | "form">("chat");
  const [visitDate, setVisitDate] = useState(todayISO());
  const [soapOutput, setSoapOutput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedVisitId, setSavedVisitId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: "", medicalRecordNo: "", birthDate: "", sex: "", room: "DAHLIA", bed: "", parentName: "", phone: "" });
  const [creatingPatient, setCreatingPatient] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Record<FormField, string>>({
    identitas: "",
    subjektif: "",
    objektif: "",
    assesment: "",
    terapi: "",
  });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (selectedPatient) {
      const identitas = `*${selectedPatient.name}/${selectedPatient.medicalRecordNo || "—"}/${formatBirthDate(selectedPatient.birthDate)}/${selectedPatient.room || "—"} ${selectedPatient.bed || "—"}*`;
      setFormData((prev) => ({ ...prev, identitas }));
    }
  }, [selectedPatient]);

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setSoapOutput("");
    setMessages([]);
    setSavedVisitId(null);
    const identitas = `*${p.name}/${p.medicalRecordNo || "—"}/${formatBirthDate(p.birthDate)}/${p.room || "—"} ${p.bed || "—"}*`;
    setFormData({ identitas, subjektif: "", objektif: "", assesment: "", terapi: "" });
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || loading || !selectedPatient) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: content.slice(0, 300) + (content.length > 300 ? "..." : "") }]);
    setLoading(true);
    try {
      const history = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai/soap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history,
          patient: {
            name: selectedPatient.name,
            medicalRecordNo: selectedPatient.medicalRecordNo,
            birthDate: selectedPatient.birthDate,
            room: selectedPatient.room,
            bed: selectedPatient.bed,
          },
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { role: "system", content: "❌ " + data.error }]);
      } else if (data.soap) {
        setSoapOutput(data.soap);
        setMessages((prev) => [...prev, { role: "assistant", content: "✅ SOAP berhasil dibuat. Review di panel kanan lalu klik Simpan." }]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "system", content: "❌ " + (e instanceof Error ? e.message : "Error") }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFromForm = async () => {
    if (loading || !selectedPatient) return;
    setLoading(true);
    const prompt = `Buat SOAP lengkap berdasarkan data berikut:

IDENTITAS: ${formData.identitas}
SUBJEKTIF: ${formData.subjektif}
OBJEKTIF: ${formData.objektif}
ASSESMENT: ${formData.assesment}
TERAPI: ${formData.terapi}

Format output harus sesuai template SOAP standar.`;
    try {
      const res = await fetch("/api/ai/soap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          patient: {
            name: selectedPatient.name,
            medicalRecordNo: selectedPatient.medicalRecordNo,
            birthDate: selectedPatient.birthDate,
            room: selectedPatient.room,
            bed: selectedPatient.bed,
          },
        }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { role: "system", content: "❌ " + data.error }]);
      } else if (data.soap) {
        setSoapOutput(data.soap);
        setMessages((prev) => [...prev, { role: "assistant", content: "✅ SOAP berhasil dibuat. Review di panel kanan lalu klik Simpan." }]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "system", content: "❌ " + (e instanceof Error ? e.message : "Error") }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!soapOutput || !selectedPatient || saving) return;
    setSaving(true);
    try {
      const sections = parseSoapToSections(soapOutput);
      const { visit, anamnesis, physicalExam, therapy, diagnosisPrimary } = sections;
      const result = await createVisit({
        patientId: selectedPatient.id,
        visitDate,
        anamnesis: anamnesis || undefined,
        physicalExam: physicalExam || undefined,
        therapy: therapy || undefined,
        diagnosisPrimary: diagnosisPrimary || undefined,
        sections: visit,
      });
      const visitId = result && typeof result === "object" && "id" in result ? (result as { id: string }).id : "ok";
      setSavedVisitId(visitId);
      setMessages((prev) => [...prev, { role: "system", content: "✅ SOAP berhasil disimpan sebagai kunjungan baru." }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "system", content: "❌ Gagal simpan: " + (e instanceof Error ? e.message : "Error") }]);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!soapOutput) return;
    await navigator.clipboard.writeText(soapOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseSoapToSections = (soap: string) => {
    const sections: Record<string, string> = {};
    let current = "";
    let buffer: string[] = [];
    const lines = soap.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^subjektif/i.test(trimmed)) {
        if (current) sections[current] = buffer.join("\n").trim();
        current = "subjektif";
        buffer = [];
      } else if (/^objektif/i.test(trimmed)) {
        if (current) sections[current] = buffer.join("\n").trim();
        current = "objektif";
        buffer = [];
      } else if (/^assesment/i.test(trimmed)) {
        if (current) sections[current] = buffer.join("\n").trim();
        current = "assesment";
        buffer = [];
      } else if (/^terapi/i.test(trimmed)) {
        if (current) sections[current] = buffer.join("\n").trim();
        current = "terapi";
        buffer = [];
      } else {
        buffer.push(line);
      }
    }
    if (current) sections[current] = buffer.join("\n").trim();
    const identMatch = soap.match(/^\*(.+?)\*/m);
    if (identMatch) sections.identitas = identMatch[0];
    const assesment = sections.assesment || "";
    const diagLines = assesment.split("\n").filter((l) => l.trim().startsWith("-")).map((l) => l.replace(/^-\s*/, "").trim()).filter(Boolean);
    return {
      visit: sections,
      anamnesis: sections.subjektif,
      physicalExam: sections.objektif,
      therapy: sections.terapi,
      diagnosisPrimary: diagLines[0] || null,
    };
  };

  if (!selectedPatient) {
    return (
      <PatientPicker
        patients={patients}
        onSelect={handleSelectPatient}
        onCreateNew={async (data) => {
          setCreatingPatient(true);
          try {
            const created = await createPatient({
              name: data.name,
              medicalRecordNo: data.medicalRecordNo || undefined,
              birthDate: data.birthDate || undefined,
              sex: data.sex || undefined,
              room: data.room || undefined,
              bed: data.bed || undefined,
              parentName: data.parentName || undefined,
              phone: data.phone || undefined,
            });
            if (created) {
              const newP: Patient = {
                id: created.id,
                name: created.name,
                medicalRecordNo: created.medicalRecordNo,
                bed: created.bed,
                room: created.room,
                birthDate: created.birthDate,
                sex: created.sex,
                status: created.status,
                notes: created.notes,
                dpjp: created.dpjp,
                diagnosis: null,
              };
              handleSelectPatient(newP);
            }
          } catch (e) {
            alert("Gagal membuat pasien: " + (e instanceof Error ? e.message : "Error"));
          } finally {
            setCreatingPatient(false);
          }
        }}
        creating={creatingPatient}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-3.5rem)]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-background/50">
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedPatient(null)} className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <p className="text-sm font-semibold leading-tight">{selectedPatient.name}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {selectedPatient.medicalRecordNo || "—"} • {ageFromBirthDate(selectedPatient.birthDate)} • {selectedPatient.room} {selectedPatient.bed}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)}
            className="text-[11px] bg-background border border-border rounded px-1.5 py-0.5 focus:outline-none focus:border-emerald-500" />
        </div>
      </div>

      <div className="flex border-b border-border bg-muted/10">
        <button onClick={() => setMode("chat")} className={cn("flex-1 text-[11px] font-semibold py-2 transition-colors flex items-center justify-center gap-1.5",
          mode === "chat" ? "bg-emerald-500/15 text-emerald-300 border-b-2 border-emerald-400" : "text-muted-foreground hover:text-foreground")}>
          <MessageSquare className="h-3 w-3" />AI Chat
        </button>
        <button onClick={() => setMode("form")} className={cn("flex-1 text-[11px] font-semibold py-2 transition-colors flex items-center justify-center gap-1.5",
          mode === "form" ? "bg-blue-500/15 text-blue-300 border-b-2 border-blue-400" : "text-muted-foreground hover:text-foreground")}>
          <FileText className="h-3 w-3" />Form Manual
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        <div className="flex flex-col border-r border-border overflow-hidden">
          {mode === "chat" ? (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
                {messages.length === 0 && (
                  <div className="p-3 space-y-2">
                    <p className="text-[11px] text-muted-foreground text-center">Ketik laporan klinis pasien. AI akan generate SOAP otomatis.</p>
                    <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2 text-[10px] text-emerald-300/80 space-y-1">
                      <p className="font-semibold text-emerald-300">Contoh:</p>
                      <p>"Anak 5 tahun, BB 18 kg. Demam 2 hari, naik turun, membaik dengan paracetamol. Nyeri menelan. Malas makan dan minum. Tidak batuk, tidak sesak, tidak muntah. BAK cukup, BAB biasa. Faring hiperemis, tonsil T1-T1. Diagnosa: TFA. Rencana: amoxicillin 50 mg/kg/hari, paracetamol prn."</p>
                    </div>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    <div className={cn("max-w-[90%] rounded-lg p-2 text-[11px]",
                      m.role === "user" ? "bg-emerald-500/15 text-foreground" :
                      m.content.startsWith("✅") ? "border border-emerald-500/30 bg-emerald-500/5 text-emerald-200" :
                      m.content.startsWith("❌") ? "border border-rose-500/30 bg-rose-500/5 text-rose-200" :
                      "bg-muted/40"
                    )}>
                      <div className="flex items-center gap-1 mb-0.5">
                        {m.role === "user" ? <User className="h-2.5 w-2.5" /> : <Bot className="h-2.5 w-2.5" />}
                        <span className="text-[9px] font-semibold">{m.role === "user" ? "Anda" : "AI"}</span>
                      </div>
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
                    <span>Generating SOAP...</span>
                  </div>
                )}
              </div>
              <div className="border-t border-border p-2 flex gap-1.5">
                <textarea value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Ketik laporan klinis... (Enter untuk kirim, Shift+Enter untuk baris baru)" rows={3}
                  className="flex-1 min-h-[60px] max-h-32 resize-none rounded-md border border-border bg-background px-2 py-1.5 text-[12px] focus:outline-none focus:border-emerald-500" />
                <button onClick={handleSend} disabled={loading || !input.trim()}
                  className="h-auto px-3 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Identitas</label>
                <textarea value={formData.identitas} onChange={(e) => setFormData({ ...formData, identitas: e.target.value })} rows={1}
                  className="w-full mt-1 px-2 py-1.5 text-[11px] bg-background border border-border rounded focus:outline-none focus:border-emerald-500" />
              </div>
              {(["subjektif", "objektif", "assesment", "terapi"] as FormField[]).map((field) => (
                <div key={field}>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{FORM_FIELDS[field]}</label>
                  <textarea value={formData[field]} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    rows={field === "objektif" ? 10 : 5} placeholder={`Isi ${FORM_FIELDS[field].toLowerCase()}...`}
                    className="w-full mt-1 px-2 py-1.5 text-[11px] bg-background border border-border rounded focus:outline-none focus:border-emerald-500 font-mono" />
                </div>
              ))}
              <button onClick={handleGenerateFromForm} disabled={loading || !formData.subjektif}
                className="w-full inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50">
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bot className="h-3 w-3" />}
                Generate SOAP dari Form
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-2 py-1.5 border-b border-border bg-muted/10">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Output SOAP</p>
            <div className="flex items-center gap-1">
              <button onClick={handleCopy} disabled={!soapOutput}
                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50">
                <Copy className="h-2.5 w-2.5" />{copied ? "Copied" : "Copy"}
              </button>
              <button onClick={handleSave} disabled={!soapOutput || saving || !!savedVisitId}
                className={cn("inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded text-white transition-colors disabled:opacity-50",
                  savedVisitId ? "bg-emerald-700" : "bg-emerald-500 hover:bg-emerald-600")}>
                {saving ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : savedVisitId ? <Check className="h-2.5 w-2.5" /> : <Save className="h-2.5 w-2.5" />}
                {savedVisitId ? "Tersimpan" : "Simpan"}
              </button>
            </div>
          </div>
          <div ref={outputRef} className="flex-1 overflow-y-auto p-3">
            {soapOutput ? (
              <pre className="text-[11px] font-mono whitespace-pre-wrap text-foreground/90 leading-relaxed">{soapOutput}</pre>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-[11px] text-muted-foreground text-center px-4">
                  {mode === "chat"
                    ? "Kirim laporan klinis untuk generate SOAP"
                    : "Isi form di sebelah kiri lalu klik Generate"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PatientPicker({
  patients,
  onSelect,
  onCreateNew,
  creating,
}: {
  patients: Patient[];
  onSelect: (p: Patient) => void;
  onCreateNew: (data: { name: string; medicalRecordNo?: string; birthDate?: string; sex?: string; room?: string; bed?: string; parentName?: string; phone?: string }) => void;
  creating: boolean;
}) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", medicalRecordNo: "", birthDate: "", sex: "L", room: "DAHLIA", bed: "", parentName: "", phone: "" });
  const filtered = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.medicalRecordNo || "").toLowerCase().includes(q)
    );
  }, [patients, search]);

  const handleSubmitNew = () => {
    if (!form.name.trim() || creating) return;
    onCreateNew({
      name: form.name.trim(),
      medicalRecordNo: form.medicalRecordNo.trim() || undefined,
      birthDate: form.birthDate || undefined,
      sex: form.sex || undefined,
      room: form.room || undefined,
      bed: form.bed.trim() || undefined,
      parentName: form.parentName.trim() || undefined,
      phone: form.phone.trim() || undefined,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-emerald-400" />
        <h1 className="text-lg font-bold">SOAP Creator</h1>
      </div>
      <p className="text-xs text-muted-foreground">Pilih pasien rawat inap atau buat pasien baru untuk membuat SOAP note.</p>

      <button
        onClick={() => setShowForm(!showForm)}
        className={cn("w-full flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-colors",
          showForm
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-muted/30 border-border text-foreground hover:border-emerald-500/30 hover:bg-emerald-500/5")}
      >
        {showForm ? <X className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
        {showForm ? "Batal buat pasien baru" : "+ Buat Pasien Baru"}
      </button>

      {showForm && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Pasien Baru</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className="text-[10px] text-muted-foreground">Nama Pasien *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="An. Budi"
                className="w-full mt-0.5 px-2 py-1.5 text-[12px] bg-background border border-border rounded focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">No RM</label>
              <input value={form.medicalRecordNo} onChange={(e) => setForm({ ...form, medicalRecordNo: e.target.value })} placeholder="123456"
                className="w-full mt-0.5 px-2 py-1.5 text-[12px] bg-background border border-border rounded focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Tanggal Lahir</label>
              <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                className="w-full mt-0.5 px-2 py-1.5 text-[12px] bg-background border border-border rounded focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Jenis Kelamin</label>
              <select value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}
                className="w-full mt-0.5 px-2 py-1.5 text-[12px] bg-background border border-border rounded focus:outline-none focus:border-emerald-500">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Ruangan</label>
              <select value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })}
                className="w-full mt-0.5 px-2 py-1.5 text-[12px] bg-background border border-border rounded focus:outline-none focus:border-emerald-500">
                <option value="DAHLIA">DAHLIA</option>
                <option value="ANGGREK">ANGGREK</option>
                <option value="MELATI">MELATI</option>
                <option value="SERUNI">SERUNI</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Kamar/Bed</label>
              <input value={form.bed} onChange={(e) => setForm({ ...form, bed: e.target.value })} placeholder="K.01"
                className="w-full mt-0.5 px-2 py-1.5 text-[12px] bg-background border border-border rounded focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">Orang Tua</label>
              <input value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} placeholder="Ny. Ani"
                className="w-full mt-0.5 px-2 py-1.5 text-[12px] bg-background border border-border rounded focus:outline-none focus:border-emerald-500" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] text-muted-foreground">No HP</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08123456789"
                className="w-full mt-0.5 px-2 py-1.5 text-[12px] bg-background border border-border rounded focus:outline-none focus:border-emerald-500" />
            </div>
          </div>
          <button onClick={handleSubmitNew} disabled={!form.name.trim() || creating}
            className="w-full inline-flex items-center justify-center gap-1.5 text-[12px] font-semibold px-3 py-2 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50">
            {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
            Buat & Lanjut ke SOAP
          </button>
        </div>
      )}

      {!showForm && (
        <>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau no RM..."
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-emerald-500" />
          <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">Tidak ada pasien ditemukan.</p>
            ) : (
              filtered.map((p) => (
                <button key={p.id} onClick={() => onSelect(p)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-md border border-border hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-colors text-left">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {p.medicalRecordNo || "—"} • {p.room || "—"} {p.bed || ""} • {ageFromBirthDate(p.birthDate)}
                    </p>
                  </div>
                  <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded", p.sex === "L" ? "bg-blue-500/20 text-blue-300" : "bg-pink-500/20 text-pink-300")}>
                    {p.sex || "?"}
                  </span>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
