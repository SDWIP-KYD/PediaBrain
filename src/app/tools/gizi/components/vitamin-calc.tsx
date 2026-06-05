"use client";

import { useState } from "react";
import { CalcCard, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

interface VitaminData {
  ageGroup: string;
  a: string;
  d: string;
  e: string;
  k: string;
  bComplex: string;
  c: string;
}

const vitaminTable: VitaminData[] = [
  { ageGroup: "Prematur (0-6 bln)", a: "300 mcg", d: "400-800 IU", e: "2-3 mg", k: "2 mcg", bComplex: "Terapi", c: "15-20 mg" },
  { ageGroup: "0-6 bulan", a: "400 mcg", d: "400 IU", e: "3 mg", k: "2 mcg", bComplex: "0.2-0.3 mg", c: "25 mg" },
  { ageGroup: "6-12 bulan", a: "500 mcg", d: "400 IU", e: "4 mg", k: "10 mcg", bComplex: "0.3-0.4 mg", c: "30 mg" },
  { ageGroup: "1-3 tahun", a: "300 mcg", d: "600 IU", e: "6 mg", k: "25 mcg", bComplex: "0.5-0.6 mg", c: "35 mg" },
  { ageGroup: "4-8 tahun", a: "400 mcg", d: "600 IU", e: "7 mg", k: "30 mcg", bComplex: "0.6-0.7 mg", c: "45 mg" },
  { ageGroup: "9-13 tahun", a: "600 mcg", d: "600 IU", e: "11 mg", k: "45 mcg", bComplex: "0.8-0.9 mg", c: "65 mg" },
  { ageGroup: "14-18 tahun", a: "900 mcg (L) / 700 mcg (P)", d: "600 IU", e: "15 mg (L) / 12 mg (P)", k: "65-75 mcg", bComplex: "1.0-1.1 mg", c: "75-90 mg" },
];

export function VitaminCalc() {
  const [selectedAge, setSelectedAge] = useState("0-6 bulan");

  const ageOptions = vitaminTable.map((v) => ({ value: v.ageGroup, label: v.ageGroup }));
  const data = vitaminTable.find((v) => v.ageGroup === selectedAge) || vitaminTable[0];

  return (
    <CalcCard title="Vitamin Requirements" icon="💊">
      <div className="space-y-3">
        <CalcSelect label="Kelompok Usia" value={selectedAge} onChange={setSelectedAge} options={ageOptions} />
        <CalcResult>
          <ResultItem label="Vitamin A" value={data.a} />
          <ResultItem label="Vitamin D" value={data.d} />
          <ResultItem label="Vitamin E" value={data.e} />
          <ResultItem label="Vitamin K" value={data.k} />
          <ResultItem label="B-Complex" value={data.bComplex} />
          <ResultItem label="Vitamin C" value={data.c} />
        </CalcResult>
        <InfoBox>
          Prematur membutuhkan suplementasi vitamin lebih tinggi karena cadangan tubuh yang terbatas. Berikan vitamin A pada BBLR untuk mencegah ROP.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
