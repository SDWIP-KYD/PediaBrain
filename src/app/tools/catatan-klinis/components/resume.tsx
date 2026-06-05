"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, CalcButton, InfoBox } from "../../components/calc-ui";

const statusOptions = [
  { value: "rawat-inap", label: "Rawat Inap" },
  { value: "rawat-jalan", label: "Rawat Jalan" },
  { value: "ugd", label: "IGD" },
  { value: "nicu", label: "NICU" },
  { value: "picu", label: "PICU" },
];

export function ResumeMedis() {
  const { ageMonths, weightGram, sex, heightCm } = usePatient();
  const [patientName, setPatientName] = useState("");
  const [status, setStatus] = useState("rawat-inap");
  const [diagnosis, setDiagnosis] = useState("");
  const [riwayatPenyakit, setRiwayatPenyakit] = useState("");
  const [pemeriksaan, setPemeriksaan] = useState("");
  const [penunjang, setPenunjang] = useState("");
  const [terapi, setTerapi] = useState("");
  const [kondisi, setKondisi] = useState("");
  const [rencana, setRencana] = useState("");
  const [copied, setCopied] = useState(false);

  const ageYr = Math.floor(ageMonths / 12);
  const ageMo = ageMonths % 12;
  const ageStr = ageYr > 0 ? `${ageYr} thn ${ageMo} bln` : `${ageMo} bln`;
  const weightKg = (weightGram / 1000).toFixed(1);
  const sexStr = sex === "L" ? "Laki-laki" : "Perempuan";

  const output = `RESUME MEDIS
=============
Nama: ${patientName || "..."}
Usia: ${ageStr} | JK: ${sexStr} | BB: ${weightKg} kg | TB: ${heightCm} cm
Status: ${status.toUpperCase()}

DIAGNOSIS:
${diagnosis || "..."}

RIWAYAT PENYAKIT:
${riwayatPenyakit || "..."}

PEMERIKSAAN FISIK:
${pemeriksaan || "..."}

PEMERIKSAAN PENUNJANG:
${penunjang || "..."}

TERAPI / TATA LAKSANA:
${terapi || "..."}

KONDISI SAAT INI:
${kondisi || "..."}

RENCANA:
${rencana || "..."}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Resume Medis" icon="📄" color="purple">
      <div className="space-y-3">
        <CalcInput label="Nama Pasien" type="text" value={patientName} onChange={(v) => setPatientName(typeof v === "string" ? v : String(v))} />
        <InfoBox>Pasien: {ageStr} · {sexStr} · BB {weightKg} kg · TB {heightCm} cm</InfoBox>
        <CalcSelect label="Status" value={status} onChange={setStatus} options={statusOptions} />
        <CalcInput label="Diagnosis Utama" type="text" value={diagnosis} onChange={(v) => setDiagnosis(typeof v === "string" ? v : String(v))} placeholder="ICD-10 / diagnosis" />
        <CalcInput label="Riwayat Penyakit Sekarang" type="text" value={riwayatPenyakit} onChange={(v) => setRiwayatPenyakit(typeof v === "string" ? v : String(v))} placeholder="Onset, durasi, gejala..." />
        <CalcInput label="Pemeriksaan Fisik" type="text" value={pemeriksaan} onChange={(v) => setPemeriksaan(typeof v === "string" ? v : String(v))} placeholder="TD, RR, Nadi, Suhu, Status Generalis..." />
        <CalcInput label="Pemeriksaan Penunjang" type="text" value={penunjang} onChange={(v) => setPenunjang(typeof v === "string" ? v : String(v))} placeholder="Lab, Rontgen, USG..." />
        <CalcInput label="Terapi / Tata Laksana" type="text" value={terapi} onChange={(v) => setTerapi(typeof v === "string" ? v : String(v))} placeholder="Obat, prosedur..." />
        <CalcInput label="Kondisi Saat Pulang" type="text" value={kondisi} onChange={(v) => setKondisi(typeof v === "string" ? v : String(v))} placeholder="Baik, perlu follow-up..." />
        <CalcInput label="Rencana Follow-up" type="text" value={rencana} onChange={(v) => setRencana(typeof v === "string" ? v : String(v))} placeholder="Kontrol 1 minggu, lab ulang..." />
        <CalcResult>
          <pre className="whitespace-pre-wrap text-xs font-mono text-foreground leading-relaxed">{output}</pre>
        </CalcResult>
        <CalcButton onClick={handleCopy} color="purple">
          {copied ? "✓ Tersalin!" : "📋 Copy to Clipboard"}
        </CalcButton>
      </div>
    </CalcCard>
  );
}
