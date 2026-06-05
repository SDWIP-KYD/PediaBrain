"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const gluOptions = [
  { value: "10", label: "D10%" },
  { value: "12.5", label: "D12.5%" },
  { value: "15", label: "D15%" },
  { value: "20", label: "D20%" },
];

export function TPNGiziCalc() {
  const { weightGram, heightCm, ageMonths } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [height, setHeight] = useState(heightCm);
  const [age, setAge] = useState(ageMonths);
  const [tfi, setTfi] = useState(100);
  const [enteralKcal, setEnteralKcal] = useState(0);
  const [girTarget, setGirTarget] = useState(6);
  const [proteinRate, setProteinRate] = useState(2);
  const [lipidRate, setLipidRate] = useState(2);
  const [gluPct, setGluPct] = useState("10");

  const glu = parseFloat(gluPct) || 10;
  const totalVol = Math.round(tfi * weight);
  const ivVol = Math.max(0, Math.round(totalVol - enteralKcal));
  const ivRate = Math.round(ivVol / 24 * 10) / 10;
  const girActual = Math.round(glu * ivRate / (weight * 6) * 100) / 100;
  const proG = Math.round(proteinRate * weight * 10) / 10;
  const lipML = Math.round(lipidRate * weight / 0.2 * 10) / 10;
  const proKcal = Math.round(proG * 4);
  const lipKcal = Math.round(lipidRate * weight * 10);
  const gluKcal = Math.round(girActual * weight * 1440 * 0.0057);
  const totalKcal = Math.round((proKcal + lipKcal + gluKcal) / weight);
  const npc = proG > 0 ? Math.round((lipKcal + gluKcal) / (proG / 6.25)) : 0;

  return (
    <CalcCard title="TPN — Total Parenteral Nutrition" subtitle="Kalkulasi lengkap komponen PN pediatrik" icon="💉">
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <CalcInput label="BB (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.1} />
          <CalcInput label="TB (cm)" unit="cm" value={height} onChange={(v) => setHeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={30} />
          <CalcInput label="Usia (bulan)" unit="bln" value={age} onChange={(v) => setAge(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={228} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <CalcInput label="TFI target (mL/kg/hr)" unit="mL/kg/hr" value={tfi} onChange={(v) => setTfi(typeof v === "string" ? parseFloat(v) || 0 : v)} min={60} max={200} />
          <CalcInput label="Kalori enteral (kcal/hr)" unit="kcal/hr" value={enteralKcal} onChange={(v) => setEnteralKcal(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
          <CalcInput label="GIR target (mg/kg/mnt)" unit="mg/kg/mnt" value={girTarget} onChange={(v) => setGirTarget(typeof v === "string" ? parseFloat(v) || 0 : v)} min={2} max={12} step={0.5} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <CalcInput label="Protein (g/kg/hr)" unit="g/kg/hr" value={proteinRate} onChange={(v) => setProteinRate(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} max={3} step={0.5} />
          <CalcInput label="Lipid (g/kg/hr)" unit="g/kg/hr" value={lipidRate} onChange={(v) => setLipidRate(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={3} step={0.5} />
          <CalcSelect label="Glukosa (%)" value={gluPct} onChange={setGluPct} options={gluOptions} />
        </div>
        <CalcResult>
          <ResultGrid cols={3}>
            <ResultItem label="IV cairan (mL/jam)" value={ivRate} unit="mL/jam" className="text-blue-500" />
            <ResultItem label="GIR aktual" value={girActual} unit="mg/kg/mnt" className={girActual > 10 || girActual < 4 ? "text-red-500" : "text-emerald-500"} />
            <ResultItem label="Kalori total" value={totalKcal} unit="kcal/kg" className="text-emerald-500" />
          </ResultGrid>
          <ResultGrid cols={3}>
            <ResultItem label="NPC:N ratio" value={`${npc}:1`} />
            <ResultItem label="Protein (g/hr)" value={proG} />
            <ResultItem label="Lipid 20% (mL/jam)" value={`${lipML} mL/jam`} />
          </ResultGrid>
          <ResultGrid cols={3}>
            <ResultItem label="Cal. protein (kcal)" value={proKcal} />
            <ResultItem label="Cal. lipid (kcal)" value={lipKcal} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          Total cairan: {totalVol} mL/hari ({tfi} mL/kgBB). IV: {ivVol} mL/hari ({ivRate} mL/jam).
          GIR: {girActual} mg/kg/mnt {girActual > 10 ? "Terlalu tinggi" : girActual < 4 ? "Terlalu rendah" : "OK"}.
          NPC:N {npc}:1 (target 100-200:1 anak sehat; 80-120:1 katabolik).
        </InfoBox>
      </div>
    </CalcCard>
  );
}
