"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const activityOptions = [
  { value: "1.0", label: "Bed rest (1.0)" },
  { value: "1.1", label: "Light activity (1.1)" },
  { value: "1.2", label: "Moderate activity (1.2)" },
  { value: "1.3", label: "High activity (1.3)" },
];

const stressOptions = [
  { value: "1.0", label: "No stress (1.0)" },
  { value: "1.1", label: "Minor surgery (1.1)" },
  { value: "1.2", label: "Surgery/fracture (1.2)" },
  { value: "1.3", label: "Sepsis (1.3)" },
  { value: "1.5", label: "Major burn (1.5)" },
  { value: "1.4", label: "Severe trauma (1.4)" },
];

export function StressFactorCalc() {
  const { weightGram } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [ree, setRee] = useState(800);
  const [activity, setActivity] = useState("1.0");
  const [stress, setStress] = useState("1.0");
  const [fever, setFever] = useState(0);

  const activityFactor = parseFloat(activity);
  const stressFactor = parseFloat(stress);
  const feverFactor = 1 + (fever * 0.1);

  const totalTEE = ree * activityFactor * stressFactor * feverFactor;
  const perKg = weight > 0 ? totalTEE / weight : 0;

  return (
    <CalcCard title="Stress Factor Calculator" icon="🌡️">
      <div className="space-y-3">
        <CalcInput label="REE (kkal/hari)" unit="kkal/hari" value={ree} onChange={(v) => setRee(typeof v === "string" ? parseFloat(v) || 0 : v)} min={100} />
        <CalcInput label="Berat Badan (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.1} />
        <CalcSelect label="Faktor Aktivitas" value={activity} onChange={setActivity} options={activityOptions} />
        <CalcSelect label="Faktor Stres" value={stress} onChange={setStress} options={stressOptions} />
        <CalcInput label="Demam (°C di atas 37)" unit="°C" value={fever} onChange={(v) => setFever(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={5} step={0.5} />
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Total Energy" value={`${Math.round(totalTEE)} kkal/hari`} />
            <ResultItem label="Per kg BB" value={`${perKg.toFixed(1)} kkal/kg/hari`} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          TEE = REE × Activity × Stress × Fever. Setiap 1°C demam menambah 10% kebutuhan energi.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
