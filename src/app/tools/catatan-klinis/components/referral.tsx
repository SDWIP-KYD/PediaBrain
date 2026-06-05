"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, CalcButton, InfoBox } from "../../components/calc-ui";

const spesialisOptions = [
  { value: "anak", label: "Anak (Pediatri)" },
  { value: "anak-nefro", label: "Anak - Nefrologi" },
  { value: "anak-hematologi", label: "Anak - Hematologi" },
  { value: "anak-onkologi", label: "Anak - Onkologi" },
  { value: "anak-kardio", label: "Anak - Kardiologi" },
  { value: "anak-neurologi", label: "Anak - Neurologi" },
  { value: "anak-endokrin", label: "Anak - Endokrinologi" },
  { value: "anak-gastro", label: "Anak - Gastroenterologi" },
  { value: "anak-paru", label: "Anak - Pulmonologi" },
  { value: "bedah-anak", label: "Bedah Anak" },
  { value: "tHT", label: "THT" },
  { value: "mata", label: "Mata" },
  { value: "lainnya", label: "Lainnya" },
];

export function SuratRujukan() {
  const { ageMonths, weightGram, sex } = usePatient();
  const [patientName, setPatientName] = useState("");
  const [spesialis, setSpesialis] = useState("anak");
  const [alasan, setAlasan] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [riwayatSingkat, setRiwayatSingkat] = useState("");
  const [terapiSaatIni, setTerapiSaatIni] = useState("");
  const [namaDokter, setNamaDokter] = useState("");
  const [copied, setCopied] = useState(false);

  const ageYr = Math.floor(ageMonths / 12);
  const ageMo = ageMonths % 12;
  const ageStr = ageYr > 0 ? `${ageYr} thn ${ageMo} bln` : `${ageMo} bln`;
  const weightKg = (weightGram / 1000).toFixed(1);
  const sexStr = sex === "L" ? "Laki-laki" : "Perempuan";

  const spesialisLabel = spesialisOptions.find((s) => s.value === spesialis)?.label || spesialis;

  const output = `SURAT RUJUKAN
==============
Kepada Yth.
Dokter Sp. ${spesialisLabel}
Di Tempat

Dengan hormat,

Mohon pertimbangan dan penanganan lanjutan atas pasien berikut:

Nama: ${patientName || "..."}
Usia: ${ageStr} | JK: ${sexStr} | BB: ${weightKg} kg

Diagnosis: ${diagnosis || "..."}

Alasan Rujukan:
${alasan || "..."}

Riwayat Singkat:
${riwayatSingkat || "..."}

Terapi Saat Ini:
${terapiSaatIni || "..."}

Demikian surat rujukan ini dibuat dengan sebenar-benarnya. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.

${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

${namaDokter || "..."}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Surat Rujukan" icon="📨" color="blue">
      <div className="space-y-3">
        <CalcInput label="Nama Pasien" type="text" value={patientName} onChange={(v) => setPatientName(typeof v === "string" ? v : String(v))} />
        <InfoBox>Pasien: {ageStr} · {sexStr} · BB {weightKg} kg</InfoBox>
        <CalcSelect label="Rujuk ke Spesialis" value={spesialis} onChange={setSpesialis} options={spesialisOptions} />
        <CalcInput label="Diagnosis" type="text" value={diagnosis} onChange={(v) => setDiagnosis(typeof v === "string" ? v : String(v))} placeholder="Diagnosis ICD-10" />
        <CalcInput label="Alasan Rujukan" type="text" value={alasan} onChange={(v) => setAlasan(typeof v === "string" ? v : String(v))} placeholder="Minta konsultasi / tindakan..." />
        <CalcInput label="Riwayat Singkat" type="text" value={riwayatSingkat} onChange={(v) => setRiwayatSingkat(typeof v === "string" ? v : String(v))} placeholder="Ringkasan kasus..." />
        <CalcInput label="Terapi Saat Ini" type="text" value={terapiSaatIni} onChange={(v) => setTerapiSaatIni(typeof v === "string" ? v : String(v))} placeholder="Obat yang sedang dikonsumsi..." />
        <CalcInput label="Nama Dokter Pengirim" type="text" value={namaDokter} onChange={(v) => setNamaDokter(typeof v === "string" ? v : String(v))} placeholder="dr. ..., Sp.A" />
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
