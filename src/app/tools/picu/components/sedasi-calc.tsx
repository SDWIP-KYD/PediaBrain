"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

const regimens = [
  { value: "standard", label: "Standard (Midaz+Fentanyl)" },
  { value: "dex", label: "Dexmedetomidine" },
  { value: "propofol", label: "Propofol (≥3yr, <48hr)" },
  { value: "ketamine", label: "Ketamine" },
  { value: "analgesia", label: "Analgesia-First" },
  { value: "delirium", label: "Delirium Management" },
];

const r2 = (n: number) => Math.round(n * 100) / 100;

export function SedasiCalc() {
  const { weightGram } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [reg, setReg] = useState("standard");

  const atropine = Math.max(0.1, +(0.02 * w).toFixed(2));

  const regimenData: Record<string, { drugs: string[]; notes: string }> = {
    standard: {
      drugs: [
        `Midazolam: Bolus ${r2(0.1 * w)} mg IV → Infus ${r2(0.05 * w * 60)} mg/hr (0.05-0.2 mg/kg/hr)`,
        `Fentanil: Bolus ${r2(1 * w)} mcg IV → Infus ${r2(1 * w * 60)} mcg/hr (1-5 mcg/kg/hr)`,
      ],
      notes: "Target RASS -1 to -2",
    },
    dex: {
      drugs: [
        `Loading: ${r2(1 * w)} mcg (1 mcg/kg) dalam 10 menit (opsional)`,
        `Infus: ${r2(0.2 * w * 60)} mcg/hr (0.2-1 mcg/kg/hr)`,
      ],
      notes: "Tidak depresi respirasi. Waspada bradikardia.",
    },
    propofol: {
      drugs: [
        `Infus: ${r2(1 * w * 60)} mg/hr (1-4 mg/kg/hr, maks 4)`,
      ],
      notes: "HANYA ≥3 tahun. Durasi <48 jam. Cek trigliserida q24jam. Risiko PRIS.",
    },
    ketamine: {
      drugs: [
        `Bolus: ${r2(2 * w)} mg IV (1-2 mg/kg)`,
        `Infus: ${r2(1 * w * 60)} mg/hr (1-2 mg/kg/hr)`,
        `Atropin premid: ${atropine} mg (hipersalivasi)`,
      ],
      notes: "Mempertahankan BP dan refleks jalan napas. Bronkodilasi.",
    },
    analgesia: {
      drugs: [
        `Fentanil: ${r2(1 * w)} mcg IV q1-2h PRN atau infus ${r2(0.5 * w * 60)} mcg/hr`,
        `Morfren: ${r2(0.1 * w)} mg IV q2-4h atau infus ${r2(0.01 * w * 60)} mg/hr`,
        `Parasetamol IV: ${r2(15 * w)} mg (maks 1g) q6h`,
        `Ibuprofen: ${r2(10 * w)} mg (maks 400mg) q6-8h PO`,
      ],
      notes: "Multimodal approach.",
    },
    delirium: {
      drugs: [
        `Haloperidol: ${r2(0.05 * w)} mg IV (0.05-0.15 mg/kg) q6h`,
        `Melatonin: 0.5-2 mg PO nightly`,
      ],
      notes: "Non-farm: mobilisasi, orientasi, paparan cahaya, minimalkan restraints.",
    },
  };

  const r = regimenData[reg];

  return (
    <CalcCard title="Obat Sedasi & Analgesia" subtitle="PICU sedation/analgesia regimens" icon="💊" color="purple">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcSelect label="Regimen" value={reg} onChange={setReg} options={regimens} />
      </div>
      <CalcResult color="purple">
        <div className="space-y-2">
          {r.drugs.map((d, i) => (
            <div key={i} className="text-xs font-mono bg-muted/50 rounded-lg px-3 py-2">{d}</div>
          ))}
        </div>
        <InfoBox>{r.notes}</InfoBox>
      </CalcResult>
    </CalcCard>
  );
}
