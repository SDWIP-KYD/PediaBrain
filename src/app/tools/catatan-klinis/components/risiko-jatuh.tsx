"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultItem, ResultGrid, CalcButton, InfoBox, ResultAlert } from "../../components/calc-ui";

const morseItems = [
  { key: "riwayat", label: "Riwayat Jatuh (6 bulan terakhir)", scores: [0, 15, 25, 50] },
  { key: "dx", label: "Diagnosis Sekunder", scores: [0, 15] },
  { key: "gait", label: "Cara Berjalan", scores: [0, 10, 20] },
  { key: "iv", label: "Terapi IV / Saluran", scores: [0, 20] },
  { key: "mental", label: "Status Mental", scores: [0, 15] },
];

const riwayatOptions = [
  { label: "Tidak ada", score: 0 },
  { label: "Riwayat jatuh 1x", score: 15 },
  { label: "Riwayat jatuh 2-3x", score: 25 },
  { label: "Riwayat jatuh >3x", score: 50 },
];

const gaitOptions = [
  { label: "Normal / Bed rest / Immobile", score: 0 },
  { label: "Kebingungan / lemah", score: 10 },
  { label: "Gangguan keseimbangan / tumpuan", score: 20 },
];

export function RisikoJatuh() {
  const { ageMonths, weightGram, sex } = usePatient();
  const [patientName, setPatientName] = useState("");
  const [riwayat, setRiwayat] = useState(0);
  const [dx, setDx] = useState(0);
  const [gait, setGait] = useState(0);
  const [iv, setIv] = useState(0);
  const [mental, setMental] = useState(0);
  const [copied, setCopied] = useState(false);

  const totalScore = riwayat + dx + gait + iv + mental;

  let riskLevel: { label: string; color: string; action: string };
  if (totalScore < 25) {
    riskLevel = { label: "Rendah", color: "text-green-400", action: "Risiko standar, edukasi pasien" };
  } else if (totalScore < 51) {
    riskLevel = { label: "Sedang", color: "text-yellow-400", action: "Rencana pencegahan jatuh, pasang alarm" };
  } else {
    riskLevel = { label: "Tinggi", color: "text-red-400", action: "Intervensi aktif, 1:1 observation, pasang alarm jatuh" };
  }

  const ageYr = Math.floor(ageMonths / 12);
  const ageMo = ageMonths % 12;
  const ageStr = ageYr > 0 ? `${ageYr} thn ${ageMo} bln` : `${ageMo} bln`;
  const weightKg = (weightGram / 1000).toFixed(1);

  const output = `EVALUASI RISIKO JATUH (MORSE FALL SCALE - PEDIATRIK)
======================================================
Nama: ${patientName || "..."}
Usia: ${ageStr} | BB: ${weightKg} kg

PENILAIAN:
1. Riwayat Jatuh: ${riwayat} poin
2. Diagnosis Sekunder: ${dx} poin
3. Cara Berjalan: ${gait} poin
4. Terapi IV/Saluran: ${iv} poin
5. Status Mental: ${mental} poin

TOTAL SKOR: ${totalScore}
RISIKO: ${riskLevel.label}
TINDAKAN: ${riskLevel.action}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Risiko Jatuh (Morse Fall Scale)" icon="⚠️" color="yellow">
      <div className="space-y-3">
        <CalcInput label="Nama Pasien" type="text" value={patientName} onChange={(v) => setPatientName(typeof v === "string" ? v : String(v))} />
        <InfoBox>Pasien: {ageStr} · BB {weightKg} kg</InfoBox>

        <div className="space-y-2">
          {morseItems.map((item, idx) => {
            const options = idx === 0 ? riwayatOptions : idx === 2 ? gaitOptions : [{ label: "Tidak", score: 0 }, { label: "Ya", score: item.scores[1] }];
            const setters = [setRiwayat, setDx, setGait, setIv, setMental];
            const values = [riwayat, dx, gait, iv, mental];
            return (
              <div key={item.key} className="rounded-lg border border-border p-2 space-y-1">
                <p className="text-[11px] font-medium text-foreground">{idx + 1}. {item.label}</p>
                {options.map((opt) => (
                  <label key={opt.label} className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer">
                    <input
                      type="radio"
                      name={item.key}
                      checked={values[idx] === opt.score}
                      onChange={() => setters[idx](opt.score)}
                      className="accent-neon"
                    />
                    {opt.label} ({opt.score} poin)
                  </label>
                ))}
              </div>
            );
          })}
        </div>

        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Total Skor" value={totalScore} unit="poin" />
            <ResultItem label="Risiko" value={riskLevel.label} className={riskLevel.color} />
          </ResultGrid>
          <InfoBox>{riskLevel.action}</InfoBox>
        </CalcResult>

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
