"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, CalcButton, InfoBox } from "../../components/calc-ui";

interface Problem {
  description: string;
  goal: string;
  intervention: string;
  monitoring: string;
}

export function NutriCarePlan() {
  const { ageMonths, weightGram, sex } = usePatient();
  const weightKg = weightGram / 1000;
  const [patientName, setPatientName] = useState("");
  const [problems, setProblems] = useState<Problem[]>([
    { description: "", goal: "", intervention: "", monitoring: "" },
  ]);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);

  const ageYr = Math.floor(ageMonths / 12);
  const ageMo = ageMonths % 12;
  const ageStr = ageYr > 0 ? `${ageYr} thn ${ageMo} bln` : `${ageMo} bln`;

  const addProblem = () => {
    setProblems((prev) => [...prev, { description: "", goal: "", intervention: "", monitoring: "" }]);
  };

  const removeProblem = (idx: number) => {
    setProblems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateProblem = (idx: number, field: keyof Problem, value: string) => {
    setProblems((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const validProblems = problems.filter((p) => p.description.trim());

  const output = `NUTRITION CARE PLAN
======================
Nama: ${patientName || "..."}
Usia: ${ageStr} | BB: ${weightKg.toFixed(1)} kg | JK: ${sex === "L" ? "Laki-laki" : "Perempuan"}

DIAGNOSIS GIZI: ${diagnosis || "..."}

PROBLEMS, GOALS, & INTERVENSI:
${validProblems.length > 0
  ? validProblems.map((p, i) =>
      `${i + 1}. PROBLEM: ${p.description}
   GOAL: ${p.goal || "-"}
   INTERVENSI: ${p.intervention || "-"}
   MONITORING: ${p.monitoring || "-"}`
  ).join("\n\n")
  : "Belum ada problem tercatat"}

CATATAN: ${notes || "-"}

Tanggal: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
Dokter/Gizi: _______________`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Nutrition Care Plan" icon="📋" color="purple">
      <div className="space-y-3">
        <CalcInput label="Nama Pasien" type="text" value={patientName} onChange={(v) => setPatientName(typeof v === "string" ? v : String(v))} />
        <InfoBox>Pasien: {ageStr} · BB {weightKg.toFixed(1)} kg · {sex === "L" ? "Laki-laki" : "Perempuan"}</InfoBox>

        <CalcInput label="Diagnosa Gizi" type="text" value={diagnosis} onChange={(v) => setDiagnosis(typeof v === "string" ? v : String(v))} placeholder="Malnutrisi, kelebihan kalori, defisiensi zat besi..." />

        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-purple-400">Problem List & Rencana</p>
          {problems.map((problem, idx) => (
            <div key={idx} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-foreground">Problem {idx + 1}</p>
                {problems.length > 1 && (
                  <button onClick={() => removeProblem(idx)} className="text-[10px] text-red-400 hover:text-red-300">
                    Hapus
                  </button>
                )}
              </div>
              <CalcInput label="Problem" type="text" value={problem.description} onChange={(v) => updateProblem(idx, "description", typeof v === "string" ? v : String(v))} placeholder="Deskripsi masalah gizi..." />
              <CalcInput label="Goal" type="text" value={problem.goal} onChange={(v) => updateProblem(idx, "goal", typeof v === "string" ? v : String(v))} placeholder="Target yang ingin dicapai..." />
              <CalcInput label="Intervensi" type="text" value={problem.intervention} onChange={(v) => updateProblem(idx, "intervention", typeof v === "string" ? v : String(v))} placeholder="Tindakan yang akan dilakukan..." />
              <CalcInput label="Monitoring" type="text" value={problem.monitoring} onChange={(v) => updateProblem(idx, "monitoring", typeof v === "string" ? v : String(v))} placeholder="Parameter evaluasi..." />
            </div>
          ))}
          <button onClick={addProblem} className="w-full rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:bg-accent transition-colors">
            + Tambah Problem
          </button>
        </div>

        <CalcInput label="Catatan Tambahan" type="text" value={notes} onChange={(v) => setNotes(typeof v === "string" ? v : String(v))} placeholder="Catatan klinis lainnya..." />

        <CalcResult color="purple">
          <ResultGrid cols={2}>
            <ResultItem label="Total Problems" value={`${validProblems.length}`} />
            <ResultItem label="Status" value={validProblems.length > 0 ? "Rencana siap" : "Belum ada problem"} />
          </ResultGrid>
        </CalcResult>

        <CalcResult>
          <pre className="whitespace-pre-wrap text-xs font-mono text-foreground leading-relaxed">{output}</pre>
        </CalcResult>
        <CalcButton onClick={handleCopy} color="cyan">
          {copied ? "✓ Tersalin!" : "📋 Copy to Clipboard"}
        </CalcButton>
      </div>
    </CalcCard>
  );
}
