"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, CalcButton, InfoBox } from "../../components/calc-ui";

export function SOAPNote() {
  const { ageMonths, weightGram, sex } = usePatient();
  const [patientName, setPatientName] = useState("");
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [copied, setCopied] = useState(false);

  const ageYr = Math.floor(ageMonths / 12);
  const ageMo = ageMonths % 12;
  const ageStr = ageYr > 0 ? `${ageYr} thn ${ageMo} bln` : `${ageMo} bln`;
  const weightKg = (weightGram / 1000).toFixed(1);
  const sexStr = sex === "L" ? "Laki-laki" : "Perempuan";

  const output = `SOAP NOTE
==========
Nama Pasien: ${patientName || "..."}
Usia: ${ageStr}
BB: ${weightKg} kg
Jenis Kelamin: ${sexStr}

SUBJECTIVE:
${subjective || "..."}

OBJECTIVE:
${objective || "..."}

ASSESSMENT:
${assessment || "..."}

PLAN:
${plan || "..."}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="SOAP Note Generator" icon="📋" color="cyan">
      <div className="space-y-3">
        <CalcInput label="Nama Pasien" type="text" value={patientName} onChange={(v) => setPatientName(typeof v === "string" ? v : String(v))} placeholder="Nama pasien" />
        <InfoBox>Pasien: {ageStr} · {sexStr} · BB {weightKg} kg</InfoBox>
        <CalcInput label="Subjective (Keluhan Utama + Riwayat)" type="text" value={subjective} onChange={(v) => setSubjective(typeof v === "string" ? v : String(v))} placeholder="Contoh: Demam 3 hari, batuk pilek..." />
        <CalcInput label="Objective (Pemeriksaan Fisik & Data)" type="text" value={objective} onChange={(v) => setObjective(typeof v === "string" ? v : String(v))} placeholder="Contoh: TD 100/60, RR 28, T 38.5°C..." />
        <CalcInput label="Assessment (Diagnosis Banding)" type="text" value={assessment} onChange={(v) => setAssessment(typeof v === "string" ? v : String(v))} placeholder="Contoh: 1. ISPA 2. Bronkitis" />
        <CalcInput label="Plan (Rencana Tindakan)" type="text" value={plan} onChange={(v) => setPlan(typeof v === "string" ? v : String(v))} placeholder="Contoh: Amoksisilin 25mg/kgBB, istirahat..." />
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
