"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

const types = [
  { value: "defib", label: "Defibrilasi (VF/pVT) — Asinkron" },
  { value: "cardio-svt", label: "Kardioversi SVT — Sinkron" },
  { value: "cardio-af", label: "Kardioversi AF/Flutter — Sinkron" },
  { value: "cardio-vt", label: "Kardioversi VT stabil — Sinkron" },
];

export function DefibrilasiCalc() {
  const { weightGram } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [type, setType] = useState("defib");

  const r0 = (n: number) => Math.round(n);

  let d1 = 0, d2 = 0, d3 = 0;
  let note = "";

  if (type === "defib") {
    d1 = r0(2 * w); d2 = r0(4 * w); d3 = Math.min(r0(4 * w), 360);
    note = "Asinkron. Lanjutkan CPR sampai AED siap. Jangan delay analisis ritme.";
  } else if (type === "cardio-svt") {
    d1 = r0(0.5 * w); d2 = r0(1 * w); d3 = r0(2 * w);
    note = "Sinkron (sync mode ON). Sedasi dulu bila sadar. Adenosin dulu sebelum kardioversi SVT.";
  } else if (type === "cardio-af") {
    d1 = r0(1 * w); d2 = r0(2 * w); d3 = r0(4 * w);
    note = "Sinkron. Antikoagulasi bila AF >48 jam.";
  } else {
    d1 = r0(1 * w); d2 = r0(2 * w); d3 = r0(4 * w);
    note = "Sinkron. Amiodaron/Lidokain IV dulu bila stabilisasi farmakologis gagal.";
  }

  return (
    <CalcCard title="Defibrilasi & Kardioversi" subtitle="Energy dose calculation" icon="⚡" color="yellow">
      <InfoBox>
        <strong>Defibrilasi:</strong> VF/pVT asinkron. <strong>Kardioversi:</strong> SVT/AF/VT stabil — sinkron (sync mode ON).
      </InfoBox>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcSelect label="Tipe" value={type} onChange={setType} options={types} />
      </div>
      <CalcResult color="yellow">
        <ResultGrid cols={3}>
          <ResultItem label="Dosis 1" value={`${d1}`} unit="Joule" />
          <ResultItem label="Dosis 2" value={`${d2}`} unit="Joule" />
          <ResultItem label="Dosis 3+" value={`${d3}`} unit="Joule" />
        </ResultGrid>
        <p className="text-[11px] text-muted-foreground">{note}</p>
      </CalcResult>
    </CalcCard>
  );
}
