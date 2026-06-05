"use client";

import { useState } from "react";
import { CalcCard, CalcSelect, CalcResult, InfoBox } from "../../components/calc-ui";

const akgData: Record<string, { E: number; P: number; L: number; KH: number; Ca: number; Fe: number; Zn: number; VA: number; VC: number; VD: number }> = {
  "0-5mo":   { E: 550, P: 9, L: 31, KH: 58, Ca: 200, Fe: 0.3, Zn: 1.5, VA: 375, VC: 40, VD: 5 },
  "6-11mo":  { E: 725, P: 15, L: 35, KH: 82, Ca: 270, Fe: 11, Zn: 4, VA: 400, VC: 50, VD: 5 },
  "1-3yr":   { E: 1125, P: 20, L: 34, KH: 155, Ca: 650, Fe: 8, Zn: 4, VA: 400, VC: 40, VD: 5 },
  "4-6yr":   { E: 1600, P: 25, L: 45, KH: 220, Ca: 1000, Fe: 9, Zn: 5, VA: 450, VC: 45, VD: 5 },
  "7-9yr":   { E: 1850, P: 40, L: 52, KH: 254, Ca: 1000, Fe: 10, Zn: 7, VA: 500, VC: 45, VD: 5 },
  "10-12m":  { E: 2100, P: 50, L: 70, KH: 289, Ca: 1200, Fe: 13, Zn: 8, VA: 600, VC: 50, VD: 5 },
  "10-12f":  { E: 2000, P: 50, L: 67, KH: 275, Ca: 1200, Fe: 20, Zn: 8, VA: 600, VC: 50, VD: 5 },
  "13-15m":  { E: 2475, P: 72, L: 82, KH: 340, Ca: 1200, Fe: 19, Zn: 11, VA: 700, VC: 75, VD: 5 },
  "13-15f":  { E: 2125, P: 69, L: 71, KH: 292, Ca: 1200, Fe: 26, Zn: 9, VA: 700, VC: 65, VD: 5 },
  "16-18m":  { E: 2675, P: 66, L: 89, KH: 368, Ca: 1200, Fe: 15, Zn: 13, VA: 700, VC: 90, VD: 5 },
  "16-18f":  { E: 2125, P: 59, L: 71, KH: 292, Ca: 1200, Fe: 26, Zn: 9, VA: 600, VC: 75, VD: 5 },
};

const ageOptions = [
  { value: "0-5mo", label: "0-5 bulan (bayi ASI)" },
  { value: "6-11mo", label: "6-11 bulan" },
  { value: "1-3yr", label: "1-3 tahun" },
  { value: "4-6yr", label: "4-6 tahun" },
  { value: "7-9yr", label: "7-9 tahun" },
  { value: "10-12m", label: "10-12 tahun (L)" },
  { value: "10-12f", label: "10-12 tahun (P)" },
  { value: "13-15m", label: "13-15 tahun (L)" },
  { value: "13-15f", label: "13-15 tahun (P)" },
  { value: "16-18m", label: "16-18 tahun (L)" },
  { value: "16-18f", label: "16-18 tahun (P)" },
];

const rows: [string, keyof typeof akgData["0-5mo"], string][] = [
  ["Energi", "E", "kcal/hari"],
  ["Protein", "P", "g/hari"],
  ["Lemak total", "L", "g/hari"],
  ["Karbohidrat", "KH", "g/hari"],
  ["Kalsium", "Ca", "mg/hari"],
  ["Besi", "Fe", "mg/hari"],
  ["Zinc", "Zn", "mg/hari"],
  ["Vitamin A", "VA", "mcg RE"],
  ["Vitamin C", "VC", "mg/hari"],
  ["Vitamin D", "VD", "mcg/hari"],
];

export function AKGCalc() {
  const [ageGroup, setAgeGroup] = useState("4-6yr");
  const d = akgData[ageGroup] || akgData["4-6yr"];

  return (
    <CalcCard title="AKG Indonesia 2019" subtitle="Angka Kecukupan Gizi per kelompok usia" icon="📋" color="blue">
      <div className="space-y-3">
        <CalcSelect label="Kelompok Usia" value={ageGroup} onChange={setAgeGroup} options={ageOptions} />
        <CalcResult color="blue">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Zat Gizi</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground">AKG</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Satuan</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([name, key, unit]) => (
                  <tr key={key} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5 font-medium">{name}</td>
                    <td className="text-right font-mono font-bold">{d[key]}</td>
                    <td className="text-right text-muted-foreground">{unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcResult>
        <InfoBox>
          Sumber: Permenkes RI No. 28/2019 tentang Angka Kecukupan Gizi yang Dianjurkan untuk Bangsa Indonesia.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
