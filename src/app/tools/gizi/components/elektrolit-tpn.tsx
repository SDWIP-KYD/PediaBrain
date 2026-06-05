"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, InfoBox } from "../../components/calc-ui";

interface ElektrolitRow {
  name: string;
  minPerKg: number;
  maxPerKg: number;
  unit: string;
  sediaan: string;
  sediaanConc: string;
}

const elektrolitData: ElektrolitRow[] = [
  { name: "Na", minPerKg: 2, maxPerKg: 4, unit: "mEq/kg/hr", sediaan: "NaCl 20%", sediaanConc: "3.4 mEq/mL" },
  { name: "K", minPerKg: 2, maxPerKg: 4, unit: "mEq/kg/hr", sediaan: "KCl 7.5%", sediaanConc: "1 mEq/mL" },
  { name: "Ca", minPerKg: 0.8, maxPerKg: 1.5, unit: "mmol/kg/hr", sediaan: "CaGluk 10%", sediaanConc: "0.45 mEq/mL" },
  { name: "P", minPerKg: 1, maxPerKg: 2, unit: "mmol/kg/hr", sediaan: "K-Fosf", sediaanConc: "3 mmol/mL" },
  { name: "Mg", minPerKg: 0.15, maxPerKg: 0.25, unit: "mmol/kg/hr", sediaan: "MgSO4 50%", sediaanConc: "4 mEq/mL" },
];

export function ElektrolitTPNCalc() {
  const { weightGram, ageYears } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [age, setAge] = useState(Math.round(ageYears));

  const isNeonate = age < 1;

  return (
    <CalcCard title="Elektrolit dalam TPN" subtitle="Na, K, Ca, P, Mg — kebutuhan harian" icon="⚡" color="green">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <CalcInput label="BB (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.1} />
          <CalcInput label="Usia (thn)" unit="thn" value={age} onChange={(v) => setAge(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={18} />
        </div>

        <CalcResult color="green">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Elektrolit</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Kebutuhan/kg/hr</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Total/hari</th>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Sediaan</th>
                </tr>
              </thead>
              <tbody>
                {elektrolitData.map((el) => {
                  const isK = el.name === "K";
                  const minTotal = isK && isNeonate ? 0 : el.minPerKg * weight * 24;
                  const maxTotal = isK && isNeonate ? 0 : el.maxPerKg * weight * 24;
                  return (
                    <tr key={el.name} className="border-b border-border/50 last:border-0">
                      <td className="py-1.5 font-medium">{el.name}</td>
                      <td className="text-right font-mono">
                        {isK && isNeonate ? "0" : `${el.minPerKg}–${el.maxPerKg}`}
                        <span className="text-muted-foreground ml-1">{el.unit}</span>
                      </td>
                      <td className="text-right font-mono font-bold">
                        {isK && isNeonate ? "0" : `${minTotal.toFixed(1)}–${maxTotal.toFixed(1)}`}
                        <span className="text-muted-foreground ml-1">mEq/hari</span>
                      </td>
                      <td className="text-left text-muted-foreground">{el.sediaan} ({el.sediaanConc})</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CalcResult>
        <InfoBox>
          K = 0 untuk neonatus &lt;1 bulan. NaCl 20% = 3.4 mEq/mL, KCl 7.5% = 1 mEq/mL, CaGluk 10% = 0.45 mEq/mL, K-Fosf = 3 mmol/mL, MgSO4 50% = 4 mEq/mL.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
