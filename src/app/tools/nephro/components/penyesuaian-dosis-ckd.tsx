"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const drugData: Record<string, { name: string; normal: string; g50: string; g30: string; g10: string; note?: string }> = {
  amoxicillin: { name: "Amoksisilin", normal: "25–50 mg/kg/hr q8h", g50: "Normal", g30: "q12h", g10: "q24h" },
  ampicillin: { name: "Ampisilin", normal: "50 mg/kg/hr q6h", g50: "Normal", g30: "q8-12h", g10: "q12-24h" },
  ceftriaxone: { name: "Seftriakson", normal: "50–100 mg/kg/hr q24h", g50: "Normal", g30: "Normal", g10: "Maks 2g/hr", note: "Umumnya aman, eliminasi dual (hepar+ginjal)." },
  cefazolin: { name: "Sefazolin", normal: "25–100 mg/kg/hr q8h", g50: "Normal", g30: "q12h", g10: "q24h" },
  gentamicin: { name: "Gentamisin", normal: "7.5 mg/kg/hr q24h", g50: "Monitor level", g30: "q36-48h", g10: "q48-72h + TDM", note: "⚠️ Monitor trough <1 mcg/mL. Nefrotoksik." },
  vancomycin: { name: "Vankomisin", normal: "60 mg/kg/hr q6h", g50: "q8-12h", g30: "q24-48h", g10: "q48-72h atau sesuai level", note: "⚠️ TDM wajib. Target AUC/MIC 400–600." },
  piperazine: { name: "Piperasilin-Tazobaktam", normal: "300 mg/kg/hr q6h", g50: "Normal", g30: "q8h", g10: "q12h" },
  meropenem: { name: "Meropenem", normal: "60–120 mg/kg/hr q8h", g50: "q12h", g30: "q24h", g10: "q24h (reduksi dosis)" },
  acyclovir: { name: "Asiklovir", normal: "250–500 mg/m² q8h", g50: "q12-24h", g30: "q24h", g10: "q24h dosis ½", note: "⚠️ Hidrasi adekuat. Kristal di tubulus pada hidrasi kurang." },
  trimethoprim: { name: "TMP-SMX", normal: "5 mg TMP/kg q12h", g50: "Normal", g30: "50% dosis", g10: "Hindari", note: "⚠️ Risiko hiperkalemia pada CKD. Meningkatkan Cr palsu." },
  metformin: { name: "Metformin", normal: "–", g50: "Hati-hati", g30: "Kontraindikasi", g10: "Kontraindikasi", note: "⛔ Risiko asidosis laktat bila GFR<30." },
  enalapril: { name: "Enalapril/ACEI", normal: "0.1 mg/kg/hr", g50: "Mulai dosis rendah", g30: "Monitor K+Cr ketat", g10: "Risiko tinggi; pertimbangkan amlodipine", note: "Monitor K dan Cr dalam 1–2 mgg awal." },
  spironolactone: { name: "Spironolakton", normal: "1–3.3 mg/kg/hr", g50: "Hati-hati", g30: "Hindari", g10: "Kontraindikasi", note: "⛔ Risiko hiperkalemia fatal pada GFR<30." },
};

export function PenyesuaianDosisCKDCalc() {
  const [gfr, setGfr] = useState(45);
  const [drug, setDrug] = useState("amoxicillin");

  const d = drugData[drug];
  let doseRec = "";
  let gfrGroup = "";
  if (gfr >= 50) { doseRec = d?.g50 || ""; gfrGroup = "GFR 50–89"; }
  else if (gfr >= 30) { doseRec = d?.g30 || ""; gfrGroup = "GFR 30–49"; }
  else { doseRec = d?.g10 || ""; gfrGroup = "GFR <30"; }

  return (
    <CalcCard title="Penyesuaian Dosis pada CKD" subtitle="Antibiotik & obat umum berdasarkan GFR" icon="⚙️" color="red">
      <div className="space-y-3">
        <InfoBox>Dosis perlu disesuaikan bila eGFR &lt;50 mL/mnt/1.73m². Patokan: Obat tereliminasi ginjal &gt;50% harus direduksi sesuai GFR.</InfoBox>
        <div className="grid grid-cols-2 gap-3">
          <CalcInput label="eGFR (mL/mnt/1.73m²)" value={gfr} onChange={(v) => setGfr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
          <CalcSelect label="Pilih Obat" value={drug} onChange={setDrug} options={Object.entries(drugData).map(([k, v]) => ({ value: k, label: v.name }))} />
        </div>
        {d && (
          <CalcResult color="red">
            <div className="space-y-2 text-xs leading-relaxed">
              <p className="font-semibold text-foreground">{d.name}</p>
              <ResultGrid cols={2}>
                <ResultItem label="Dosis Normal" value={d.normal} />
                <ResultItem label={`${gfrGroup} (eGFR ${gfr})`} value={doseRec} />
              </ResultGrid>
              {d.note && <InfoBox>{d.note}</InfoBox>}
            </div>
          </CalcResult>
        )}
      </div>
    </CalcCard>
  );
}
