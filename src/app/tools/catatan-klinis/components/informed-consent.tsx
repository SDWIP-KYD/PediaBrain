"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, CalcButton, InfoBox, ResultAlert } from "../../components/calc-ui";

export function InformedConsent() {
  const { ageMonths, weightGram, sex } = usePatient();
  const [patientName, setPatientName] = useState("");
  const [tindakan, setTindakan] = useState("");
  const [indikasi, setIndikasi] = useState("");
  const [prosedur, setProsedur] = useState("");
  const [risiko, setRisiko] = useState("");
  const [manfaat, setManfaat] = useState("");
  const [alternatif, setAlternatif] = useState("");
  const [namaDokter, setNamaDokter] = useState("");
  const [namaWali, setNamaWali] = useState("");
  const [copied, setCopied] = useState(false);

  const ageYr = Math.floor(ageMonths / 12);
  const ageMo = ageMonths % 12;
  const ageStr = ageYr > 0 ? `${ageYr} thn ${ageMo} bln` : `${ageMo} bln`;
  const weightKg = (weightGram / 1000).toFixed(1);
  const sexStr = sex === "L" ? "Laki-laki" : "Perempuan";

  const output = `INFORMED CONSENT / PERSETUJUAN TINDAKAN MEDIK
=================================================
Saya yang bertanda tangan di bawah ini:

Nama Orang Tua/Wali: ${namaWali || "..."}
Nama Pasien: ${patientName || "..."}
Usia Pasien: ${ageStr} | JK: ${sexStr} | BB: ${weightKg} kg

Dengan ini menyatakan telah mendapatkan penjelasan yang cukup dari:

Dokter: ${namaDokter || "..."}

Tentang tindakan: ${tindakan || "..."}

1. INDIKASI:
${indikasi || "..."}

2. PROSEDUR TINDAKAN:
${prosedur || "..."}

3. RISIKO / KOMPLIKASI:
${risiko || "..."}

4. MANFAAT:
${manfaat || "..."}

5. ALTERNATIF LAIN:
${alternatif || "..."}

Saya memahami risiko dan manfaat dari tindakan tersebut dan dengan ini memberikan persetujuan untuk dilakukannya tindakan medis tersebut.

${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

Tanda Tangan Orang Tua/Wali:


${namaWali || "..."}


Tanda Tangan Dokter:

${namaDokter || "..."}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Informed Consent" icon="✍️" color="purple">
      <div className="space-y-3">
        <CalcInput label="Nama Pasien" type="text" value={patientName} onChange={(v) => setPatientName(typeof v === "string" ? v : String(v))} />
        <CalcInput label="Nama Orang Tua / Wali" type="text" value={namaWali} onChange={(v) => setNamaWali(typeof v === "string" ? v : String(v))} />
        <InfoBox>Pasien: {ageStr} · {sexStr} · BB {weightKg} kg</InfoBox>
        <CalcInput label="Jenis Tindakan" type="text" value={tindakan} onChange={(v) => setTindakan(typeof v === "string" ? v : String(v))} placeholder="Intubasi, biopsi, operasi..." />
        <CalcInput label="Indikasi" type="text" value={indikasi} onChange={(v) => setIndikasi(typeof v === "string" ? v : String(v))} placeholder="Indikasi tindakan" />
        <CalcInput label="Prosedur" type="text" value={prosedur} onChange={(v) => setProsedur(typeof v === "string" ? v : String(v))} placeholder="Langkah-langkah tindakan" />
        <CalcInput label="Risiko / Komplikasi" type="text" value={risiko} onChange={(v) => setRisiko(typeof v === "string" ? v : String(v))} placeholder="Pendarahan, infeksi..." />
        <CalcInput label="Manfaat" type="text" value={manfaat} onChange={(v) => setManfaat(typeof v === "string" ? v : String(v))} placeholder="Manfaat tindakan" />
        <CalcInput label="Alternatif Lain" type="text" value={alternatif} onChange={(v) => setAlternatif(typeof v === "string" ? v : String(v))} placeholder="Pilihan lain: observasi, terapi..." />
        <CalcInput label="Nama Dokter" type="text" value={namaDokter} onChange={(v) => setNamaDokter(typeof v === "string" ? v : String(v))} placeholder="dr. ..., Sp.A" />

        <ResultAlert type="info">
          Formulir ini harus ditandatangani sebelum tindakan dilakukan. Untuk pasien &lt;18 tahun, wali sah yang menandatangani.
        </ResultAlert>

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
