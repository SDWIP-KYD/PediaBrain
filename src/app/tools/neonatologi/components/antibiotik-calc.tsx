"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, CalcButton, InfoBox, ResultAlert } from "../../components/calc-ui";

interface AbxDose {
  dosePerKg: number;
  maxDose: number;
  freq: string;
  freqNeonate: string;
  route: string;
  concentration: string;
  note: string;
}

const abxDb: Record<string, Record<string, AbxDose>> = {
  ampicillin: {
    sepsis: { dosePerKg: 50, maxDose: 2000, freq: "q6h", freqNeonate: "q12h (≤7 hari)\nq8h (>7 hari)", route: "IV", concentration: "100 mg/mL", note: "Tinggi untuk meningitis" },
    meningitis: { dosePerKg: 100, maxDose: 3000, freq: "q6h", freqNeonate: "q8-12h", route: "IV", concentration: "100 mg/mL", note: "" },
    uti: { dosePerKg: 50, maxDose: 2000, freq: "q6h", freqNeonate: "q12h", route: "IV", concentration: "100 mg/mL", note: "" },
    pneumonia: { dosePerKg: 50, maxDose: 2000, freq: "q6h", freqNeonate: "q8h", route: "IV", concentration: "100 mg/mL", note: "" },
  },
  gentamicin: {
    sepsis: { dosePerKg: 5, maxDose: 80, freq: "q24h", freqNeonate: "q24h (GA≥32, ≤7 hari)\nq36h (GA<32 atau >7 hari)", route: "IV/IM", concentration: "10 mg/mL", note: "TDM wajib. Target trough <1 mcg/mL" },
    meningitis: { dosePerKg: 5, maxDose: 80, freq: "q24h", freqNeonate: "q24h", route: "IV", concentration: "10 mg/mL", note: "Kombinasi dengan Ampisilin" },
    uti: { dosePerKg: 5, maxDose: 80, freq: "q24h", freqNeonate: "q24h", route: "IV/IM", concentration: "10 mg/mL", note: "" },
    pneumonia: { dosePerKg: 5, maxDose: 80, freq: "q24h", freqNeonate: "q24h", route: "IV/IM", concentration: "10 mg/mL", note: "" },
  },
  cefotaxime: {
    sepsis: { dosePerKg: 50, maxDose: 2000, freq: "q8h", freqNeonate: "q12h (≤7 hari)\nq8h (>7 hari)", route: "IV", concentration: "100 mg/mL", note: "" },
    meningitis: { dosePerKg: 50, maxDose: 2000, freq: "q6h", freqNeonate: "q8-12h", route: "IV", concentration: "100 mg/mL", note: "" },
    uti: { dosePerKg: 50, maxDose: 2000, freq: "q8h", freqNeonate: "q12h", route: "IV", concentration: "100 mg/mL", note: "" },
    pneumonia: { dosePerKg: 50, maxDose: 2000, freq: "q8h", freqNeonate: "q12h", route: "IV", concentration: "100 mg/mL", note: "" },
  },
  "penicillin-g": {
    sepsis: { dosePerKg: 50000, maxDose: 5000000, freq: "q6h", freqNeonate: "q12h", route: "IV", concentration: "50000 U/mL", note: "Sifilis kongenital" },
    meningitis: { dosePerKg: 50000, maxDose: 5000000, freq: "q4-6h", freqNeonate: "q8-12h", route: "IV", concentration: "50000 U/mL", note: "" },
    uti: { dosePerKg: 25000, maxDose: 2500000, freq: "q6h", freqNeonate: "q12h", route: "IV", concentration: "50000 U/mL", note: "" },
    pneumonia: { dosePerKg: 50000, maxDose: 5000000, freq: "q6h", freqNeonate: "q12h", route: "IV", concentration: "50000 U/mL", note: "" },
  },
  vancomycin: {
    sepsis: { dosePerKg: 15, maxDose: 1000, freq: "q6h", freqNeonate: "q8-12h", route: "IV", concentration: "10 mg/mL", note: "Infus >1 jam. TDM target AUC/MIC 400-600" },
    meningitis: { dosePerKg: 20, maxDose: 1500, freq: "q6h", freqNeonate: "q8-12h", route: "IV", concentration: "10 mg/mL", note: "" },
    uti: { dosePerKg: 15, maxDose: 1000, freq: "q8h", freqNeonate: "q12h", route: "IV", concentration: "10 mg/mL", note: "" },
    pneumonia: { dosePerKg: 15, maxDose: 1000, freq: "q6h", freqNeonate: "q8-12h", route: "IV", concentration: "10 mg/mL", note: "" },
  },
  metronidazole: {
    sepsis: { dosePerKg: 15, maxDose: 500, freq: "q8h", freqNeonate: "q12h (≤7 hari)\nq8h (>7 hari)", route: "IV", concentration: "5 mg/mL", note: "NEC" },
    meningitis: { dosePerKg: 15, maxDose: 500, freq: "q8h", freqNeonate: "q12h", route: "IV", concentration: "5 mg/mL", note: "" },
    uti: { dosePerKg: 15, maxDose: 500, freq: "q8h", freqNeonate: "q12h", route: "IV", concentration: "5 mg/mL", note: "" },
    pneumonia: { dosePerKg: 15, maxDose: 500, freq: "q8h", freqNeonate: "q12h", route: "IV", concentration: "5 mg/mL", note: "" },
  },
  acyclovir: {
    sepsis: { dosePerKg: 20, maxDose: 750, freq: "q8h", freqNeonate: "q12h", route: "IV", concentration: "25 mg/mL", note: "HSV. Infus >1 jam. Cairkan sebelum pakai" },
    meningitis: { dosePerKg: 20, maxDose: 750, freq: "q8h", freqNeonate: "q12h", route: "IV", concentration: "25 mg/mL", note: "" },
    uti: { dosePerKg: 20, maxDose: 750, freq: "q8h", freqNeonate: "q12h", route: "IV", concentration: "25 mg/mL", note: "" },
    pneumonia: { dosePerKg: 20, maxDose: 750, freq: "q8h", freqNeonate: "q12h", route: "IV", concentration: "25 mg/mL", note: "" },
  },
  fluconazole: {
    sepsis: { dosePerKg: 6, maxDose: 400, freq: "q48h (≤7 hari)\nq24h (>7 hari)", freqNeonate: "q48h (≤7 hari)\nq24h (>7 hari)", route: "IV/PO", concentration: "2 mg/mL", note: "Profilaksis/kandidiasis invasif" },
    meningitis: { dosePerKg: 12, maxDose: 800, freq: "q24h", freqNeonate: "q24-48h", route: "IV", concentration: "2 mg/mL", note: "" },
    uti: { dosePerKg: 6, maxDose: 400, freq: "q24h", freqNeonate: "q48h", route: "IV/PO", concentration: "2 mg/mL", note: "" },
    pneumonia: { dosePerKg: 6, maxDose: 400, freq: "q24h", freqNeonate: "q48h", route: "IV/PO", concentration: "2 mg/mL", note: "" },
  },
};

