"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

interface Threshold {
  h: number;
  v: number;
}

const thresholds = {
  low: {
    photo: [{ h: 24, v: 12 }, { h: 48, v: 15 }, { h: 72, v: 18 }, { h: 96, v: 20 }, { h: 120, v: 21 }] as Threshold[],
    exchange: [{ h: 24, v: 15 }, { h: 48, v: 20 }, { h: 72, v: 25 }, { h: 96, v: 25 }] as Threshold[],
  },
  med: {
    photo: [{ h: 24, v: 10 }, { h: 48, v: 13 }, { h: 72, v: 15 }, { h: 96, v: 17 }, { h: 120, v: 18 }] as Threshold[],
    exchange: [{ h: 24, v: 13 }, { h: 48, v: 18 }, { h: 72, v: 22 }, { h: 96, v: 22 }] as Threshold[],
  },
  high: {
    photo: [{ h: 24, v: 8 }, { h: 48, v: 11 }, { h: 72, v: 13 }, { h: 96, v: 14 }, { h: 120, v: 15 }] as Threshold[],
    exchange: [{ h: 24, v: 11 }, { h: 48, v: 16 }, { h: 72, v: 19 }, { h: 96, v: 20 }] as Threshold[],
  },
};

export function FototerapiCalc() {
  const { weightGram, gestationalAge } = usePatient();
  const [wt, setWt] = useState(weightGram);
  const [ga, setGa] = useState(gestationalAge);
  const [ageH, setAgeH] = useState(48);
  const [bil, setBil] = useState(10);
  const [risk, setRisk] = useState("med");

  useEffect(() => { setWt(weightGram); setGa(gestationalAge); }, [weightGram, gestationalAge]);

  const th = thresholds[risk as keyof typeof thresholds];
  let photoTh = th.photo[th.photo.length - 1].v;
  let exchangeTh = th.exchange[th.exchange.length - 1].v;

  for (const p of th.photo) {
    if (ageH <= p.h) { photoTh = p.v; break; }
  }
  for (const p of th.exchange) {
    if (ageH <= p.h) { exchangeTh = p.v; break; }
  }

  let rec = "";
  let recType: "success" | "warning" | "danger" = "success";

  if (bil >= exchangeTh) { rec = "🔴 TRANSFUSI TUKAR segera"; recType = "danger"; }
  else if (bil >= photoTh) { rec = "🟡 Mulai FOTOTERAPI segera"; recType = "warning"; }
  else if (bil >= photoTh - 2) { rec = "🟠 Pantau ketat, siapkan fototerapi"; recType = "warning"; }
  else { rec = "🟢 Observasi, pantau bilirubin serial"; recType = "success"; }

  return (
    <CalcCard title="Fototerapi & Transfusi" subtitle="Bilirubin thresholds AAP" icon="☀️" color="yellow">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(v as number)} unit="g" />
        <CalcInput label="GA (minggu)" value={ga} onChange={(v) => setGa(v as number)} unit="mgg" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="Usia (jam)" value={ageH} onChange={(v) => setAgeH(v as number)} unit="jam" />
        <CalcInput label="Bilirubin (mg/dL)" value={bil} onChange={(v) => setBil(v as number)} step={0.1} />
        <CalcSelect
          label="Risk Factor"
          value={risk}
          onChange={setRisk}
          options={[
            { value: "low", label: "Rendah (sehat, ≥38 mgg)" },
            { value: "med", label: "Sedang (35–37 mgg)" },
            { value: "high", label: "Tinggi (≥1 faktor risiko)" },
          ]}
        />
      </div>
      <CalcResult color="yellow">
        <ResultGrid cols={2}>
          <ResultItem label="Threshold Fototerapi" value={`${photoTh}`} unit="mg/dL" />
          <ResultItem label="Threshold Transfusi" value={`${exchangeTh}`} unit="mg/dL" />
        </ResultGrid>
        <ResultAlert type={recType}>{rec}</ResultAlert>
        {ga < 35 && (
          <p className="mt-2 text-xs text-amber-700">
            ⚠️ Prematur &lt;35 mgg: threshold lebih rendah, gunakan panduan NICU setempat
          </p>
        )}
      </CalcResult>
    </CalcCard>
  );
}
