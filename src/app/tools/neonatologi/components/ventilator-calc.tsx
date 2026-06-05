"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

interface VentSettings {
  mode: string;
  rr: string;
  pip: string;
  peep: string;
  fio2: string;
  ti: string;
  map: string;
  vt: string;
  note: string;
}

const ventPresets: Record<string, VentSettings> = {
  hmd: { mode: "SIMV+PS", rr: "40-60", pip: "18-24", peep: "5-6", fio2: "0.40-0.80", ti: "0.30-0.35", map: "8-12", vt: "4-5", note: "Surfaktan segera bila RDS terkonfirmasi. Turunkan PIP segera setelah compliance membaik pasca surfaktan. Target PaCO₂ 45-55 mmHg." },
  apnea: { mode: "NCPAP/SIMV", rr: "20-30", pip: "14-18", peep: "4-5", fio2: "0.21-0.30", ti: "0.30-0.35", map: "6-8", vt: "4-5", note: "Kafein sitrat loading 20 mg/kg. Backup rate rendah. Mode non-invasif lebih dipilih. Target PaCO₂ 45-55 mmHg." },
  mec: { mode: "SIMV/A-C", rr: "40-60", pip: "20-26", peep: "4-5", fio2: "0.50-1.0", ti: "0.30-0.40", map: "10-14", vt: "5-6", note: "HATI-HATI air trapping (PEEP rendah). Pertimbangkan iNO bila PPHN. Suction ETT hati-hati." },
  pphn: { mode: "A-C PC/HFOV", rr: "50-70", pip: "20-24", peep: "4-5", fio2: "0.80-1.0", ti: "0.30-0.40", map: "10-14", vt: "4-6", note: "Hiperventilasi relatif (PaCO₂ 35-45). Hindari hipoksemia. iNO 20 ppm bila tersedia. ECMO bila refrakter." },
  pneumonia: { mode: "SIMV/A-C", rr: "40-60", pip: "18-24", peep: "5-6", fio2: "0.40-0.80", ti: "0.30-0.40", map: "9-12", vt: "4-6", note: "Antibiotik empiris segera. Setting mirip HMD. Waspada PPHN sekunder." },
  "post-op": { mode: "SIMV", rr: "30-40", pip: "16-20", peep: "4-5", fio2: "0.30-0.50", ti: "0.30-0.35", map: "7-9", vt: "4-5", note: "Sedasi adekuat. Weaning bertahap. Target ekstubasi setelah fungsi neurologi stabil." },
};

export function VentilatorCalc() {
  const { weightGram, gestationalAge } = usePatient();
  const [wt, setWt] = useState(weightGram);
  const [ga, setGa] = useState(gestationalAge);
  const [dx, setDx] = useState("hmd");

  useEffect(() => { setWt(weightGram); setGa(gestationalAge); }, [weightGram, gestationalAge]);

  const wtKg = wt / 1000;
  const s = ventPresets[dx] || ventPresets.hmd;
  const minTV = +(4 * wtKg).toFixed(1);
  const maxTV = +(6 * wtKg).toFixed(1);

  const params = [
    { l: "Mode", v: s.mode },
    { l: "Rate (x/mnt)", v: s.rr },
    { l: "PIP (cmH₂O)", v: s.pip },
    { l: "PEEP (cmH₂O)", v: s.peep },
    { l: "FiO₂", v: s.fio2 },
    { l: "Ti (detik)", v: s.ti },
    { l: "MAP target", v: s.map },
    { l: `VT target`, v: `${s.vt} mL/kg → ${minTV}-${maxTV} mL` },
  ];

  return (
    <CalcCard title="Setting Ventilator" subtitle="Parameter awal ventilator neonatus" icon="🫁" color="blue">
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(v as number)} unit="g" />
        <CalcInput label="GA (minggu)" value={ga} onChange={(v) => setGa(v as number)} unit="mgg" />
        <CalcSelect
          label="Diagnosis"
          value={dx}
          onChange={setDx}
          options={[
            { value: "hmd", label: "HMD / RDS" },
            { value: "apnea", label: "Apnea Prematur" },
            { value: "mec", label: "MEconium Aspiration" },
            { value: "pphn", label: "PPHN" },
            { value: "pneumonia", label: "Pneumonia" },
            { value: "post-op", label: "Post-Operatif" },
          ]}
        />
      </div>
      <CalcResult color="blue">
        <ResultGrid cols={2}>
          {params.map((p) => (
            <ResultItem key={p.l} label={p.l} value={p.v} />
          ))}
        </ResultGrid>
        <div className="mt-2 rounded-lg bg-muted/50 border border-border px-3 py-2 text-[11px] text-muted-foreground">
          📝 <strong>Catatan:</strong> {s.note}
        </div>
      </CalcResult>
    </CalcCard>
  );
}
