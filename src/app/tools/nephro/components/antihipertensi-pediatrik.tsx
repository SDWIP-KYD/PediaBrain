"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, InfoBox } from "../../components/calc-ui";

export function AntihipertensiPediatrikCalc() {
  const [w, setW] = useState(20);
  const [cond, setCond] = useState("crisis");

  const r2 = (n: number) => Math.round(n * 100) / 100;
  const r1 = (n: number) => Math.round(n * 10) / 10;

  const recs: Record<string, string> = {
    crisis: `Krisis Hipertensi — IV:\n1. Labetalol ${r2(0.25 * w)} mg IV bolus (0.25 mg/kg), ulangi q10-15 mnt → infus 0.25–3 mg/kg/jam\n2. Hidralazin ${r2(0.1 * w)} mg IV (0.1–0.6 mg/kg) q4-6h\n3. Nicardipine infus 1–3 mcg/kg/mnt IV (pilihan NICU)\n4. Sodium Nitroprusside 0.5–8 mcg/kg/mnt IV (krisis berat, dengan monitor invasif)\n⚠️ Turunkan MAP maks 25% dalam 8 jam pertama`,
    stage2: `HTN Stage 2 — Oral:\n1. Amlodipin ${r2(0.1 * w)} mg/hari (0.1 mg/kg, maks 10 mg) — CCB\n2. Enalapril ${r2(0.08 * w)} mg/hari (0.08 mg/kg, maks 40 mg) — ACEI\n3. Metoprolol ${r2(0.5 * w)} mg/hari (0.5–2 mg/kg, maks 200 mg) — Beta blocker`,
    stage1: `HTN Stage 1 — Lifestyle + Obat:\nDiet rendah Na, olahraga aerobik 30–60 mnt 5×/mgg\nBila tidak respons 6 bulan → Amlodipin ${r2(0.05 * w)} mg/hari (0.05–0.3 mg/kg)`,
    ckd: `HTN + CKD — ACEI/ARB Pilihan:\nEnalapril ${r2(0.08 * w)} mg/hari dibagi q12h (renoprotektif, antiproteinurik)\nLosartan ${r2(w < 50 ? 0.7 * w : 25)} mg/hari (0.7–1.4 mg/kg, maks 100 mg) — ARB\n⚠️ Monitor K dan Cr 1–2 mgg setelah mulai. Kontraindikasi bilateral RAS`,
    nephrotic: `HTN + Sindrom Nefrotik:\nAmlodipin ${r2(0.1 * w)} mg/hari — pilihan utama (retensi Na)\nHindari ACEI/ARB saat hipoalbuminemia berat (risiko AKI)\nFurosemid untuk edema: ${r2(w <= 10 ? 1 * w : r1(w))} mg/dosis (1–2 mg/kg)`,
  };

  return (
    <CalcCard title="Antihipertensi Pediatrik" subtitle="Dosis berdasarkan BB & indikasi" icon="💊" color="purple">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <CalcInput label="BB (kg)" unit="kg" value={w} onChange={(v) => setW(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} />
          <CalcSelect label="Kondisi" value={cond} onChange={setCond} options={[
            { value: "crisis", label: "Krisis Hipertensi (IV)" },
            { value: "stage2", label: "HTN Stage 2 (oral)" },
            { value: "stage1", label: "HTN Stage 1 (oral)" },
            { value: "ckd", label: "HTN + CKD" },
            { value: "nephrotic", label: "HTN + Sindrom Nefrotik" },
          ]} />
        </div>
        <CalcResult color="purple">
          <div className="whitespace-pre-line text-xs leading-relaxed text-foreground">
            {recs[cond] || ""}
          </div>
        </CalcResult>
      </div>
    </CalcCard>
  );
}
