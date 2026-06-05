"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const condOptions = [
  { value: "healthy", label: "Anak sehat (0.85-1.1 g/kg)" },
  { value: "preterm", label: "Prematur (3.5-4.5 g/kg)" },
  { value: "infant", label: "Bayi 0-6 bulan (1.52 g/kg)" },
  { value: "infant2", label: "Bayi 6-12 bulan (1.2 g/kg)" },
  { value: "catchup", label: "Catch-up / malnutrisi (2-3 g/kg)" },
  { value: "sepsis", label: "Sepsis / katabolik (2-3 g/kg)" },
  { value: "burn", label: "Luka bakar (3-4 g/kg)" },
  { value: "ckd", label: "CKD (0.6-0.8 g/kg)" },
  { value: "dialysis", label: "Dialisis (1.2-2 g/kg)" },
  { value: "liver", label: "Penyakit hati berat (1.2 g/kg)" },
];

const ranges: Record<string, [number, number]> = {
  healthy: [0.85, 1.1], preterm: [3.5, 4.5], infant: [1.52, 1.52],
  infant2: [1.2, 1.2], catchup: [2, 3], sepsis: [2, 3],
  burn: [3, 4], ckd: [0.6, 0.8], dialysis: [1.2, 2], liver: [1.2, 1.5],
};

const recMap: Record<string, string> = {
  preterm: "AA prematur IV (TrophAmine/Primene)", catchup: "Protein tinggi untuk catch-up. Monitor BUN.",
  sepsis: "Target protein 2-3 g/kg. Bolehkan >3 bila dialisis.", burn: "Curreri formula + nitrogen balance monitoring",
  ckd: "Batasi protein. Tingkatkan kalori non-protein.", dialysis: "Protein tinggi (kerugian dialisis)",
  liver: "Protein moderate, hindari protein hewani berlebih",
};

export function ProteinReqCalc() {
  const { weightGram, ageMonths } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [cond, setCond] = useState("healthy");
  const [kcal, setKcal] = useState(1200);

  const [mn, mx] = ranges[cond] || [1, 2];
  const pMin = Math.round(mn * weight * 10) / 10;
  const pMax = Math.round(mx * weight * 10) / 10;
  const pctMin = kcal > 0 ? Math.round(pMin * 4 / kcal * 1000) / 10 : 0;
  const pctMax = kcal > 0 ? Math.round(pMax * 4 / kcal * 1000) / 10 : 0;
  const npcKcal = Math.round(kcal - pMax * 4);
  const npcN = npcKcal > 0 && pMax > 0 ? Math.round(npcKcal / (pMax / 6.25)) : 0;

  return (
    <CalcCard title="Kebutuhan Protein" subtitle="Per kondisi klinis & usia" icon="🥩">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <CalcInput label="BB (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.1} />
          <CalcInput label="Total energi target (kcal)" unit="kcal" value={kcal} onChange={(v) => setKcal(typeof v === "string" ? parseFloat(v) || 0 : v)} min={100} />
        </div>
        <CalcSelect label="Kondisi / Indikasi" value={cond} onChange={setCond} options={condOptions} />
        <CalcResult>
          <ResultGrid cols={3}>
            <ResultItem label="Min (g/hari)" value={pMin} unit="g/hari" className="text-purple-500" />
            <ResultItem label="Maks (g/hari)" value={pMax} unit="g/hari" className="text-purple-500" />
            <ResultItem label="% dari Energi" value={`${pctMin}-${pctMax}%`} />
          </ResultGrid>
          <ResultGrid cols={3}>
            <ResultItem label="NPC:N Ratio" value={`${npcN}:1`} note="N = protein/6.25" />
            <ResultItem label="Non-protein kcal" value={npcKcal} unit="kcal/hari" />
            <ResultItem label="Rekomendasi" value={recMap[cond] || "Sumber protein berkualitas tinggi (PDCAAS tinggi)"} className="text-[11px] leading-snug" />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          Prematur: 3-4 g/kg/hari. Bayi: 2-3 g/kg/hari. Anak: 1-1.5 g/kg/hari. Remaja: 0.8-1 g/kg/hari. NPC:N target: 80-120:1 (katabolik), 100-200:1 (anak sehat).
        </InfoBox>
      </div>
    </CalcCard>
  );
}
