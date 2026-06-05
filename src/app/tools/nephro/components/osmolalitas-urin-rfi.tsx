"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcResult, ResultItem, ResultGrid } from "../../components/calc-ui";

export function OsmolalitasUrinRFICalc() {
  const [uosm, setUosm] = useState(400);
  const [nau, setNau] = useState(20);
  const [cru, setCru] = useState(80);
  const [nas, setNas] = useState(140);
  const [crs, setCrs] = useState(1.5);
  const [osms, setOsms] = useState(290);

  const r2 = (n: number) => Math.round(n * 100) / 100;
  const ratio = r2(uosm / osms);
  const rfi = r2((nau / nas) / (cru / crs));

  let osmInterp = "";
  let concap = "";
  if (uosm > 800) { osmInterp = "🟢 Konsentrasi baik (>800)"; concap = "Normal"; }
  else if (uosm > 400) { osmInterp = "🟡 Konsentrasi sedang (400–800)"; concap = "Borderline"; }
  else if (uosm > 300) { osmInterp = "🟠 Isosthenuric (~300)"; concap = "Terganggu"; }
  else { osmInterp = "🔴 Dilute (<300)"; concap = "Sangat terganggu"; }

  return (
    <CalcCard title="Osmolalitas & Indeks Ginjal Urin" subtitle="Renal Failure Index, FENa, osmolalitas" icon="🔭" color="teal">
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <CalcInput label="Osmolalitas urin (mOsm/kg)" value={uosm} onChange={(v) => setUosm(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
          <CalcInput label="Na urin (mEq/L)" value={nau} onChange={(v) => setNau(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
          <CalcInput label="Cr urin (mg/dL)" value={cru} onChange={(v) => setCru(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <CalcInput label="Na serum (mEq/L)" value={nas} onChange={(v) => setNas(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
          <CalcInput label="Cr serum (mg/dL)" value={crs} onChange={(v) => setCrs(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} step={0.01} />
          <CalcInput label="Osmolalitas serum" value={osms} onChange={(v) => setOsms(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        </div>
        <CalcResult color="teal">
          <ResultGrid cols={3}>
            <ResultItem label="Osm ratio U/S" value={ratio} note="N: >1.2 (konsentrasi)" />
            <ResultItem label="Renal Failure Index" value={rfi} note="<1: pre-renal" />
            <ResultItem label="Kapasitas Konsentrasi" value={concap} />
          </ResultGrid>
          <ResultItem label="Interpretasi Osm urin" value={osmInterp} />
        </CalcResult>
      </div>
    </CalcCard>
  );
}
