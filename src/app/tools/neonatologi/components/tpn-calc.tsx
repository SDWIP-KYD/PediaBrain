"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { useCalculatorLink } from "../../calculator-link-context";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

export function TPNCalc() {
  const { weightGram, ageDays } = usePatient();
  const { getOutput, setOutput } = useCalculatorLink();
  const [wt, setWt] = useState(weightGram);
  const [age, setAge] = useState(ageDays);
  const [tfi, setTfi] = useState(80);
  const [ent, setEnt] = useState(0);
  const [girT, setGirT] = useState(6);
  const [pro, setPro] = useState(2);
  const [lip, setLip] = useState(1);
  const [glu, setGlu] = useState(10);

  useEffect(() => { setWt(weightGram); setAge(ageDays); }, [weightGram, ageDays]);

  const wtKg = wt / 1000;
  const totalHr = (tfi * wtKg) / 24;
  const entHr = (ent * wtKg) / 24;
  const ivRate = Math.max(0, totalHr - entHr);
  const girAct = +((glu * ivRate) / (wtKg * 6)).toFixed(2);
  const proG = +(pro * wtKg).toFixed(2);
  const lipMl = +((lip * wtKg) / 0.2).toFixed(2);
  const calGlu = +(girAct * 0.0057 * wtKg * 1440).toFixed(1);
  const calPro = +(pro * 4).toFixed(1);
  const calLip = +(lip * 10).toFixed(1);
  const calTotal = +(calGlu + calPro + calLip).toFixed(1);
  const npc = +(calGlu + calLip).toFixed(1);

  // Publish GIR output for linking
  useEffect(() => {
    if (girAct > 0) {
      setOutput("tpn", "GIR dari TPN", `${girAct}`, "mg/kg/mnt");
    }
  }, [girAct, setOutput]);

  // Check link from fluid calculator
  const linkedFluid = getOutput("cairanharian");

  return (
    <CalcCard title="TPN Neonatus" subtitle="Total Parenteral Nutrition" icon="🧪" color="teal">
      {linkedFluid && (
        <div className="rounded-lg bg-teal-500/10 border border-teal-500/20 px-3 py-2 text-[10px] text-teal-300">
          🔗 IV rate dari Kebutuhan Cairan: {linkedFluid.value} {linkedFluid.unit}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(v as number)} unit="g" />
        <CalcInput label="Usia (hari)" value={age} onChange={(v) => setAge(v as number)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="TFI (mL/kg/hr)" value={tfi} onChange={(v) => setTfi(v as number)} />
        <CalcInput label="Enteral (mL/kg/hr)" value={ent} onChange={(v) => setEnt(v as number)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="Protein (g/kg/hr)" value={pro} onChange={(v) => setPro(v as number)} step={0.1} />
        <CalcInput label="Lipid (g/kg/hr)" value={lip} onChange={(v) => setLip(v as number)} step={0.1} />
        <CalcInput label="Glukosa (%)" value={glu} onChange={(v) => setGlu(v as number)} />
      </div>
      <CalcResult color="teal">
        <ResultGrid cols={3}>
          <ResultItem label="IV Rate" value={`${+ivRate.toFixed(2)}`} unit="mL/jam" />
          <ResultItem label="GIR Aktual" value={`${girAct}`} unit="mg/kg/mnt" />
          <ResultItem label="Total Kalori" value={`${calTotal}`} unit="kkal/kg/hr" />
        </ResultGrid>
        <ResultGrid cols={3}>
          <ResultItem label="Protein" value={`${proG}`} unit="g/jam" />
          <ResultItem label="Lipid" value={`${+lipMl.toFixed(2)}`} unit="mL/jam" />
          <ResultItem label="NPC:N" value={`${npc}`} unit="kkal" note={`${calGlu} glukosa + ${calLip} lipid`} />
        </ResultGrid>
      </CalcResult>
    </CalcCard>
  );
}
