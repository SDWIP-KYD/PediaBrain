"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

const conditions = [
  { value: "normal", label: "Normal", mult: 1, uo: "0.5-1", type: "NS 0.9% isotonic" },
  { value: "ards", label: "ARDS", mult: 0.67, uo: "0.5-1", type: "Restriktif" },
  { value: "icp", label: "Raised ICP", mult: 1, uo: "0.5-1", type: "NS 0.9% (HINDARI hipotonik!)" },
  { value: "sepsis-acute", label: "Sepsis Resuscitation", mult: 2, uo: "1-2", type: "NS/RL" },
  { value: "sepsis-post", label: "Post-Resusitasi Sepsis", mult: 0.67, uo: "0.5-1", type: "Restriktif" },
  { value: "burn", label: "Burn (Parkland)", mult: 0, uo: "0.5-1", type: "Ringer Lactat" },
];

export function CairanPICUCalc() {
  const { weightGram } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [cond, setCond] = useState("normal");
  const [tbsa, setTBSA] = useState(20);

  const c = conditions.find((c) => c.value === cond)!;

  let base = 0;
  if (w <= 10) base = w * 100;
  else if (w <= 20) base = 1000 + (w - 10) * 50;
  else base = 1500 + (w - 20) * 20;

  let total = 0;
  if (cond === "burn") {
    total = Math.round(3 * w * tbsa); // Parkland: 3 mL × kg × %TBSA
  } else {
    total = Math.round(base * c.mult);
  }

  const rate = +(total / 24).toFixed(1);

  return (
    <CalcCard title="Cairan PICU" subtitle="Holliday-Segar + critical illness" icon="💧" color="blue">
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcSelect label="Kondisi" value={cond} onChange={setCond} options={conditions.map((c) => ({ value: c.value, label: c.label }))} />
        {cond === "burn" && <CalcInput label="%TBSA" value={tbsa} onChange={(v) => setTBSA(v as number)} />}
      </div>
      <CalcResult color="blue">
        <ResultGrid cols={2}>
          <ResultItem label="Maintenance Dasar" value={`${Math.round(base)}`} unit="mL/hari" />
          <ResultItem label="Total Cairan" value={`${total}`} unit="mL/hari" />
          <ResultItem label="Rate" value={`${rate}`} unit="mL/jam" />
          <ResultItem label="Tipe" value={c.type} />
        </ResultGrid>
        <InfoBox>
          <strong>Target UO:</strong> {c.uo} mL/kg/hr
          {cond === "icp" && " — Na 140-150. HOB 30°."}
        </InfoBox>
      </CalcResult>
    </CalcCard>
  );
}
