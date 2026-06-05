"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

const dxSettings: Record<string, { mode: string; rr: string; pip: string; peep: string; fio2: string; ti: string; vt: string; map: string; note: string }> = {
  ards: { mode: "PRVC/A-C PC", rr: "30-40", pip: "≤28", peep: "8-12", fio2: "0.6-1.0", ti: "0.5-0.6s", vt: "4-6 mL/kg", map: "≥14", note: "Plateau ≤28. Permissive hypercapnia PaCO₂ 50-70. Prone jika OI>20. HFOV jika gagal." },
  asthma: { mode: "SIMV/A-C", rr: "10-16", pip: "25-35", peep: "0-5", fio2: "0.40-0.60", ti: "0.8-1.0s", vt: "6-8 mL/kg", map: "8-10", note: "I:E 1:3-1:4. Hindari air trapping. Heliox 70/30 bila refrakter. Ketamin." },
  pneumonia: { mode: "SIMV+PS", rr: "25-35", pip: "20-26", peep: "6-8", fio2: "0.40-0.80", ti: "0.5-0.7s", vt: "5-6 mL/kg", map: "10-12", note: "Abx spektrum luas. Pertimbangkan surfaktan. Drain efusi." },
  icp: { mode: "A-C/SIMV", rr: "25-35", pip: "18-22", peep: "5", fio2: "0.40", ti: "0.4-0.5s", vt: "6-8 mL/kg", map: "8-10", note: "PaCO₂ 35-40. Hiperventilasi sementara bila herniasi (PaCO₂ 30-35). HOB 30°." },
  neuro: { mode: "A-C/SIMV+PS", rr: "15-20", pip: "16-20", peep: "5", fio2: "0.25-0.35", ti: "0.8-1.0s", vt: "8-10 mL/kg", map: "8-9", note: "Weaning bertahap. SpO₂ 94-98%. Ekstubasi dini. Monitor NIF." },
  "post-op": { mode: "SIMV", rr: "20-30", pip: "18-22", peep: "5", fio2: "0.30-0.50", ti: "0.5s", vt: "6-7 mL/kg", map: "9-11", note: "Target ekstubasi dini. Normokapnia. Monitor EKG/arterial." },
  pphn: { mode: "A-C/HFOV", rr: "60-80", pip: "20-26", peep: "4-5", fio2: "0.80-1.0", ti: "0.3-0.4s", vt: "4-6 mL/kg", map: "≥14", note: "iNO 20ppm. PaO₂ >70 / SpO₂ >95%. Hindari asidosis, hipotermia, stimulasi." },
};

export function VentPICUCalc() {
  const { weightGram } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [dx, setDx] = useState("ards");

  const s = dxSettings[dx];
  const minTV = +(4 * w).toFixed(1);
  const maxTV = +(6 * w).toFixed(1);

  return (
    <CalcCard title="Setting Ventilator PICU" subtitle="Settings by diagnosis" icon="🫁" color="blue">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcSelect
          label="Diagnosis"
          value={dx}
          onChange={setDx}
          options={Object.keys(dxSettings).map((k) => ({
            value: k,
            label: k === "ards" ? "ARDS / ALI" : k === "asthma" ? "Status Asmatikus" : k === "icp" ? "Raised ICP" : k === "neuro" ? "Penyakit Neuromuskular" : k === "post-op" ? "Post-Op Cardiac" : k === "pphn" ? "PPHN" : k.charAt(0).toUpperCase() + k.slice(1),
          }))}
        />
      </div>
      <CalcResult color="blue">
        <ResultGrid cols={2}>
          <ResultItem label="Mode" value={s.mode} />
          <ResultItem label="Rate" value={s.rr} unit="x/mnt" />
          <ResultItem label="PIP" value={s.pip} unit="cmH₂O" />
          <ResultItem label="PEEP" value={s.peep} unit="cmH₂O" />
          <ResultItem label="FiO₂" value={s.fio2} />
          <ResultItem label="Ti" value={s.ti} />
          <ResultItem label="VT target" value={s.vt} note={`${minTV}-${maxTV} mL`} />
          <ResultItem label="MAP target" value={s.map} />
        </ResultGrid>
        <div className="mt-2 rounded-lg bg-muted/50 border border-border px-3 py-2 text-[11px] text-muted-foreground">
          📝 <strong>Catatan:</strong> {s.note}
        </div>
      </CalcResult>
    </CalcCard>
  );
}
