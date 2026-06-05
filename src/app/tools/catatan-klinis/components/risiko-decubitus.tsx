"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultItem, ResultGrid, CalcButton, InfoBox, ResultAlert } from "../../components/calc-ui";

interface BradenQItem {
  key: string;
  label: string;
  options: { label: string; score: number }[];
}

const bradenQItems: BradenQItem[] = [
  {
    key: "sensory",
    label: "Respon Sensori",
    options: [
      { label: "Terbatas: tidak merespon terhadap rasa sakit (1)", score: 1 },
      { label: "Sangat terbatas: hanya merespon nyeri tekan (2)", score: 2 },
      { label: "Terbatas: merespon verbal/taktil tapi tidak dapat merespon secara konsisten (3)", score: 3 },
      { label: "Tidak terbatas: merespon penuh terhadap nyeri verbal/taktil (4)", score: 4 },
    ],
  },
  {
    key: "moisture",
    label: "Kelembaban Kulit",
    options: [
      { label: "Basah terus-menerus (1)", score: 1 },
      { label: "Sangat lembab (2)", score: 2 },
      { label: "Lembab (3)", score: 3 },
      { label: "Jarang basah (4)", score: 4 },
    ],
  },
  {
    key: "activity",
    label: "Aktivitas",
    options: [
      { label: "Immobile (1)", score: 1 },
      { label: "Kursi roda (2)", score: 2 },
      { label: "Berjalan dengan bantuan (3)", score: 3 },
      { label: "Berjalan sendiri (4)", score: 4 },
    ],
  },
  {
    key: "mobility",
    label: "Mobilitas",
    options: [
      { label: "Tidak dapat bergerak sama sekali (1)", score: 1 },
      { label: "Sangat terbatas (2)", score: 2 },
      { label: "Terbatas (3)", score: 3 },
      { label: "Tidak terbatas (4)", score: 4 },
    ],
  },
  {
    key: "nutrition",
    label: "Nutrisi",
    options: [
      { label: "Sangat buruk (1)", score: 1 },
      { label: "Buruk (2)", score: 2 },
      { label: "Cukup (3)", score: 3 },
      { label: "Baik (4)", score: 4 },
    ],
  },
  {
    key: "friction",
    label: "Friksi & Geseran",
    options: [
      { label: "Masalah (1)", score: 1 },
      { label: "Potensi masalah (2)", score: 2 },
      { label: "Tidak ada masalah (3)", score: 3 },
      { label: "Mobilisasi aktif (4)", score: 4 },
    ],
  },
];

export function RisikoDecubitus() {
  const { ageMonths, weightGram, sex } = usePatient();
  const [patientName, setPatientName] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState(false);

  const totalScore = Object.values(scores).reduce((sum, v) => sum + v, 0);
  const allAnswered = bradenQItems.every((item) => scores[item.key] !== undefined);

  let riskLevel: { label: string; color: string; action: string };
  if (!allAnswered) {
    riskLevel = { label: "Belum Lengkap", color: "text-muted-foreground", action: "Isi semua item untuk penilaian" };
  } else if (totalScore <= 9) {
    riskLevel = { label: "Sangat Tinggi", color: "text-red-500", action: "Rotasi 1-2 jam, bantalan udara, ganti posisi aktif" };
  } else if (totalScore <= 12) {
    riskLevel = { label: "Tinggi", color: "text-orange-400", action: "Rotasi 2-3 jam, padding, monitor kulit" };
  } else if (totalScore <= 14) {
    riskLevel = { label: "Sedang", color: "text-yellow-400", action: "Rotasi 3-4 jam, edukasi perawatan kulit" };
  } else if (totalScore <= 18) {
    riskLevel = { label: "Rendah-Sedang", color: "text-yellow-300", action: "Rotasi 4 jam, inspeksi kulit rutin" };
  } else {
    riskLevel = { label: "Rendah", color: "text-green-400", action: "Pencegahan standar, mobilisasi aktif" };
  }

  const ageYr = Math.floor(ageMonths / 12);
  const ageMo = ageMonths % 12;
  const ageStr = ageYr > 0 ? `${ageYr} thn ${ageMo} bln` : `${ageMo} bln`;
  const weightKg = (weightGram / 1000).toFixed(1);

  const output = `EVALUASI RISIKO DECUBITUS (BRADEN Q)
======================================
Nama: ${patientName || "..."}
Usia: ${ageStr} | BB: ${weightKg} kg

PENILAIAN:
${bradenQItems.map((item, idx) => `${idx + 1}. ${item.label}: ${scores[item.key] !== undefined ? `${scores[item.key]} poin` : "Belum diisi"}`).join("\n")}

TOTAL SKOR: ${totalScore} / 24
RISIKO: ${riskLevel.label}
TINDAKAN: ${riskLevel.action}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Risiko Decubitus (Braden Q)" icon="🩹" color="orange">
      <div className="space-y-3">
        <CalcInput label="Nama Pasien" type="text" value={patientName} onChange={(v) => setPatientName(typeof v === "string" ? v : String(v))} />
        <InfoBox>Pasien: {ageStr} · BB {weightKg} kg</InfoBox>

        {bradenQItems.map((item, idx) => (
          <div key={item.key} className="rounded-lg border border-border p-2 space-y-1">
            <p className="text-[11px] font-medium text-foreground">{idx + 1}. {item.label}</p>
            {item.options.map((opt) => (
              <label key={opt.label} className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer">
                <input
                  type="radio"
                  name={item.key}
                  checked={scores[item.key] === opt.score}
                  onChange={() => setScores((prev) => ({ ...prev, [item.key]: opt.score }))}
                  className="accent-neon"
                />
                {opt.label}
              </label>
            ))}
          </div>
        ))}

        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Total Skor" value={allAnswered ? `${totalScore}/24` : `${totalScore}`} unit="poin" />
            <ResultItem label="Risiko" value={riskLevel.label} className={riskLevel.color} />
          </ResultGrid>
          <InfoBox>{riskLevel.action}</InfoBox>
        </CalcResult>

        <ResultAlert type="info">
          Braden Q: Skor rendah = risiko TINGGI. Skor range: 7 (terburik) - 23 (terbaik). Bayi &lt;1 tahun otomatis +1 poin sensori &amp; mobility.
        </ResultAlert>

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
