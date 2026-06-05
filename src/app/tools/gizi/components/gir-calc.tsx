"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const concOptions = [
  { value: "5", label: "D5%" },
  { value: "7.5", label: "D7.5%" },
  { value: "10", label: "D10%" },
  { value: "12.5", label: "D12.5%" },
  { value: "15", label: "D15%" },
  { value: "20", label: "D20%" },
  { value: "25", label: "D25%" },
  { value: "50", label: "D50%" },
];

export function GIRCalc() {
  const { weightGram } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [conc, setConc] = useState("10");
  const [rate, setRate] = useState(40);
  const [target, setTarget] = useState(5);

  const concNum = parseFloat(conc);
  const girActual = (concNum * rate) / (weight * 6);
  const rateForTarget = (target * weight * 6) / concNum;

  let status: string;
  let statusColor: string;
  if (girActual < 4) {
    status = "Tidak adekuat";
    statusColor = "text-amber-400";
  } else if (girActual <= 12) {
    status = "Normal";
    statusColor = "text-emerald-400";
  } else {
    status = "Hiperglikemia";
    statusColor = "text-red-500";
  }

  return (
    <CalcCard title="Glucose Infusion Rate (GIR)" subtitle="Target GIR & konversi konsentrasi" icon="🍬" color="blue">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <CalcInput label="BB (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.1} />
          <CalcSelect label="Konsentrasi Glukosa (%)" value={conc} onChange={setConc} options={concOptions} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <CalcInput label="Rate Infus (mL/jam)" unit="mL/jam" value={rate} onChange={(v) => setRate(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} step={0.5} />
          <CalcInput label="Target GIR (mg/kg/mnt)" unit="mg/kg/mnt" value={target} onChange={(v) => setTarget(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} max={20} step={0.5} />
        </div>

        <CalcResult color="blue">
          <ResultGrid cols={3}>
            <ResultItem label="GIR Aktual" value={girActual.toFixed(1)} unit="mg/kg/mnt" />
            <ResultItem label="Rate untuk Target" value={rateForTarget.toFixed(1)} unit="mL/jam" />
            <ResultItem label="Status" value={status} className={statusColor} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          GIR = (Konsentrasi% × Rate mL/jam) ÷ (BB kg × 6). Target neonatus: 4–8 mg/kg/mnt. Anak: 2–5 mg/kg/mnt.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
