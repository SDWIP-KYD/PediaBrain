"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

const indications = [
  { value: "dvt-treatment", label: "DVT/PE Treatment (UFH)" },
  { value: "dvt-proph", label: "DVT Prophylaxis (UFH)" },
  { value: "crrt", label: "CRRT" },
  { value: "ecmo", label: "ECMO" },
  { value: "enox-treatment", label: "Enoxaparin Treatment" },
  { value: "enox-proph", label: "Enoxaparin Prophylaxis" },
];

export function AntikoagulanCalc() {
  const { weightGram } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [ind, setInd] = useState("dvt-treatment");
  const [aptt, setAptt] = useState(60);

  let loading = 0;
  let infusion = 0;
  let target = "";
  let note = "";
  let enox = 0;

  if (ind === "dvt-treatment") {
    loading = +(75 * w).toFixed(0);
    infusion = +(20 * w).toFixed(0);
    target = "aPTT 60-85 detik (anti-Xa 0.3-0.7)";
  } else if (ind === "dvt-proph") {
    infusion = +(10 * w).toFixed(0);
    target = "Prophylaxis";
  } else if (ind === "crrt") {
    loading = +(30 * w).toFixed(0);
    infusion = +(12.5 * w).toFixed(0);
    target = "aPTT 45-60 detik";
  } else if (ind === "ecmo") {
    loading = +(100 * w).toFixed(0);
    infusion = +(37.5 * w).toFixed(0);
    target = "ACT 180-200 detik (anti-Xa 0.3-0.5)";
  } else if (ind === "enox-treatment") {
    enox = w < 2 ? +(1.5 * w).toFixed(2) : +(1 * w).toFixed(2);
    target = "anti-Xa 0.5-1.0";
    note = w < 2 ? "Neonatus <2kg: 1.5 mg/kg SC q12h" : "Anak: 1 mg/kg SC q12h";
  } else {
    enox = w < 2 ? +(0.75 * w).toFixed(2) : +(0.5 * w).toFixed(2);
    target = "anti-Xa 0.1-0.3";
    note = w < 2 ? "Neonatus <2kg: 0.75 mg/kg SC q12h" : "Anak: 0.5 mg/kg SC q12h";
  }

  // aPTT titration for UFH
  let titration = "";
  if (ind === "dvt-treatment" || ind === "crrt") {
    if (aptt < 50) titration = `↑ Dosis 10%. Re-bolus jika aPTT <35.`;
    else if (aptt >= 60 && aptt <= 85) titration = "✅ Dalam target.";
    else if (aptt > 120) titration = "⛔ STOP 1 jam. Turunkan 20%.";
    else if (aptt > 100) titration = "⚠️ Turunkan 20%.";
    else titration = "Sedikit di bawah target. Pertimbangkan kenaikan kecil.";
  }

  return (
    <CalcCard title="Heparin & Antikoagulan" subtitle="UFH, enoxaparin, CRRT, ECMO" icon="🩸" color="red">
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcSelect label="Indikasi" value={ind} onChange={setInd} options={indications} />
        {(ind === "dvt-treatment" || ind === "crrt") && (
          <CalcInput label="aPTT (detik)" value={aptt} onChange={(v) => setAptt(v as number)} />
        )}
      </div>
      <CalcResult color="red">
        {ind.startsWith("enox") ? (
          <ResultGrid cols={2}>
            <ResultItem label="Dosis Enoxaparin" value={`${enox}`} unit="mg SC q12h" />
            <ResultItem label="Target" value={target} />
          </ResultGrid>
        ) : (
          <ResultGrid cols={2}>
            {loading > 0 && <ResultItem label="Loading" value={`${loading}`} unit="unit IV" />}
            <ResultItem label="Infus" value={`${infusion}`} unit="unit/jam" />
            <ResultItem label="Target" value={target} />
          </ResultGrid>
        )}
        {titration && <ResultAlert type={titration.includes("✅") ? "success" : titration.includes("⛔") ? "danger" : "warning"}>{titration}</ResultAlert>}
        {note && <p className="text-[11px] text-muted-foreground">{note}</p>}
      </CalcResult>
    </CalcCard>
  );
}
