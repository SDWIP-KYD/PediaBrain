"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

export function KneeHeightCalc() {
  const [kneeHeight, setKneeHeight] = useState(35);
  const [sex, setSex] = useState("anak");

  let tb = 0;
  if (sex === "laki") tb = 64.19 + (2.02 * kneeHeight);
  else if (sex === "perempuan") tb = 84.88 + (1.83 * kneeHeight);
  else tb = (2.69 * kneeHeight) + 24.2;

  return (
    <CalcCard title="Knee-to-Heel Formula" subtitle="Estimasi Tinggi Badan (bedridden)" icon="📏" color="teal">
      <InfoBox>
        Untuk pasien tidur/tidak dapat diukur TB. Rumus berbeda untuk laki-laki, perempuan, dan anak.
      </InfoBox>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Knee Height (cm)" value={kneeHeight} onChange={(v) => setKneeHeight(v as number)} step={0.1} />
        <CalcSelect
          label="Jenis Kelamin"
          value={sex}
          onChange={setSex}
          options={[
            { value: "laki", label: "Laki-laki" },
            { value: "perempuan", label: "Perempuan" },
            { value: "anak", label: "Anak" },
          ]}
        />
      </div>
      <CalcResult color="teal">
        <ResultGrid cols={1}>
          <ResultItem label="Estimasi Tinggi Badan" value={`${tb.toFixed(1)}`} unit="cm" />
        </ResultGrid>
        <div className="grid grid-cols-3 gap-2 mt-1">
          <div className="px-2 py-1.5 rounded bg-muted/50 border border-border text-[10px] text-center">
            <p className="text-muted-foreground mb-0.5">♂ Laki-laki</p>
            <p className="font-mono text-purple-300">TB = 64.19 + (2.02 × KH)</p>
          </div>
          <div className="px-2 py-1.5 rounded bg-muted/50 border border-border text-[10px] text-center">
            <p className="text-muted-foreground mb-0.5">♀ Perempuan</p>
            <p className="font-mono text-pink-300">TB = 84.88 + (1.83 × KH)</p>
          </div>
          <div className="px-2 py-1.5 rounded bg-muted/50 border border-border text-[10px] text-center">
            <p className="text-muted-foreground mb-0.5">👶 Anak</p>
            <p className="font-mono text-blue-300">TB = (2.69 × KH) + 24.2</p>
          </div>
        </div>
      </CalcResult>
    </CalcCard>
  );
}
