"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function MAPTargetCalc() {
  const [sys, setSys] = useState(160);
  const [dia, setDia] = useState(100);
  const [pct, setPct] = useState("25");

  const map = Math.round((sys + 2 * dia) / 3);
  const mapT = Math.round(map * (1 - parseInt(pct) / 100));
  const sysT = Math.round(mapT + (sys - map));
  const diaT = Math.round(mapT - (map - dia));

  return (
    <CalcCard title="MAP & Target Penurunan TD" subtitle="Krisis hipertensi — panduan aman" icon="📈" color="teal">
      <div className="space-y-3">
        <InfoBox>Prinsip: Krisis hipertensi — turunkan MAP maks 25% dalam 8 jam pertama. Jangan turunkan terlalu cepat (risiko iskemia organ).</InfoBox>
        <div className="grid grid-cols-3 gap-3">
          <CalcInput label="Sistolik (mmHg)" unit="mmHg" value={sys} onChange={(v) => setSys(typeof v === "string" ? parseFloat(v) || 0 : v)} min={60} />
          <CalcInput label="Diastolik (mmHg)" unit="mmHg" value={dia} onChange={(v) => setDia(typeof v === "string" ? parseFloat(v) || 0 : v)} min={30} />
          <CalcSelect label="Target penurunan (%)" value={pct} onChange={setPct} options={[
            { value: "25", label: "25% (aman, 8 jam)" },
            { value: "15", label: "15% (sangat hati-hati)" },
            { value: "10", label: "10% (1 jam pertama)" },
          ]} />
        </div>
        <CalcResult color="teal">
          <ResultGrid cols={3}>
            <ResultItem label="MAP aktual" value={map} unit="mmHg" />
            <ResultItem label="MAP target" value={mapT} unit="mmHg" />
            <ResultItem label="TD Sistolik" value={`${sysT} mmHg`} />
          </ResultGrid>
          <ResultGrid cols={2}>
            <ResultItem label="TD target Diastolik" value={`${diaT} mmHg`} />
            <ResultItem label="Penurunan" value={`${pct}%`} />
          </ResultGrid>
        </CalcResult>
      </div>
    </CalcCard>
  );
}
