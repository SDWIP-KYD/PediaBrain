"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import {
  CalcCard,
  CalcInput,
  CalcSelect,
  CalcResult,
  ResultGrid,
  ResultItem,
  InfoBox,
  CalcButton,
  ResultAlert,
} from "../../components/calc-ui";

interface DrugDef {
  value: string;
  label: string;
  range: string;
  unit: string;
  notes?: string;
  mixing?: string;
}

const drugs: DrugDef[] = [
  {
    value: "dopamine",
    label: "Dopamin",
    range: "1–10 mcg/kg/min",
    unit: "mcg/kg/min",
    mixing: "Rule of 6 → mg dalam 50 mL",
    notes: "Low: 1–5 (renal), Mid: 5–10 (inotrop), High: >10 (vasokonstr)",
  },
  {
    value: "dobutamine",
    label: "Dobutamin",
    range: "2.5–20 mcg/kg/min",
    unit: "mcg/kg/min",
    mixing: "Rule of 6 → mg dalam 50 mL",
    notes: "Inotrop: 2.5–20 mcg/kg/min",
  },
  {
    value: "epinephrine",
    label: "Epinefrin",
    range: "0.01–0.3 mcg/kg/min",
    unit: "mcg/kg/min",
    mixing: "Rule of 6 → mg dalam 50 mL",
    notes: "Low: 0.01–0.1 (β>α), High: >0.3 (α+β)",
  },
  {
    value: "norepinephrine",
    label: "Norepinefrin",
    range: "0.05–2 mcg/kg/min",
    unit: "mcg/kg/min",
    mixing: "Rule of 6 → mg dalam 50 mL",
    notes: "Vasopresor: 0.05–2 mcg/kg/min",
  },
  {
    value: "vasopressin",
    label: "Vasopresin",
    range: "0.0003–0.002 unit/kg/min",
    unit: "unit/kg/min",
    mixing: "Rule of 6 → unit dalam 50 mL",
    notes: "⚠ Dosis dalam unit/kg/min, BUKAN mcg. Sediaan 20 unit/mL.",
  },
  {
    value: "milrinone",
    label: "Milrinon",
    range: "0.25–0.75 mcg/kg/min",
    unit: "mcg/kg/min",
    mixing: "Rule of 6 → mg dalam 50 mL",
    notes: "⚠ Berikan loading dose 50 mcg/kg sebelum infus. Monitor hipotensi.",
  },
  {
    value: "salbutamol",
    label: "Salbutamol (bronko)",
    range: "0.1–1 mcg/kg/min",
    unit: "mcg/kg/min",
    mixing: "Rule of 6 → mg dalam 50 mL",
    notes: "Bronkospasme: 0.1–1 mcg/kg/min",
  },
  {
    value: "lidocaine",
    label: "Lidokain (anti-aritmia)",
    range: "20–50 mcg/kg/min",
    unit: "mcg/kg/min",
    mixing: "Rule of 6 → mg dalam 50 mL",
    notes: "Anti-aritmia: 20–50 mcg/kg/min",
  },
  {
    value: "amiodarone",
    label: "Amiodaron",
    range: "5–15 mcg/kg/min",
    unit: "mcg/kg/min",
    mixing: "Rule of 6 → mg dalam 50 mL",
    notes: "⚠ Loading 5 mg/kg dalam 20 menit → infus 5–15 mcg/kg/min. Dalam 50 mL D5%.",
  },
  {
    value: "nicardipine",
    label: "Nikardipin",
    range: "0.5–4 mcg/kg/min",
    unit: "mcg/kg/min",
    mixing: "10 mL Nikardipin + 40 mL NaCl 0.9%",
    notes: "Rumus khusus: dose × BB × 50 × 60 ÷ 10.000 = mL/hr",
  },
];

export function SyringePICUCalc() {
  const { weightGram } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [drug, setDrug] = useState("dopamine");
  const [dose, setDose] = useState(5);
  const [vol, setVol] = useState(50);
  const [diluent, setDiluent] = useState("D5W");

  const info = drugs.find((d) => d.value === drug);

  let drugAmount = 0;
  let rate = 0;
  let conc = 0;

  if (drug === "nicardipine") {
    drugAmount = +(dose * w * 50 * 60 / 10000).toFixed(2);
    rate = drugAmount;
    conc = vol > 0 ? +(drugAmount / vol).toFixed(3) : 0;
  } else {
    drugAmount = +(dose * w * 6).toFixed(2);
    rate = dose;
    conc = vol > 0 ? +(drugAmount / vol).toFixed(3) : 0;
  }

  const formulaText = drug === "nicardipine"
    ? `Dosis × BB × 50 × 60 ÷ 10.000 = ${dose} × ${w} × 50 × 60 ÷ 10.000 = ${drugAmount} mL/hr`
    : `Dosis × BB × 6 = ${dose} × ${w} × 6 = ${drugAmount} mg dalam ${vol} mL`;

  return (
    <CalcCard title="Syringe Pump (Rule of 6)" subtitle="Inotropik, vasopresor, bronkodilator" icon="💉" color="purple">
      <InfoBox>
        <strong>Rule of 6:</strong> [Dosis × BB × 6] mg dalam syringe → 1 mL/hr = 1 mcg/kg/min.
        Nikardipin menggunakan rumus khusus.
      </InfoBox>

      <div className="grid grid-cols-2 gap-3">
        <CalcInput
          label="BB (kg)"
          value={w}
          onChange={(v) => setW(typeof v === "string" ? parseFloat(v) || 0 : v)}
          step={0.5}
        />
        <CalcSelect
          label="Obat"
          value={drug}
          onChange={setDrug}
          options={drugs.map((d) => ({ value: d.value, label: d.label }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <CalcInput
          label={`Target (${info?.unit || "mcg/kg/min"})`}
          value={dose}
          onChange={(v) => setDose(typeof v === "string" ? parseFloat(v) || 0 : v)}
          step={0.01}
        />
        <CalcSelect
          label="Volume Syringe"
          value={vol.toString()}
          onChange={(v) => setVol(parseInt(v))}
          options={[
            { value: "50", label: "50 mL" },
            { value: "20", label: "20 mL" },
            { value: "10", label: "10 mL" },
          ]}
        />
      </div>

      <CalcSelect
        label="Diluent"
        value={diluent}
        onChange={setDiluent}
        options={[
          { value: "D5W", label: "D5%" },
          { value: "NS", label: "NS 0.9%" },
          { value: "D10W", label: "D10%" },
        ]}
      />

      <CalcButton onClick={() => {}} color="purple">
        Hitung Syringe Pump
      </CalcButton>

      <CalcResult color="purple">
        <ResultGrid cols={2}>
          <ResultItem label="Obat dalam syringe" value={drugAmount} unit="mg" />
          <ResultItem label="Rate" value={rate} unit="mL/jam" />
          <ResultItem label="Konsentrasi" value={conc} unit="mg/mL" />
          <ResultItem label="Range dosis" value={info?.range || ""} />
        </ResultGrid>
        <p className="text-[10px] text-muted-foreground mt-1">{formulaText}</p>
        {info?.mixing && (
          <p className="text-[10px] text-muted-foreground">Pengenceran: {info.mixing}</p>
        )}
        {info?.notes && (
          <ResultAlert type="warning" className="mt-2">
            {info.notes}
          </ResultAlert>
        )}
      </CalcResult>
    </CalcCard>
  );
}
