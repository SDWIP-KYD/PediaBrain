"use client";

import { CalcCard, InfoBox } from "../../components/calc-ui";

export function FormulaRumusCalc() {
  return (
    <CalcCard title="Formula & Rumus Klinis" subtitle="Quick Reference" icon="📐" color="orange">
      <div className="space-y-4">
        {/* Rumus Kebutuhan Kalori */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">⚡ Rumus Kebutuhan Kalori</p>
            <div className="space-y-1.5">
              <div className="px-3 py-2 rounded-lg bg-muted/50 border border-border text-xs space-y-1">
                <p><strong className="text-blue-300">Normal:</strong> BBI × RDA = kebutuhan kkal/hari</p>
                <p><strong className="text-red-300">Gizi Buruk (WHO):</strong> BBA × 80–220 kkal/kg/hr</p>
                <p><strong className="text-amber-300">Obesitas:</strong> BBI × RDA – 30%</p>
              </div>
              <div className="mt-2">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Rumus BBI per Usia</p>
                <div className="px-3 py-2 rounded-lg bg-muted/50 border-l-3 border-l-blue-500 border border-border font-mono text-xs text-blue-300">
                  Bayi: BBI = (usia bln + 9) / 2<br />
                  1–6 thn: BBI = (usia thn × 2) + 8<br />
                  7–12 thn: BBI = (usia thn × 7 – 5) / 2
                </div>
              </div>
              <InfoBox>
                <strong className="text-amber-300">⚠️ Obesitas:</strong> Target penurunan BB 500 g/bulan (≈ 2 kg/4 bulan)
              </InfoBox>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">🍼 Konversi Kalori</p>
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1.5 px-2 text-muted-foreground">Jenis</th>
                    <th className="text-left py-1.5 px-2 text-muted-foreground">Nilai Energi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-1 px-2">Bubur saring</td>
                    <td className="py-1 px-2 font-mono text-blue-300">1.49 kkal/cc</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-1 px-2">Jus</td>
                    <td className="py-1 px-2 font-mono text-blue-300">0.5–1.5 kkal/cc</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-1 px-2">Diet lunak</td>
                    <td className="py-1 px-2 font-mono text-blue-300">1700–2100 kkal/hari</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Formula Daging Ayam (per 205 g bahan)</p>
              <ul className="space-y-0.5 text-[11px] text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5 shrink-0">▸</span>Beras tepung 50g: 176 kkal, protein 3.4g</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5 shrink-0">▸</span>Daging ayam segar 50g: 47.5 kkal, protein 9g</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5 shrink-0">▸</span>Gula pasir 25g: 94 kkal</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5 shrink-0">▸</span>Minyak kacang 25g: 45 kkal, lemak 5g</li>
              </ul>
            </div>
          </div>
        </div>

        {/* BMI, Tingkat BB, PRSL */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">📊 BMI & Status Gizi</p>
            <div className="px-3 py-2 rounded-lg bg-muted/50 border-l-3 border-l-blue-500 border border-border font-mono text-xs text-blue-300 mb-2">
              BMI = BB (kg) / TB² (m)
            </div>
            <ul className="space-y-0.5 text-xs">
              <li className="text-red-400">Gizi Buruk &lt; -3 SD</li>
              <li className="text-amber-300">Gizi Kurang: ≥-3 s/d &lt;-2 SD</li>
              <li className="text-emerald-400">Gizi Baik: -2 s/d +2 SD</li>
              <li className="text-orange-300">Gizi Lebih/Obes &gt; +2 SD</li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">🔢 Tingkat Kenaikan BB (Normal)</p>
            <ul className="space-y-0.5 text-xs text-muted-foreground">
              <li>Tingkat I: 25–30 g/hari</li>
              <li>Tingkat II: 20 g/hari</li>
              <li>Tingkat III: 15 g/hari</li>
              <li>Tingkat IV: 8–10 g/hari</li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">🧂 SGM Optigrow: PRSL</p>
            <div className="px-3 py-2 rounded-lg bg-muted/50 border border-border font-mono text-xs text-blue-300 leading-relaxed">
              PRSL = N/28 + Na/23<br />
              + K/39 + Cl/23 + P/31
            </div>
            <InfoBox>
              Hasil contoh: <strong className="text-emerald-300">138.2 mOsm/L</strong><br />
              <span className="text-emerald-300">✓ Aman (&lt; 261 mOsm/L)</span>
            </InfoBox>
          </div>
        </div>
      </div>
    </CalcCard>
  );
}
