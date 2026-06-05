"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const sexOptions = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
];

const meanWeightMale = [3.3,4.5,5.6,6.4,7.0,7.5,7.9,8.3,8.6,8.9,9.2,9.4,9.6,9.9,10.1,10.3,10.5,10.7,10.9,11.1,11.3,11.5,11.7,11.9,12.1,12.3,12.5,12.7,12.9,13.1,13.3,13.5,13.7,13.9,14.1,14.3,14.5,14.7,14.9,15.1,15.3,15.5,15.7,15.9,16.1,16.3,16.5,16.7,16.9,17.1,17.3,17.5,17.7,17.9,18.1,18.3,18.5,18.7,18.9,19.1,19.3];
const meanWeightFemale = [3.2,4.2,5.1,5.8,6.4,6.9,7.3,7.6,7.9,8.2,8.5,8.7,9.0,9.2,9.4,9.6,9.8,10.0,10.2,10.4,10.6,10.8,11.0,11.2,11.4,11.6,11.8,12.0,12.2,12.4,12.6,12.8,13.0,13.2,13.4,13.6,13.8,14.0,14.2,14.4,14.6,14.8,15.0,15.2,15.4,15.6,15.8,16.0,16.2,16.4,16.6,16.8,17.0,17.2,17.4,17.6,17.8,18.0,18.2,18.4,18.6];
const meanHeightMale = [49.9,53.7,57.1,60.0,62.5,64.7,66.7,68.5,70.2,71.8,73.3,74.7,76.1,77.4,78.6,79.8,81.0,82.1,83.2,84.2,85.2,86.2,87.1,88.0,89.1,90.1,91.1,92.0,92.9,93.8,94.7,95.6,96.4,97.3,98.1,98.9,99.7,100.4,101.2,101.9,102.7,103.4,104.1,104.8,105.5,106.2,106.9,107.6,108.2,108.9,109.5,110.2,110.8,111.4,112.0,112.6,113.2,113.7,114.3,114.9,115.4];
const meanHeightFemale = [49.1,52.8,56.1,58.9,61.4,63.5,65.4,67.2,68.8,70.4,71.9,73.3,74.7,76.0,77.2,78.4,79.5,80.7,81.7,82.7,83.7,84.6,85.5,86.4,87.4,88.3,89.2,90.1,90.9,91.8,92.6,93.4,94.2,95.0,95.7,96.5,97.2,97.9,98.6,99.3,100.0,100.6,101.3,101.9,102.6,103.2,103.8,104.4,105.0,105.6,106.2,106.8,107.3,107.9,108.4,109.0,109.5,110.0,110.6,111.1,111.6];

function lookup(table: number[], ageMonth: number): number {
  const idx = Math.min(Math.max(0, Math.round(ageMonth)), table.length - 1);
  return table[idx] ?? 0;
}

function classifyZ(z: number): string {
  if (z < -3) return "Gizi Buruk";
  if (z < -2) return "Gizi Kurang";
  if (z < 2) return "Gizi Baik";
  return "Gizi Lebih";
}

export function BMICalc() {
  const { weightGram, heightCm, ageMonths, sex: patientSex } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [height, setHeight] = useState(heightCm);
  const [ageMonths2, setAgeMonths2] = useState(ageMonths || 36);
  const [sex, setSex] = useState<"L" | "P">(patientSex);

  const sexKey = sex === "L" ? "m" : "f";
  const ageMo = Math.min(Math.round(ageMonths2), 60);
  const mW = lookup(sexKey === "m" ? meanWeightMale : meanWeightFemale, ageMo);
  const mH = lookup(sexKey === "m" ? meanHeightMale : meanHeightFemale, ageMo);
  const sdW = sexKey === "m" ? 1.2 : 1.1;
  const sdH = sexKey === "m" ? 3.5 : 3.4;

  const bmi = height > 0 ? weight / ((height / 100) ** 2) : 0;
  const waz = sdW > 0 ? (weight - mW) / sdW : 0;
  const haz = sdH > 0 ? (height - mH) / sdH : 0;
  const expectedWfH = mH > 0 ? mW * (height / mH) : 0;
  const whz = sdW > 0 ? (weight - expectedWfH) / sdW : 0;
  const baz = (bmi - 15.5) / 2.0;

  const wazStatus = classifyZ(waz);
  const hazStatus = classifyZ(haz);
  const whzStatus = whz < -3 ? "Sangat Kurus" : whz < -2 ? "Kurus (Wasting)" : whz > 2 ? "Obesitas" : whz > 1 ? "Berisiko" : "Normal";
  const overallStatus = whz < -2 ? "GIZI KURANG" : whz > 2 ? "GEMUK/OBESITAS" : "GIZI BAIK";

  function zColor(z: number): string {
    if (z < -2) return "text-red-500";
    if (z < -1) return "text-amber-500";
    if (z > 2) return "text-orange-400";
    return "text-emerald-500";
  }

  return (
    <CalcCard title="Antropometri Lengkap" subtitle="WHO Z-score: WAZ, HAZ, WHZ, BAZ" icon="📏">
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <CalcInput label="BB (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.1} />
          <CalcInput label="TB (cm)" unit="cm" value={height} onChange={(v) => setHeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={30} />
          <CalcInput label="Usia (bulan)" unit="bln" value={ageMonths2} onChange={(v) => setAgeMonths2(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={228} />
        </div>
        <CalcSelect label="Jenis Kelamin" value={sex} onChange={(v) => setSex(v as "L" | "P")} options={sexOptions} />
        <CalcResult>
          <ResultGrid cols={3}>
            <ResultItem label="WAZ (BB/U)" value={waz.toFixed(2)} className={zColor(waz)} note={wazStatus} />
            <ResultItem label="HAZ (TB/U)" value={haz.toFixed(2)} className={zColor(haz)} note={hazStatus} />
            <ResultItem label="WHZ (BB/TB)" value={whz.toFixed(2)} className={zColor(whz)} note={whzStatus} />
          </ResultGrid>
          <ResultGrid cols={3}>
            <ResultItem label="BAZ (IMT/U)" value={baz.toFixed(2)} className={zColor(baz)} note={classifyZ(baz)} />
            <ResultItem label="IMT" value={bmi.toFixed(1)} unit="kg/m²" />
            <ResultItem label="Status Gizi" value={overallStatus} className={whz < -2 ? "text-red-500" : whz > 2 ? "text-orange-400" : "text-emerald-500"} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          <strong>WAZ:</strong> {waz.toFixed(2)} → {wazStatus}. <strong>HAZ:</strong> {haz.toFixed(2)} → {hazStatus}. <strong>WHZ:</strong> {whz.toFixed(2)} → {whzStatus}.
          {haz < -2 && whz >= -2 ? " Stunting tanpa wasting — malnutrisi kronik." : ""}
          {whz < -2 && haz >= -2 ? " Wasting tanpa stunting — malnutrisi akut." : ""}
          {whz < -2 && haz < -2 ? " Stunting + Wasting — malnutrisi kronik eksaserbasi akut!" : ""}
        </InfoBox>
      </div>
    </CalcCard>
  );
}
