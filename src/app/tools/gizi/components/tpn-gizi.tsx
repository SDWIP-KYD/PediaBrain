"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function TPNGiziCalc() {
  const { weightGram } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [dextrose, setDextrose] = useState(10);
  const [aaRate, setAaRate] = useState(1.5);
  const [lipidRate, setLipidRate] = useState(1);

  const dextroseKcal = weight * dextrose * 3.4 / 100 * 24;
  const aaKcal = weight * aaRate * 4;
  const lipidKcal = lipidRate * 10 * 10;

  const totalKcal = dextroseKcal + aaKcal + lipidKcal;
  const totalVolume = weight * 150;
  const dextroseRate = (dextrose * totalVolume / 100 / 24).toFixed(1);
  const aaVolume = weight * aaRate * 24;
  const lipidVolume = lipidRate * 100;

  return (
    <CalcCard title="TPN Calculator" icon="💉">
      <div className="space-y-3">
        <CalcInput label="Berat Badan (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.1} />
        <CalcInput label="Dextrose (%)" unit="%" value={dextrose} onChange={(v) => setDextrose(typeof v === "string" ? parseFloat(v) || 0 : v)} min={2.5} max={25} step={2.5} />
        <CalcInput label="Amino Acid (g/kg/hari)" unit="g/kg/hari" value={aaRate} onChange={(v) => setAaRate(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} max={3} step={0.1} />
        <CalcInput label="Lipid (g/kg/hari)" unit="g/kg/hari" value={lipidRate} onChange={(v) => setLipidRate(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={3} step={0.1} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Total Kalori" value={`${Math.round(totalKcal)} kkal/hari`} />
            <ResultItem label="Volume Total" value={`${totalVolume.toFixed(0)} mL/hari`} />
            <ResultItem label="Dextrose Rate" value={`${dextroseRate} mL/jam`} />
            <ResultItem label="Lipid Volume" value={`${lipidVolume} mL/hari`} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          Target: 150 mL/kg/hari. Dextrose 10% = 0.4 kkal/mL. AA: 1.5-2.5 g/kg/hari. Lipid: 1-2 g/kg/hari (maks 3g).
        </InfoBox>
      </div>
    </CalcCard>
  );
}
