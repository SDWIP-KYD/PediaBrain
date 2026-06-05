"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, CalcButton, InfoBox } from "../../components/calc-ui";

const prosedurOptions = [
  { value: "intubasi", label: "Intubasi Endotrakeal" },
  { value: "chest-tube", label: "Pemasangan Chest Tube" },
  { value: "cvc", label: "Pemasangan CVC" },
  { value: "usia", label: "USIA (Umbilical Venous Catheter)" },
  { value: "lp", label: "Lumbal Pungsi" },
  { value: "biopsy", label: "Biopsi" },
  { value: "resusitasi", label: "Resusitasi Neonatus/Anak" },
  { value: "drainase", label: "Drainase Abses" },
  { value: "set", label: "Sutura / EP" },
  { value: "lainnya", label: "Lainnya" },
];

export function CatatanProsedur() {
  const { ageMonths, weightGram, sex } = usePatient();
  const [patientName, setPatientName] = useState("");
  const [prosedur, setProsedur] = useState("intubasi");
  const [indikasi, setIndikasi] = useState("");
  const [persiapan, setPersiapan] = useState("");
  const [teknik, setTeknik] = useState("");
  const [komplikasi, setKomplikasi] = useState("");
  const [hasil, setHasil] = useState("");
  const [pascaProsedur, setPascaProsedur] = useState("");
  const [namaDokter, setNamaDokter] = useState("");
  const [copied, setCopied] = useState(false);

  const ageYr = Math.floor(ageMonths / 12);
  const ageMo = ageMonths % 12;
  const ageStr = ageYr > 0 ? `${ageYr} thn ${ageMo} bln` : `${ageMo} bln`;
  const weightKg = (weightGram / 1000).toFixed(1);
  const sexStr = sex === "L" ? "Laki-laki" : "Perempuan";

  const prosedurLabel = prosedurOptions.find((p) => p.value === prosedur)?.label || prosedur;

  const output = `CATATAN PROSEDUR
==================
Nama: ${patientName || "..."}
Usia: ${ageStr} | JK: ${sexStr} | BB: ${weightKg} kg
Tanggal: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

JENIS PROSEDUR: ${prosedurLabel}

INDIKASI:
${indikasi || "..."}

PERSIAPAN:
${persiapan || "..."}

TEKNIK / PROSEDUR:
${teknik || "..."}

KOMPLIKASI:
${komplikasi || "Tidak ada komplikasi"}

HASIL:
${hasil || "..."}

PERAWATAN PASCA PROSEDUR:
${pascaProsedur || "..."}

Dokter Pelaksana:
${namaDokter || "..."}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Catatan Prosedur" icon="🔧" color="cyan">
      <div className="space-y-3">
        <CalcInput label="Nama Pasien" type="text" value={patientName} onChange={(v) => setPatientName(typeof v === "string" ? v : String(v))} />
        <InfoBox>Pasien: {ageStr} · {sexStr} · BB {weightKg} kg</InfoBox>
        <CalcSelect label="Jenis Prosedur" value={prosedur} onChange={setProsedur} options={prosedurOptions} />
        <CalcInput label="Indikasi" type="text" value={indikasi} onChange={(v) => setIndikasi(typeof v === "string" ? v : String(v))} placeholder="Indikasi prosedur" />
        <CalcInput label="Persiapan" type="text" value={persiapan} onChange={(v) => setPersiapan(typeof v === "string" ? v : String(v))} placeholder="Informed consent, posisi, anestesi..." />
        <CalcInput label="Teknik / Prosedur" type="text" value={teknik} onChange={(v) => setTeknik(typeof v === "string" ? v : String(v))} placeholder="Langkah-langkah prosedur..." />
        <CalcInput label="Komplikasi" type="text" value={komplikasi} onChange={(v) => setKomplikasi(typeof v === "string" ? v : String(v))} placeholder="Tidak ada / komplikasi..." />
        <CalcInput label="Hasil" type="text" value={hasil} onChange={(v) => setHasil(typeof v === "string" ? v : String(v))} placeholder="Hasil prosedur" />
        <CalcInput label="Perawatan Pasca Prosedur" type="text" value={pascaProsedur} onChange={(v) => setPascaProsedur(typeof v === "string" ? v : String(v))} placeholder="Monitor vital sign, obs cairan..." />
        <CalcInput label="Nama Dokter Pelaksana" type="text" value={namaDokter} onChange={(v) => setNamaDokter(typeof v === "string" ? v : String(v))} placeholder="dr. ..., Sp.A" />
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
