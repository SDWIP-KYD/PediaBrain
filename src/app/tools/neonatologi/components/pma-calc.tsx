"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultItem, ResultGrid, CalcButton } from "../../components/calc-ui";

export function PMACalc() {
  const { gestationalAge, ageDays } = usePatient();
  const [ga, setGa] = useState(gestationalAge);
  const [days, setDays] = useState(ageDays);
  const [weeks, setWeeks] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => { setGa(gestationalAge); setDays(ageDays); }, [gestationalAge, ageDays]);

  const totalWeeks = ga + days / 7 + weeks;
  const pmaFloor = Math.floor(totalWeeks);
  const pmaDays = Math.round((totalWeeks % 1) * 7);
  const pmaStr = `${pmaFloor}+${pmaDays} mgg`;

  const corrected = totalWeeks >= 40
    ? `+${((totalWeeks - 40) * 7 / 30).toFixed(1)} bulan koreksi`
    : `${(40 - totalWeeks).toFixed(1)} mgg ke term`;

  let status = "";
  if (totalWeeks < 34) status = "Sangat Prematur";
  else if (totalWeeks < 37) status = "Prematur Akhir";
  else if (totalWeeks < 42) status = "Cukup Bulan";
  else status = "Post-term";

  return (
    <CalcCard title="Usia Koreksi (PMA)" subtitle="Postmenstrual Age & Corrected Age" icon="📅" color="teal">
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="GA saat lahir (mgg)" value={ga} onChange={(v) => setGa(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="mgg" />
        <CalcInput label="Usia postnatal (hr)" value={days} onChange={(v) => setDays(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="hr" />
        <CalcInput label="Usia postnatal (mgg)" value={weeks} onChange={(v) => setWeeks(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="mgg" />
      </div>
      <CalcButton onClick={() => setShow(true)} color="teal">Hitung PMA</CalcButton>
      {show && (
        <CalcResult color="teal">
          <ResultGrid cols={3}>
            <ResultItem label="PMA" value={pmaStr} />
            <ResultItem label="Usia koreksi" value={corrected} />
            <ResultItem label="Status" value={status} />
          </ResultGrid>
        </CalcResult>
      )}
    </CalcCard>
  );
}
