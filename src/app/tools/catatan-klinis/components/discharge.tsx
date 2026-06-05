"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, CalcButton, InfoBox, ResultAlert } from "../../components/calc-ui";

export function SuratPulang() {
  const { ageMonths, weightGram, sex, heightCm } = usePatient();
  const [patientName, setPatientName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [kondisiPulang, setKondisiPulang] = useState("");
  const [obatPulang, setObatPulang] = useState("");
  const [instruksiOrangTua, setInstruksiOrangTua] = useState("");
  const [kontrol, setKontrol] = useState("");
  const [namaDokter, setNamaDokter] = useState("");
  const [copied, setCopied] = useState(false);

  const ageYr = Math.floor(ageMonths / 12);
  const ageMo = ageMonths % 12;
  const ageStr = ageYr > 0 ? `${ageYr} thn ${ageMo} bln` : `${ageMo} bln`;
  const weightKg = (weightGram / 1000).toFixed(1);
  const sexStr = sex === "L" ? "Laki-laki" : "Perempuan";

  const output = `SURAT PULANG / DISCHARGE SUMMARY
==================================
Nama: ${patientName || "..."}
Usia: ${ageStr} | JK: ${sexStr} | BB: ${weightKg} kg | TB: ${heightCm} cm
Tanggal Pulang: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

DIAGNOSIS:
${diagnosis || "..."}

KONDISI SAAT PULANG:
${kondisiPulang || "..."}

OBAT PULANG:
${obatPulang || "..."}

INSTRUKSI UNTUK ORANG TUA:
${instruksiOrangTua || "..."}

KONTROL LANJUTAN:
${kontrol || "..."}

Jika terjadi keadaan darurat, segera bawa ke IGD terdekat.
${namaDokter ? `Dokter Penulis,\n\n${namaDokter}` : ""}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Surat Pulang" icon="🏠" color="green">
      <div className="space-y-3">
        <CalcInput label="Nama Pasien" type="text" value={patientName} onChange={(v) => setPatientName(typeof v === "string" ? v : String(v))} />
        <InfoBox>Pasien: {ageStr} · {sexStr} · BB {weightKg} kg · TB {heightCm} cm</InfoBox>
        <CalcInput label="Diagnosis" type="text" value={diagnosis} onChange={(v) => setDiagnosis(typeof v === "string" ? v : String(v))} placeholder="Diagnosis saat pulang" />
        <CalcInput label="Kondisi Saat Pulang" type="text" value={kondisiPulang} onChange={(v) => setKondisiPulang(typeof v === "string" ? v : String(v))} placeholder="Baik, stabil..." />
        <CalcInput label="Obat Pulang" type="text" value={obatPulang} onChange={(v) => setObatPulang(typeof v === "string" ? v : String(v))} placeholder="Amoksisilin 250mg 3x1..." />
        <CalcInput label="Instruksi untuk Orang Tua" type="text" value={instruksiOrangTua} onChange={(v) => setInstruksiOrangTua(typeof v === "string" ? v : String(v))} placeholder="Tanda bahaya, diet, aktivitas..." />
        <CalcInput label="Kontrol Lanjutan" type="text" value={kontrol} onChange={(v) => setKontrol(typeof v === "string" ? v : String(v))} placeholder="Kontrol 1 minggu, lab ulang..." />
        <CalcInput label="Nama Dokter Penulis" type="text" value={namaDokter} onChange={(v) => setNamaDokter(typeof v === "string" ? v : String(v))} placeholder="dr. ..., Sp.A" />
        <ResultAlert type="warning">
         Instruksikan orang tua untuk kembali ke IGD jika: demam tidak turun, muntah terus menerus, sesak napas, atau penurunan kesadaran.
        </ResultAlert>
        <CalcResult>
          <pre className="whitespace-pre-wrap text-xs font-mono text-foreground leading-relaxed">{output}</pre>
        </CalcResult>
        <CalcButton onClick={handleCopy} color="green">
          {copied ? "✓ Tersalin!" : "📋 Copy to Clipboard"}
        </CalcButton>
      </div>
    </CalcCard>
  );
}
