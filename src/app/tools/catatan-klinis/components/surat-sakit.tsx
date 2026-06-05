"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, CalcButton, InfoBox } from "../../components/calc-ui";

export function SuratKeteranganSakit() {
  const { ageMonths, sex } = usePatient();
  const [patientName, setPatientName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [lamaIstirahat, setLamaIstirahat] = useState("");
  const [namaDokter, setNamaDokter] = useState("");
  const [namaSekolah, setNamaSekolah] = useState("");
  const [copied, setCopied] = useState(false);

  const ageYr = Math.floor(ageMonths / 12);
  const ageMo = ageMonths % 12;
  const ageStr = ageYr > 0 ? `${ageYr} thn ${ageMo} bln` : `${ageMo} bln`;
  const sexStr = sex === "L" ? "Laki-laki" : "Perempuan";

  const today = new Date();
  const output = `SURAT KETERANGAN SAKIT
========================

Yang bertanda tangan di bawah ini:

${namaDokter || "dr. ..., Sp.A"}

Dengan ini menerangkan bahwa:

Nama: ${patientName || "..."}
Usia: ${ageStr} | JK: ${sexStr}
${namaSekolah ? `Sekolah: ${namaSekolah}` : ""}

Sedang dalam keadaan sakit dengan diagnosis:
${diagnosis || "..."}

Berdasarkan pemeriksaan medis, pasien dianjurkan untuk:
Istirahat selama ${lamaIstirahat || "..."} hari terhitung sejak tanggal surat ini.

Demikian surat keterangan ini dibuat dengan sebenar-benarnya dan dapat dipergunakan sebagaimana mestinya.

${today.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

Dokter yang memeriksa,

${namaDokter || "dr. ..., Sp.A"}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Surat Keterangan Sakit" icon="📃" color="blue">
      <div className="space-y-3">
        <CalcInput label="Nama Pasien" type="text" value={patientName} onChange={(v) => setPatientName(typeof v === "string" ? v : String(v))} placeholder="Nama lengkap pasien" />
        <InfoBox>Pasien: {ageStr} · {sexStr}</InfoBox>
        <CalcInput label="Sekolah / Institusi" type="text" value={namaSekolah} onChange={(v) => setNamaSekolah(typeof v === "string" ? v : String(v))} placeholder="Nama sekolah (opsional)" />
        <CalcInput label="Diagnosis" type="text" value={diagnosis} onChange={(v) => setDiagnosis(typeof v === "string" ? v : String(v))} placeholder="ISPA, DBD, Fraktur..." />
        <CalcInput label="Lama Istirahat (hari)" type="text" value={lamaIstirahat} onChange={(v) => setLamaIstirahat(typeof v === "string" ? v : String(v))} placeholder="3 hari" />
        <CalcInput label="Nama Dokter" type="text" value={namaDokter} onChange={(v) => setNamaDokter(typeof v === "string" ? v : String(v))} placeholder="dr. ..., Sp.A" />
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
