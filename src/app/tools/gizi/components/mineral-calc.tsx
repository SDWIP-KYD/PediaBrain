"use client";

import { useState } from "react";
import { CalcCard, CalcSelect, CalcResult, ResultItem, InfoBox } from "../../components/calc-ui";

interface MineralData {
  ageGroup: string;
  calcium: string;
  magnesium: string;
  zinc: string;
  selenium: string;
}

const mineralTable: MineralData[] = [
  { ageGroup: "Prematur", calcium: "150-200 mg/kg/hari", magnesium: "6-8 mg/kg/hari", zinc: "1-3 mg/hari", selenium: "5-10 mcg/kg/hari" },
  { ageGroup: "0-6 bulan", calcium: "200 mg/hari", magnesium: "20-30 mg/hari", zinc: "2 mg/hari", selenium: "10-15 mcg/hari" },
  { ageGroup: "6-12 bulan", calcium: "260 mg/hari", magnesium: "30-75 mg/hari", zinc: "3 mg/hari", selenium: "15-20 mcg/hari" },
  { ageGroup: "1-3 tahun", calcium: "700 mg/hari", magnesium: "65 mg/hari", zinc: "3 mg/hari", selenium: "20 mcg/hari" },
  { ageGroup: "4-8 tahun", calcium: "1000 mg/hari", magnesium: "110 mg/hari", zinc: "5 mg/hari", selenium: "30 mcg/hari" },
  { ageGroup: "9-13 tahun", calcium: "1300 mg/hari", magnesium: "240 mg/hari", zinc: "8 mg/hari", selenium: "40 mcg/hari" },
  { ageGroup: "14-18 tahun", calcium: "1300 mg/hari", magnesium: "360-410 mg/hari", zinc: "9-11 mg/hari", selenium: "45-55 mcg/hari" },
];

export function MineralCalc() {
  const [selectedAge, setSelectedAge] = useState("0-6 bulan");

  const ageOptions = mineralTable.map((m) => ({ value: m.ageGroup, label: m.ageGroup }));
  const data = mineralTable.find((m) => m.ageGroup === selectedAge) || mineralTable[0];

  return (
    <CalcCard title="Mineral Requirements" icon="🧪">
      <div className="space-y-3">
        <CalcSelect label="Kelompok Usia" value={selectedAge} onChange={setSelectedAge} options={ageOptions} />
        <CalcResult>
          <ResultItem label="Calcium" value={data.calcium} />
          <ResultItem label="Magnesium" value={data.magnesium} />
          <ResultItem label="Zinc" value={data.zinc} />
          <ResultItem label="Selenium" value={data.selenium} />
        </CalcResult>
        <InfoBox>
          Prematur membutuhkan kalsium lebih tinggi (150-200 mg/kg/hari) untuk mineralisasi tulang. Selenium penting untuk mencegah BPD.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
