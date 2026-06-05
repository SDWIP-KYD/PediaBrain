"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, CalcButton, InfoBox } from "../../components/calc-ui";

export function TransfusiTukarCalc() {
  const { weightGram } = usePatient();
  const [wt, setWt] = useState(weightGram);
  const [bv, setBv] = useState("85");
  const [show, setShow] = useState(false);

  useEffect(() => setWt(weightGram), [weightGram]);

  const wtKg = wt / 1000;
  const bvNum = parseFloat(bv);
  const total = Math.round(2 * bvNum * wtKg);
  const cycle5 = Math.round(total / 5);
  const cycle10 = Math.round(total / 10);

  return (
    <CalcCard title="Transfusi Tukar" subtitle="Double Volume Exchange Transfusion" icon="🔄" color="yellow">
      <InfoBox>
        Volume transfusi tukar = 2 × volume darah neonatus (80–85 mL/kgBB). Siklus 5–10 mL/kali.
      </InfoBox>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="g" />
        <CalcSelect
          label="Volume darah (mL/kg)"
          value={bv}
          onChange={setBv}
          options={[
            { value: "85", label: "85 mL/kg (aterm)" },
            { value: "90", label: "90 mL/kg (prematur)" },
            { value: "80", label: "80 mL/kg (konservatif)" },
          ]}
        />
      </div>
      <CalcButton onClick={() => setShow(true)} color="yellow">Hitung Volume</CalcButton>
      {show && (
        <CalcResult color="yellow">
          <ResultGrid cols={3}>
            <ResultItem label="Total Volume" value={`${total}`} unit="mL" />
            <ResultItem label="Siklus 5mL/x" value={`${cycle5}`} unit="siklus" />
            <ResultItem label="Siklus 10mL/x" value={`${cycle10}`} unit="siklus" />
          </ResultGrid>
        </CalcResult>
      )}
    </CalcCard>
  );
}
