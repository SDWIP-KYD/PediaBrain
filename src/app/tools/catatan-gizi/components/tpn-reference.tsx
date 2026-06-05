"use client";

import { CalcCard, InfoBox } from "../../components/calc-ui";

export function TPNReferenceCalc() {
  return (
    <CalcCard title="Referensi TPN/NP" subtitle="Total Parenteral Nutrition Reference" icon="💉" color="purple">
      <div className="space-y-4">
        {/* Composition Formulas */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">📋 Komposisi Nutrisi Parenteral</p>
          <div className="space-y-2">
            <div className="px-3 py-2 rounded-lg bg-muted/50 border border-border text-xs space-y-1">
              <p><strong className="text-purple-300">Protein:</strong> (1–2) × BB × 1/22 × 4 = <span className="text-blue-300">10–20%</span></p>
              <p><strong className="text-orange-300">Lipid:</strong> (1–3) × BB × 9 = <span className="text-orange-300">20–30%</span></p>
              <p><strong className="text-emerald-300">Karbohidrat:</strong> 100 – Protein – Lipid = <span className="text-emerald-300">50–60%</span></p>
              <p><strong className="text-blue-300">Energi NP:</strong> Total kalori – kalori Schofield &gt; 60%</p>
              <p><strong className="text-amber-300">Balance N:</strong> 150–250 mg N/kgBB/hari</p>
            </div>
          </div>
        </div>

        {/* GIR Formula */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">🍬 GIR Formula</p>
          <div className="px-3 py-2 rounded-lg bg-muted/50 border-l-3 border-l-purple-500 border border-border font-mono text-xs text-purple-300">
            GIR = 0.167 × Dextrose% × Rate (mL/jam) ÷ BB (kg)
          </div>
          <InfoBox>
            <strong>Target GIR:</strong> 4–6 mg/kgBB/menit. Maks tanpa CVC: 12.5% dextrose
          </InfoBox>
        </div>

        {/* Osmolarity Rules */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">⚗️ Osmolaritas Rules</p>
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-2 text-muted-foreground">Akses Vena</th>
                  <th className="text-left py-1.5 px-2 text-muted-foreground">Max Osmolaritas</th>
                  <th className="text-left py-1.5 px-2 text-muted-foreground">Max Dextrose</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-1.5 px-2">Vena Perifer</td>
                  <td className="py-1.5 px-2 font-mono text-amber-300">900 mOsm</td>
                  <td className="py-1.5 px-2 font-mono text-amber-300">12.5%</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-1.5 px-2">Vena Dalam (CVC)</td>
                  <td className="py-1.5 px-2 font-mono text-emerald-300">1600 mOsm</td>
                  <td className="py-1.5 px-2 font-mono text-emerald-300">25%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ReSoMal */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">💊 Kandungan ReSoMal per Liter</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="px-3 py-2 rounded-lg bg-muted/50 border border-border text-center">
              <p className="text-[10px] text-muted-foreground mb-1">Natrium</p>
              <p className="text-sm font-bold font-mono text-purple-300">37.5 mmol</p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-muted/50 border border-border text-center">
              <p className="text-[10px] text-muted-foreground mb-1">Kalium</p>
              <p className="text-sm font-bold font-mono text-emerald-300">40 mmol</p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-muted/50 border border-border text-center">
              <p className="text-[10px] text-muted-foreground mb-1">Magnesium</p>
              <p className="text-sm font-bold font-mono text-blue-300">3 mmol</p>
            </div>
          </div>
        </div>

        {/* Example Calculation */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">📊 Contoh NP (BB 12.2 kg)</p>
          <div className="space-y-1.5">
            <div className="px-3 py-1.5 rounded bg-muted/50 border border-border font-mono text-xs text-purple-300">
              Protein = 1.7 × 12.2 × 1/22 × 4 ≈ 18 g (≈ 18%)
            </div>
            <div className="px-3 py-1.5 rounded bg-muted/50 border border-border font-mono text-xs text-orange-300">
              Lipid = 1 × 12.2 × 9 ≈ 110 kkal (≈ 26%)
            </div>
            <div className="px-3 py-1.5 rounded bg-muted/50 border border-border font-mono text-xs text-emerald-300">
              KH = 100 – 18 – 26 ≈ 56%
            </div>
          </div>
        </div>
      </div>
    </CalcCard>
  );
}
