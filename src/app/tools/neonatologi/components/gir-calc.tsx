"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { useCalculatorLink } from "../../calculator-link-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, CalcButton, InfoBox, ResultAlert } from "../../components/calc-ui";

export function GIRCalc() {
  const { weightGram } = usePatient();
  const { getOutput } = useCalculatorLink();
  const [wt, setWt] = useState(weightGram);
  const [conc, setConc] = useState(10);
  const [rate, setRate] = useState(6);
  const [target, setTarget] = useState(6);

  useEffect(() => setWt(weightGram), [weightGram]);

  const wtKg = wt / 1000;
  const gir = +((conc * rate) / (wtKg * 6)).toFixed(2);
  const neededRate = +((target * wtKg * 6) / conc).toFixed(2);

  let status = "";
  let statusType: "success" | "warning" | "danger" = "success";
  if (gir < 4) { status = "🔴 Terlalu rendah"; statusType = "danger"; }
  else if (gir > 12) { status = "🔴 Terlalu tinggi"; statusType = "danger"; }
  else if (gir > 8) { status = "🟡 Batas atas"; statusType = "warning"; }
  else { status = "🟢 Normal"; statusType = "success"; }

  // Check if linked from other calculators
  const linkedFluid = getOutput("cairanharian");
  const linkedTPN = getOutput("tpn");

  return (
    <CalcCard title="GIR" subtitle="Glucose Infusion Rate" icon="🍬" color="orange">
      <InfoBox>
        GIR = [Konsentrasi (%) × Rate (mL/jam)] / [BB (kg) × 6] mg/kg/mnt. Target neonatus: 4–8 mg/kg/mnt. Maks 12 mg/kg/mnt.
      </InfoBox>
      {(linkedFluid || linkedTPN) && (
        <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-3 py-2 text-[10px] text-orange-300">
          🔗 Data terhubung: {linkedFluid && `Cairan (${linkedFluid.value} ${linkedFluid.unit})`}{linkedFluid && linkedTPN && " + "}{linkedTPN && `TPN (GIR ${linkedTPN.value} ${linkedTPN.unit})`}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(v as number)} unit="g" />
        <CalcSelect
          label="Konsentrasi Glukosa (%)"
          value={conc.toString()}
          onChange={(v) => setConc(parseFloat(v))}
          options={[
            { value: "5", label: "D5%" },
            { value: "7.5", label: "D7.5%" },
            { value: "10", label: "D10%" },
            { value: "12.5", label: "D12.5%" },
            { value: "15", label: "D15%" },
            { value: "20", label: "D20%" },
            { value: "25", label: "D25%" },
          ]}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Rate Infus (mL/jam)" value={rate} onChange={(v) => setRate(v as number)} step={0.1} />
        <CalcInput label="Target GIR (mg/kg/mnt)" value={target} onChange={(v) => setTarget(v as number)} step={0.5} />
      </div>
      <CalcResult color="orange">
        <ResultGrid cols={2}>
          <ResultItem label="GIR Aktual" value={`${gir}`} unit="mg/kg/mnt" note={status} />
          <ResultItem label="Rate untuk Target" value={`${neededRate}`} unit="mL/jam" />
        </ResultGrid>
        {gir > 12 && <ResultAlert type="danger">⚠️ GIR {">"}12 mg/kg/mnt → risiko hiperglikemia dan lipogenesis. Kurangi konsentrasi atau rate.</ResultAlert>}
        {gir < 4 && <ResultAlert type="danger">⚠️ GIR {"<"}4 mg/kg/mnt → risiko hipoglikemia. Naikkan konsentrasi atau rate.</ResultAlert>}
      </CalcResult>
    </CalcCard>
  );
}
