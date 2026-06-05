"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultAlert, CalcButton, InfoBox } from "../../components/calc-ui";

export function NutrisiNeonatusCalc() {
  const { weightGram, ageDays } = usePatient();
  const [wt, setWt] = useState(weightGram);
  const [age, setAge] = useState(ageDays);
  const [type, setType] = useState("parenteral");
  const [cal, setCal] = useState(110);
  const [show, setShow] = useState(false);

  useEffect(() => { setWt(weightGram); setAge(ageDays); }, [weightGram, ageDays]);

  const wtKg = wt / 1000;
  const proTarget = wtKg < 1 ? 3.5 : wtKg < 1.5 ? 3.5 : 3;
  const lipTarget = age <= 3 ? 1 : age <= 7 ? 2 : 3;
  const girTarget = age <= 1 ? 4 : age <= 3 ? 6 : 8;
  const totalCalDay = Math.round(cal * wtKg);
  const proDay = +(proTarget * wtKg).toFixed(1);
  const lipDay = +(lipTarget * wtKg).toFixed(1);

  return (
    <CalcCard title="Kebutuhan Nutrisi Neonatus" subtitle="Target harian berdasarkan BB & usia" icon="🥛" color="orange">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="g" />
        <CalcInput label="Usia (hari)" value={age} onChange={(v) => setAge(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="hr" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CalcSelect
          label="Jenis Nutrisi"
          value={type}
          onChange={setType}
          options={[
            { value: "parenteral", label: "Parenteral (TPN)" },
            { value: "enteral", label: "Enteral (ASI/Formula)" },
            { value: "combined", label: "Kombinasi" },
          ]}
        />
        <CalcInput label="Target kalori" value={cal} onChange={(v) => setCal(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="kcal/kg/hr" />
      </div>
      <CalcButton onClick={() => setShow(true)} color="orange">Hitung Kebutuhan</CalcButton>
      {show && (
        <CalcResult color="orange">
          <div className="space-y-1 text-xs leading-relaxed">
            <p><strong>Target Nutrisi untuk {wt}g (usia {age} hari):</strong></p>
            <p>🔥 Kalori: <strong>{cal} kcal/kg/hr</strong> → {totalCalDay} kcal/hari</p>
            <p>🥩 Protein: <strong>{proTarget} g/kg/hr</strong> → {proDay} g/hari</p>
            <p>🫙 Lipid: <strong>{lipTarget} g/kg/hr</strong> (naikkan bertahap) → {lipDay} g/hari</p>
            <p>🍬 GIR: <strong>{girTarget} mg/kg/mnt</strong> target</p>
            {type === "enteral" && <p>🥛 Enteral: Mulai trofik 10-20 mL/kg/hr, naikkan 10-20 mL/kg/hari</p>}
            {type === "parenteral" && <p>💉 Parenteral: Mulai aminoasid hari 1, lipid hari 1-3</p>}
            {wtKg < 0.75 && <p>⚠️ ELBW: Protein awal 2-3 g/kg, naikkan 0.5 g/kg/hari</p>}
          </div>
        </CalcResult>
      )}
    </CalcCard>
  );
}
