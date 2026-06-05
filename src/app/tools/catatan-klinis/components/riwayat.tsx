"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, CalcButton, InfoBox } from "../../components/calc-ui";

export function RiwayatPenyakit() {
  const { ageMonths, weightGram, sex, heightCm } = usePatient();
  const [patientName, setPatientName] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [onset, setOnset] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [character, setCharacter] = useState("");
  const [aggravating, setAggravating] = useState("");
  const [relieving, setRelieving] = useState("");
  const [timing, setTiming] = useState("");
  const [severity, setSeverity] = useState("");
  const [associated, setAssociated] = useState("");
  const [pmh, setPmh] = useState("");
  const [birthHistory, setBirthHistory] = useState("");
  const [immunization, setImmunization] = useState("");
  const [nutrition, setNutrition] = useState("");
  const [familyHistory, setFamilyHistory] = useState("");
  const [socialHistory, setSocialHistory] = useState("");
  const [copied, setCopied] = useState(false);

  const ageYr = Math.floor(ageMonths / 12);
  const ageMo = ageMonths % 12;
  const ageStr = ageYr > 0 ? `${ageYr} thn ${ageMo} bln` : `${ageMo} bln`;
  const weightKg = (weightGram / 1000).toFixed(1);
  const sexStr = sex === "L" ? "Laki-laki" : "Perempuan";

  const output = `RIWAYAT PENYAKIT
=================
Nama: ${patientName || "..."}
Usia: ${ageStr} | JK: ${sexStr} | BB: ${weightKg} kg | TB: ${heightCm} cm

CHIEF COMPLAINT:
${chiefComplaint || "..."}

PENYEBAB & KELUHAN UTAMA (OLDCARTS):
  Onset: ${onset || "..."}
  Location: ${location || "..."}
  Duration: ${duration || "..."}
  Character: ${character || "..."}
  Aggravating: ${aggravating || "..."}
  Relieving: ${relieving || "..."}
  Timing: ${timing || "..."}
  Severity: ${severity || "..."}

Associated Symptoms:
${associated || "..."}

RIWAYAT PENYAKIT SEKARANG:
${pmh || "..."}

RIWAYAT KELAHIRAN (untuk neonatus/bayi):
${birthHistory || "..."}

IMUNISASI:
${immunization || "..."}

NUTRISI:
${nutrition || "..."}

RIWAYAT KELUARGA:
${familyHistory || "..."}

RIWAYAT SOSIAL:
${socialHistory || "..."}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Riwayat Penyakit" icon="📖" color="purple">
      <div className="space-y-3">
        <CalcInput label="Nama Pasien" type="text" value={patientName} onChange={(v) => setPatientName(typeof v === "string" ? v : String(v))} />
        <InfoBox>Pasien: {ageStr} · {sexStr} · BB {weightKg} kg · TB {heightCm} cm</InfoBox>

        <CalcInput label="Chief Complaint" type="text" value={chiefComplaint} onChange={(v) => setChiefComplaint(typeof v === "string" ? v : String(v))} placeholder="Keluhan utama pasien" />

        <InfoBox>POLA OLDCARTS (keluhan utama)</InfoBox>
        <CalcInput label="Onset (Kapan mulai)" type="text" value={onset} onChange={(v) => setOnset(typeof v === "string" ? v : String(v))} placeholder="3 hari yang lalu, sejak lahir..." />
        <CalcInput label="Location (Lokasi)" type="text" value={location} onChange={(v) => setLocation(typeof v === "string" ? v : String(v))} placeholder="Perut kanan bawah, kepala..." />
        <CalcInput label="Duration (Durasi)" type="text" value={duration} onChange={(v) => setDuration(typeof v === "string" ? v : String(v))} placeholder="3 hari, 2 minggu..." />
        <CalcInput label="Character (Karakter)" type="text" value={character} onChange={(v) => setCharacter(typeof v === "string" ? v : String(v))} placeholder="Tajam, tumpul, kolik..." />
        <CalcInput label="Aggravating (Pemperparah)" type="text" value={aggravating} onChange={(v) => setAggravating(typeof v === "string" ? v : String(v))} placeholder="Makan, gerak..." />
        <CalcInput label="Relieving (Peringan)" type="text" value={relieving} onChange={(v) => setRelieving(typeof v === "string" ? v : String(v))} placeholder="Istirahat, minum..." />
        <CalcInput label="Timing (Waktu)" type="text" value={timing} onChange={(v) => setTiming(typeof v === "string" ? v : String(v))} placeholder="Pagi, malam, terus-menerus..." />
        <CalcInput label="Severity (Skala 1-10)" type="text" value={severity} onChange={(v) => setSeverity(typeof v === "string" ? v : String(v))} placeholder="7/10, tidak bisa dinilai..." />
        <CalcInput label="Gejala Terkait" type="text" value={associated} onChange={(v) => setAssociated(typeof v === "string" ? v : String(v))} placeholder="Mual, muntah, demam..." />

        <InfoBox>RIWAYAT LANJUTAN</InfoBox>
        <CalcInput label="Riwayat Penyakit Sekarang" type="text" value={pmh} onChange={(v) => setPmh(typeof v === "string" ? v : String(v))} placeholder=" kronik, alergi, operasi sebelumnya..." />
        <CalcInput label="Riwayat Kelahiran" type="text" value={birthHistory} onChange={(v) => setBirthHistory(typeof v === "string" ? v : String(v))} placeholder="Persalinan, APGAR, BB lahir..." />
        <CalcInput label="Imunisasi" type="text" value={immunization} onChange={(v) => setImmunization(typeof v === "string" ? v : String(v))} placeholder="Lengkap, BCG, DPT..." />
        <CalcInput label="Nutrisi / Pola Makan" type="text" value={nutrition} onChange={(v) => setNutrition(typeof v === "string" ? v : String(v))} placeholder="ASI, sufor, MPASI..." />
        <CalcInput label="Riwayat Keluarga" type="text" value={familyHistory} onChange={(v) => setFamilyHistory(typeof v === "string" ? v : String(v))} placeholder="DM, hipertensi, asma..." />
        <CalcInput label="Riwayat Sosial" type="text" value={socialHistory} onChange={(v) => setSocialHistory(typeof v === "string" ? v : String(v))} placeholder="Tinggal, sekolah, lingkungan..." />

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
