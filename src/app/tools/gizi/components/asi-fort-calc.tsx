"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function ASIFortCalc() {
  const [weightG, setWeightG] = useState(1200);
  const [ga, setGa] = useState(30);
  const [volASI, setVolASI] = useState(80);
  const [volFormula, setVolFormula] = useState(0);

  const w = weightG / 1000;
  const kcalASI = Math.round(volASI * 0.67);
  const kcalFormula = Math.round(volFormula * 0.67);
  const totalKcal = kcalASI + kcalFormula;
  const perKg = Math.round((volASI + volFormula) / w * 10) / 10;
  const needHMF = weightG < 1500 && volASI > 100;
  const targetVol = Math.round(150 * w);
  const gap = Math.max(0, Math.round(targetVol - (volASI + volFormula)));

  return (
    <CalcCard title="ASI & Fortifikasi" subtitle="BBLR, prematur, kebutuhan energi ASI" icon="🤱" color="pink">
      <div className="space-y-3">
        <InfoBox>
          <strong>ASI:</strong> ~67 kkal/100 mL. <strong>HMF (Human Milk Fortifier):</strong> Tambahkan bila BB &lt;1500g atau &gt;100 mL/kg/hari EN. Target: 120-150 kkal/kgBB/hari.
        </InfoBox>
        <div className="grid grid-cols-2 gap-2">
          <CalcInput label="BB Bayi (gram)" unit="g" value={weightG} onChange={(v) => setWeightG(typeof v === "string" ? parseFloat(v) || 0 : v)} min={500} step={10} />
          <CalcInput label="GA saat Lahir (minggu)" unit="mgg" value={ga} onChange={(v) => setGa(typeof v === "string" ? parseFloat(v) || 0 : v)} min={24} max={42} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <CalcInput label="Volume ASI (mL/hari)" unit="mL" value={volASI} onChange={(v) => setVolASI(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} step={5} />
          <CalcInput label="Formula Tambahan (mL/hari)" unit="mL" value={volFormula} onChange={(v) => setVolFormula(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} step={5} />
        </div>
        <CalcResult color="pink">
          <ResultGrid cols={2}>
            <ResultItem label="Kalori ASI" value={`${totalKcal}`} unit="kkal" />
            <ResultItem label="mL/kgBB/hr" value={`${perKg}`} unit="mL" />
            <ResultItem label="Perlu HMF?" value={needHMF ? "YA — Tambah HMF" : "Belum diperlukan"} className={needHMF ? "text-green-400" : "text-muted-foreground"} />
            <ResultItem label="Tambahan EN" value={`${gap}`} unit="mL/hari" />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          BB: {weightG}g ({ga} minggu GA). ASI: {volASI} mL + Formula: {volFormula} mL = {volASI + volFormula} mL/hari.
          Total kalori: {totalKcal} kkal → {Math.round(totalKcal / w)} kkal/kgBB/hari.
          Target volume: {targetVol} mL/hari (150 mL/kgBB). Kekurangan: {gap} mL/hari.
          {needHMF ? " ⚠️ Tambahkan HMF untuk memenuhi protein, Ca, P, dan kalori prematur." : ""}
        </InfoBox>
      </div>
    </CalcCard>
  );
}
