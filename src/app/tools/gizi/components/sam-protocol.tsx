"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, InfoBox, ResultAlert } from "../../components/calc-ui";

const phaseOptions = [
  { value: "stabilize", label: "Stabilisasi — F-75 (hari 1-7)" },
  { value: "transition", label: "Transisi — F-100 (hari 8-14)" },
  { value: "rehab", label: "Rehabilitasi — RUTF / F-100" },
];

const compOptions = [
  { value: "none", label: "Tidak ada komplikasi" },
  { value: "edema", label: "Edema (Kwashiorkor)" },
  { value: "infection", label: "Infeksi berat / sepsis" },
  { value: "hypoglycemia", label: "Hipoglikemia (GDS <54 mg/dL)" },
];

export function SAMProtocol() {
  const [weight, setWeight] = useState(7);
  const [phase, setPhase] = useState("stabilize");
  const [comp, setComp] = useState("none");

  let output = "";

  if (phase === "stabilize") {
    const f75Vol = Math.round(130 * weight);
    const f75Feed = Math.round(f75Vol / 8);
    const f75Kcal = Math.round(75 * weight * 130 / 1000);
    output = `FASE STABILISASI — F-75 (Hari 1-7)\n\nF-75: Volume ${f75Vol} mL/hari → ${f75Feed} mL per kali (q3h = 8×/hari)\nKalori: ${f75Kcal} kkal/hari (~75 kkal/100mL × ${f75Vol}mL)\n\n${comp === "hypoglycemia" ? "⛔ HIPOGLIKEMIA: Beri 50 mL D10% oral/NGT SEGERA → lanjut F-75 q30mnt x2 jam\n" : ""}${comp === "edema" ? "⚠️ Edema: Pembatasan Na! Pantau TT, diuresis, penurunan edema\n" : ""}TIDAK diberikan Fe pada fase ini. Berikan: Vit A + Folat + Multivitamin + Zn\nMonitor: Glukosa tiap 4 jam (malam), suhu, HR, respirasi`;
  } else if (phase === "transition") {
    const f100Vol = Math.round(150 * weight);
    const f100PerFeed = Math.round(f100Vol / 8);
    const f100Kcal = Math.round(100 * weight * 150 / 1000);
    output = `FASE TRANSISI — F-100 (Hari 8-14)\n\nF-100: Volume ${f100Vol} mL/hari → ${f100PerFeed} mL per kali (q3h)\nKalori: ${f100Kcal} kkal/hari (~100 kkal/100mL)\n\nNaik bertahap: 10 mL/kali tiap 12 jam bila toleran\nMulai Fe pada fase ini (kalau sudah tidak infeksi aktif)\nTarget: BB naik ≥5 g/kgBB/hari`;
  } else {
    const rutfKcal = Math.round(150 * weight);
    const rutfPro = Math.round(5.5 * weight * 10) / 10;
    output = `FASE REHABILITASI — RUTF / F-100 Modifikasi\n\nRUTF (Ready-to-Use Therapeutic Food): sachet 92g (500 kkal/100g)\nTarget kalori: ${rutfKcal} kkal/hari (150 kkal/kgBB/hari)\nProtein: ${rutfPro} g/hari (~5.5 g/100 kkal RUTF)\n\nRUTF diberikan outpatient (IMAM program) bila tidak ada komplikasi\nMonitor: BB tiap minggu, target naik 10-15 g/kgBB/hari`;
  }

  return (
    <CalcCard title="SAM Protocol" subtitle="Protokol WHO F-75, F-100, RUTF" icon="🏥" color="red">
      <div className="space-y-3">
        <InfoBox>
          <strong>WHO SAM Management:</strong> Fase stabilisasi (F-75) → Fase transisi (F-100) → Fase rehabilitasi (RUTF/F-100). Hindari overfeeding pada fase awal!
        </InfoBox>
        <div className="grid grid-cols-2 gap-2">
          <CalcInput label="BB Aktual (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} step={0.1} />
          <CalcSelect label="Fase Terapi" value={phase} onChange={setPhase} options={phaseOptions} />
        </div>
        <CalcSelect label="Kondisi Komplikasi" value={comp} onChange={setComp} options={compOptions} />
        <CalcResult color="red">
          <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed">{output}</pre>
        </CalcResult>
      </div>
    </CalcCard>
  );
}
