"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function UPCRCalc() {
  const { weightGram, ageMonths } = usePatient();
  const [pro, setPro] = useState(150);
  const [cr, setCr] = useState(80);
  const [w, setW] = useState(20);
  const [vol, setVol] = useState(800);
  const [age, setAge] = useState(5);

  const upcr = Math.round((pro / cr) * 100) / 100;
  let h24: string = "—";
  if (vol > 0) h24 = String(Math.round((pro / 100) * vol));

  let cls = "";
  let interp = "";
  if (upcr < 0.2) {
    cls = "🟢 Normal";
    interp = "Tidak ada proteinuria bermakna";
  } else if (upcr < 1) {
    cls = "🟡 Ringan";
    interp = "Proteinuria ringan — ulangi 3 bulan";
  } else if (upcr < 2) {
    cls = "🟠 Signifikan";
    interp = "Evaluasi penyebab glomerular vs tubular";
  } else if (upcr < 3.5) {
    cls = "🔴 Berat";
    interp = "Hampir nefrotik — periksa albumin, kolesterol";
  } else {
    cls = "⛔ Nefrotik Range";
    interp = "Nefrotik range — periksa albumin, kolesterol, komplemen";
  }

  return (
    <CalcCard title="Rasio Protein/Kreatinin Urin" subtitle="UPCR — skrining & monitoring" icon="🧪" color="blue">
      <div className="space-y-3">
        <InfoBox>Normal: UPCR &lt;0.2 (atau &lt;200 mg/g). Proteinuria signifikan: &gt;1. Nefrotik range: &gt;3.5 (dewasa) / &gt;2 (anak &gt;2 tahun).</InfoBox>
        <div className="grid grid-cols-3 gap-3">
          <CalcInput label="Protein urin (mg/dL)" value={pro} onChange={(v) => setPro(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
          <CalcInput label="Kreatinin urin (mg/dL)" value={cr} onChange={(v) => setCr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
          <CalcInput label="BB (kg)" unit="kg" value={w} onChange={(v) => setW(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <CalcInput label="Volume urin 24j (mL)" value={vol} onChange={(v) => setVol(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} placeholder="opsional" />
          <CalcInput label="Usia (thn)" value={age} onChange={(v) => setAge(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={18} />
        </div>
        <CalcResult color="blue">
          <ResultGrid cols={3}>
            <ResultItem label="UPCR" value={upcr} unit="mg/mg" />
            <ResultItem label="Estimasi 24j" value={h24 !== "—" ? `${h24} mg/24j` : `${Math.round(upcr * cr * w * 0.5)} mg/hr est.`} />
            <ResultItem label="Klasifikasi" value={cls} />
          </ResultGrid>
          <div className="rounded-lg bg-muted/50 border border-border px-3 py-2 text-xs text-muted-foreground leading-relaxed">
            {interp}<br />Normal anak &gt;2 thn: UPCR &lt;0.2 (atau &lt;200 mg/g)
          </div>
        </CalcResult>
      </div>
    </CalcCard>
  );
}
