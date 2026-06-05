"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, CalcButton } from "../../components/calc-ui";

interface DrugRow {
  drug: string;
  dose: string;
  unit: string;
  vol: string;
  route: string;
  note: string;
}

function calcResusDrugs(wtKg: number): DrugRow[] {
  const r2 = (n: number) => +n.toFixed(2);
  const r0 = (n: number) => Math.round(n);
  return [
    { drug: "Epinefrin 1:10000", dose: "0.1", unit: "mL/kg", vol: `${r2(0.1 * wtKg)}`, route: "IV/IO/ETT", note: "= 0.01 mg/kg" },
    { drug: "Epinefrin 1:1000 (ETT)", dose: "0.5", unit: "mL/kg", vol: `${r2(0.5 * wtKg)}`, route: "ETT", note: "= 0.1 mg/kg" },
    { drug: "Dekstrosa 10%", dose: "2", unit: "mL/kg", vol: `${r0(2 * wtKg)}`, route: "IV", note: "hipoglikemia" },
    { drug: "NaCl 0.9% bolus", dose: "10", unit: "mL/kg", vol: `${r0(10 * wtKg)}`, route: "IV 10 mnt", note: "hipovolemia" },
    { drug: "NaHCO₃ 4.2%", dose: "1", unit: "mEq/kg", vol: `${r0(2 * wtKg)}`, route: "IV pelan", note: "= 2 mL 4.2%" },
    { drug: "Nalokson 0.4mg/mL", dose: "0.01", unit: "mg/kg", vol: `${r2(0.025 * wtKg)}`, route: "IV/IM", note: `${r2(0.025 * wtKg)} mL` },
    { drug: "Fenobarbital loading", dose: "20", unit: "mg/kg", vol: `${r2(20 * wtKg / 200)}`, route: "IV ≤30 mnt", note: "200mg/mL sediaan" },
    { drug: "Kafein sitrat loading", dose: "20", unit: "mg/kg", vol: `${r2(20 * wtKg / 20)}`, route: "PO/IV", note: "20mg/mL sediaan" },
  ];
}

export function ObatResusitasiCalc() {
  const { weightGram } = usePatient();
  const [wt, setWt] = useState(weightGram);
  const [show, setShow] = useState(false);

  useEffect(() => setWt(weightGram), [weightGram]);

  const drugs = calcResusDrugs(wt / 1000);

  return (
    <CalcCard title="Obat Resusitasi Neonatus" subtitle="Berdasarkan BB lahir" icon="🚨" color="purple">
      <div className="grid grid-cols-1 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="g" />
      </div>
      <CalcButton onClick={() => setShow(true)} color="purple">Tampilkan Dosis Resusitasi</CalcButton>
      {show && (
        <CalcResult color="purple">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 text-muted-foreground font-medium">Obat</th>
                  <th className="text-left py-1.5 text-muted-foreground font-medium">Dosis</th>
                  <th className="text-left py-1.5 text-muted-foreground font-medium">Volume</th>
                  <th className="text-left py-1.5 text-muted-foreground font-medium">Rute</th>
                </tr>
              </thead>
              <tbody>
                {drugs.map((d, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5 font-semibold">{d.drug}</td>
                    <td className="py-1.5">{d.dose} {d.unit}</td>
                    <td className="py-1.5 font-bold">{d.vol} mL</td>
                    <td className="py-1.5 text-muted-foreground">{d.route}<br/>{d.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcResult>
      )}
    </CalcCard>
  );
}
