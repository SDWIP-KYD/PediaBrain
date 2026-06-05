"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, CalcButton, InfoBox } from "../../components/calc-ui";

export function CatatanMedisHarian() {
  const { ageMonths, weightGram, sex, heightCm } = usePatient();
  const [patientName, setPatientName] = useState("");
  const [hariKe, setHariKe] = useState(1);
  const [vitalSigns, setVitalSigns] = useState("");
  const [kondisiUmum, setKondisiUmum] = useState("");
  const [sistem, setSistem] = useState("");
  const [masukanCairan, setMasukanCairan] = useState("");
  const [keluaranCairan, setKeluaranCairan] = useState("");
  const [terapi, setTerapi] = useState("");
  const [perkembangan, setPerkembangan] = useState("");
  const [rencana, setRencana] = useState("");
  const [copied, setCopied] = useState(false);

  const ageYr = Math.floor(ageMonths / 12);
  const ageMo = ageMonths % 12;
  const ageStr = ageYr > 0 ? `${ageYr} thn ${ageMo} bln` : `${ageMo} bln`;
  const weightKg = (weightGram / 1000).toFixed(1);
  const sexStr = sex === "L" ? "Laki-laki" : "Perempuan";

  const output = `CATATAN MEDIS HARIAN — HARI KE-${hariKe}
=========================================
Nama: ${patientName || "..."}
Usia: ${ageStr} | JK: ${sexStr} | BB: ${weightKg} kg | TB: ${heightCm} cm
Tanggal: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

VITAL SIGNS:
${vitalSigns || "..."}

KONDISI UMUM:
${kondisiUmum || "..."}

SISTEM:
${sistem || "..."}

MASUKAN CAIRAN:
${masukanCairan || "..."}

KELUARAN CAIRAN:
${keluaranCairan || "..."}

TERAPI HARI INI:
${terapi || "..."}

PERKEMBANGAN:
${perkembangan || "..."}

RENCANA:
${rencana || "..."}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Catatan Medis Harian" icon="📝" color="teal">
      <div className="space-y-3">
        <CalcInput label="Nama Pasien" type="text" value={patientName} onChange={(v) => setPatientName(typeof v === "string" ? v : String(v))} />
        <CalcInput label="Hari Ke-" value={hariKe} onChange={(v) => setHariKe(typeof v === "string" ? parseInt(v) || 1 : v)} min={1} />
        <InfoBox>Pasien: {ageStr} · {sexStr} · BB {weightKg} kg · TB {heightCm} cm</InfoBox>
        <CalcInput label="Vital Signs" type="text" value={vitalSigns} onChange={(v) => setVitalSigns(typeof v === "string" ? v : String(v))} placeholder="TD, RR, Nadi, Suhu, SpO2, GCS" />
        <CalcInput label="Kondisi Umum" type="text" value={kondisiUmum} onChange={(v) => setKondisiUmum(typeof v === "string" ? v : String(v))} placeholder="Baik, sakit berat, payah..." />
        <CalcInput label="Sistem (per system review)" type="text" value={sistem} onChange={(v) => setSistem(typeof v === "string" ? v : String(v))} placeholder="Respirasi, kardio, GI, neuro..." />
        <CalcInput label="Masukan Cairan (mL)" type="text" value={masukanCairan} onChange={(v) => setMasukanCairan(typeof v === "string" ? v : String(v))} placeholder="IV: 500mL, oral: 200mL..." />
        <CalcInput label="Keluaran Cairan (mL)" type="text" value={keluaranCairan} onChange={(v) => setKeluaranCairan(typeof v === "string" ? v : String(v))} placeholder="Urine: 300mL, emesis: 50mL..." />
        <CalcInput label="Terapi Hari Ini" type="text" value={terapi} onChange={(v) => setTerapi(typeof v === "string" ? v : String(v))} placeholder="Obat, cairan, prosedur..." />
        <CalcInput label="Perkembangan" type="text" value={perkembangan} onChange={(v) => setPerkembangan(typeof v === "string" ? v : String(v))} placeholder="Membaik, stagnan, memburuk..." />
        <CalcInput label="Rencana Lanjutan" type="text" value={rencana} onChange={(v) => setRencana(typeof v === "string" ? v : String(v))} placeholder="Lanjut terapi, evaluasi..." />
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
