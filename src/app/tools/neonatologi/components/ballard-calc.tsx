"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

const neuroScore = [
  { label: "Posture", value: -1, desc: "0: Lurus" },
  { label: "Square window", value: 0, desc: "" },
  { label: "Arm recoil", value: 0, desc: "" },
  { label: "Popliteal angle", value: 0, desc: "" },
  { label: "Scarf sign", value: 0, desc: "" },
  { label: "Heel to ear", value: 0, desc: "" },
];

const physScore = [
  { label: "Skin", value: 0, desc: "" },
  { label: "Lanugo", value: 0, desc: "" },
  { label: "Plantar crease", value: 0, desc: "" },
  { label: "Breast", value: 0, desc: "" },
  { label: "Eye/Ear", value: 0, desc: "" },
  { label: "Genital", value: 0, desc: "" },
];

const gaMap: [number, number][] = [
  [-10, 20], [-5, 22], [0, 24], [5, 26], [10, 28], [15, 30], [20, 32], [25, 34], [30, 36], [35, 38], [40, 40], [45, 42], [50, 44],
];

export function BallardCalc() {
  const [neuro, setNeuro] = useState(0);
  const [phys, setPhys] = useState(0);

  const total = neuro + phys;
  let ga = 24;
  for (const [score, weeks] of gaMap) {
    if (total >= score) ga = weeks;
  }

  return (
    <CalcCard title="New Ballard Score" subtitle="Estimasi usia kehamilan" icon="📐" color="purple">
      <InfoBox>
        Skor neuromuscular + fisik → estimasi GA. Negative scores dimungkinkan.
      </InfoBox>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Neuromuscular Score" value={neuro} onChange={(v) => setNeuro(v as number)} min={-25} max={50} />
        <CalcInput label="Physical Score" value={phys} onChange={(v) => setPhys(v as number)} min={0} max={50} />
      </div>
      <CalcResult color="purple">
        <ResultGrid cols={2}>
          <ResultItem label="Total Skor" value={`${total}`} />
          <ResultItem label="Estimasi GA" value={`${ga}`} unit="minggu" />
        </ResultGrid>
      </CalcResult>
    </CalcCard>
  );
}