export function AntibiotikCalc() {
  const { weightGram, gestationalAge, ageDays } = usePatient();
  const [wt, setWt] = useState(weightGram);
  const [ga, setGa] = useState(gestationalAge);
  const [age, setAge] = useState(ageDays);
  const [drug, setDrug] = useState("ampicillin");
  const [indication, setIndication] = useState("sepsis");

  useEffect(() => { setWt(weightGram); setGa(gestationalAge); setAge(ageDays); }, [weightGram, gestationalAge, ageDays]);

  const wtKg = wt / 1000;
  const abx = abxDb[drug]?.[indication];
  const doseMg = abx ? Math.min(abx.dosePerKg * wtKg, abx.maxDose) : 0;
  const vol = abx && parseFloat(abx.concentration) > 0 ? +(doseMg / parseFloat(abx.concentration)).toFixed(2) : 0;
  const isEarly = age <= 7;

  return (
    <CalcCard title="Antibiotik Neonatus" subtitle="Disesuaikan GA + usia postnatal" icon="💉" color="green">
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(v as number)} unit="g" />
        <CalcInput label="GA (minggu)" value={ga} onChange={(v) => setGa(v as number)} unit="mgg" />
        <CalcInput label="Usia (hari)" value={age} onChange={(v) => setAge(v as number)} unit="hari" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CalcSelect
          label="Antibiotik"
          value={drug}
          onChange={setDrug}
          options={[
            { value: "ampicillin", label: "Ampisilin (IV)" },
            { value: "gentamicin", label: "Gentamisin (IV/IM)" },
            { value: "cefotaxime", label: "Sefotaksim (IV)" },
            { value: "penicillin-g", label: "Penisilin G (IV)" },
            { value: "vancomycin", label: "Vankomisin (IV)" },
            { value: "metronidazole", label: "Metronidazol (IV)" },
            { value: "acyclovir", label: "Asiklovir (IV)" },
            { value: "fluconazole", label: "Flukonazol (IV/PO)" },
          ]}
        />
        <CalcSelect
          label="Indikasi"
          value={indication}
          onChange={setIndication}
          options={[
            { value: "sepsis", label: "Sepsis / Empiris" },
            { value: "meningitis", label: "Meningitis" },
            { value: "uti", label: "ISK" },
            { value: "pneumonia", label: "Pneumonia" },
          ]}
        />
      </div>
      {abx && (
        <CalcResult color="green">
          <ResultGrid cols={2}>
            <ResultItem label="Dosis/kali" value={`${Math.round(doseMg)}`} unit="mg" />
            <ResultItem label="Volume" value={`${vol}`} unit="mL" note={abx.concentration} />
          </ResultGrid>
          <ResultAlert type="info">
            <strong>Frekuensi:</strong> {isEarly ? abx.freqNeonate : abx.freq}
            <br />
            <strong>Rute:</strong> {abx.route}
            {abx.note && (
              <>
                <br />
                <strong>Catatan:</strong> {abx.note}
              </>
            )}
          </ResultAlert>
        </CalcResult>
      )}
    </CalcCard>
  );
}
