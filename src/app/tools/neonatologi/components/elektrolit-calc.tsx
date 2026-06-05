"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, InfoBox } from "../../components/calc-ui";

interface ElecRow {
  element: string;
  req: string;
  perKg: number;
  concentration: string;
  unit: string;
}

export function ElektrolitCalc() {
  const { weightGram, ageDays } = usePatient();
  const [wt, setWt] = useState(weightGram);
  const [age, setAge] = useState(ageDays);

  useEffect(() => { setWt(weightGram); setAge(ageDays); }, [weightGram, ageDays]);

  const wtKg = wt / 1000;
  const isEarly = age <= 3;

  const data: ElecRow[] = [
    { element: "Natrium (Na)", req: isEarly ? "0 (ditunda <48j)" : "2-4 mEq/kg/hr", perKg: isEarly ? 0 : 3, concentration: "NaCl 0.9% = 0.154 mEq/mL", unit: "mEq/hr" },
    { element: "Kalium (K)", req: isEarly ? "0 (tunda <48j)" : "1-3 mEq/kg/hr", perKg: isEarly ? 0 : 2, concentration: "KCl 7.46% = 1 mEq/mL", unit: "mEq/hr" },
    { element: "Kalsium (Ca)", req: "1.5-2.5 mmol/kg/hr", perKg: 2, concentration: "CaGluk 10% = 0.45 mEq/mL", unit: "mmol/hr" },
    { element: "Fosfor (P)", req: "1.5-2 mmol/kg/hr", perKg: 1.5, concentration: "Na fosfat = 1 mmol/mL", unit: "mmol/hr" },
    { element: "Magnesium (Mg)", req: "0.15-0.25 mmol/kg/hr", perKg: 0.2, concentration: "MgSO4 20% = 0.8 mmol/mL", unit: "mmol/hr" },
  ];

  return (
    <CalcCard title="Elektrolit Neonatus" subtitle="Kebutuhan Elektrolit Harian" icon="⚖️" color="slate">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(v as number)} unit="g" />
        <CalcInput label="Usia (hari)" value={age} onChange={(v) => setAge(v as number)} />
      </div>
      <CalcResult color="slate">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 text-muted-foreground font-medium">Elektrolit</th>
                <th className="text-left py-2 px-2 text-muted-foreground font-medium">Kebutuhan</th>
                <th className="text-right py-2 px-2 text-muted-foreground font-medium">Jumlah</th>
                <th className="text-left py-2 px-2 text-muted-foreground font-medium hidden sm:table-cell">Konsentrasi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.element} className="border-b border-border/50">
                  <td className="py-2 px-2 font-medium">{row.element}</td>
                  <td className="py-2 px-2 text-muted-foreground">{row.req}</td>
                  <td className="py-2 px-2 text-right font-mono font-bold">
                    {row.perKg > 0 ? `${+(row.perKg * wtKg).toFixed(2)} ${row.unit}` : "—"}
                  </td>
                  <td className="py-2 px-2 text-muted-foreground text-[10px] hidden sm:table-cell">{row.concentration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CalcResult>
    </CalcCard>
  );
}
