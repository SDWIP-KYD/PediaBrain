"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

const nmbs = [
  { value: "succinylcholine", label: "Sukinilkolin", dose: 1.5, conc: 20, duration: "5-10 mnt", note: "KONTRAINDIKASI: hiperkalemia, denervasi, miopati, luka bakar >24jam, cedera mata terbuka, riwayat malignant hyperthermia" },
  { value: "rocuronium", label: "Rokuronium", dose: 1.2, conc: 10, duration: "30-60 mnt", note: "First choice RSI. Reversibel Sugammadex 16 mg/kg." },
  { value: "vecuronium", label: "Vekuronium", dose: 0.1, conc: 1, duration: "25-40 mnt", note: "Maintenance RSI atau intermediate blockade." },
  { value: "cisatracurium", label: "Sisatrasuriem", dose: 0.15, conc: 2, duration: "Infus 1-3 mcg/kg/min", note: "Pilihan ARDS. Independen dari hati/ginjal. Monitor TOF." },
  { value: "atracurium", label: "Atrasuriem", dose: 0.5, conc: 10, duration: "Infus 5-10 mcg/kg/min", note: "Metabolit laudanosin → kejang pada dosis tinggi." },
];

export function NMBCalc() {
  const { weightGram } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [drug, setDrug] = useState("rocuronium");

  const nmb = nmbs.find((n) => n.value === drug)!;
  const doseMg = +(nmb.dose * w).toFixed(2);
  const volMl = +(doseMg / nmb.conc).toFixed(2);

  return (
    <CalcCard title="Neuromuscular Blockade" subtitle="Paralytic agents dosing" icon="💉" color="slate">
      <InfoBox>
        NMBA hanya diberikan bila <strong>sedasi adekuat DULU</strong> (RASS -2 atau lebih dalam). Monitor TOF (Train-of-Four) untuk titrasi.
      </InfoBox>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcSelect label="Obat" value={drug} onChange={setDrug} options={nmbs.map((n) => ({ value: n.value, label: n.label }))} />
      </div>
      <CalcResult color="slate">
        <ResultGrid cols={2}>
          <ResultItem label="Dosis" value={`${doseMg}`} unit="mg" />
          <ResultItem label="Volume" value={`${volMl}`} unit="mL" note={`${nmb.conc}mg/mL`} />
        </ResultGrid>
        <ResultGrid cols={1}>
          <ResultItem label="Durasi" value={nmb.duration} />
        </ResultGrid>
        <ResultAlert type="warning">{nmb.note}</ResultAlert>
      </CalcResult>
    </CalcCard>
  );
}
