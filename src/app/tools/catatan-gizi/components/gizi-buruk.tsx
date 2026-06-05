"use client";

import { CalcCard, InfoBox } from "../../components/calc-ui";

export function GiziBurukCalc() {
  return (
    <CalcCard title="Manajemen Gizi Buruk" subtitle="Severe Malnutrition Management" icon="🚨" color="red">
      <div className="space-y-4">
        {/* Status Antropometri */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">📊 Klasifikasi Status Gizi (BB/TB)</p>
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-2 text-muted-foreground">Status Gizi</th>
                  <th className="text-left py-1.5 px-2 text-muted-foreground">Z-Score</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-1 px-2">Gizi Lebih</td>
                  <td className="py-1 px-2 font-mono text-blue-300">&gt; +2 SD</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-1 px-2">Gizi Baik</td>
                  <td className="py-1 px-2 font-mono text-emerald-300">-2 SD s/d +2 SD</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-1 px-2 text-amber-300">Gizi Kurang</td>
                  <td className="py-1 px-2 font-mono text-amber-300">≥ -3 SD s/d &lt; -2 SD</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-1 px-2 font-bold text-red-400">Gizi Buruk</td>
                  <td className="py-1 px-2 font-mono font-bold text-red-400">&lt; -3 SD</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Penilaian Kenaikan BB */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">⚖️ Penilaian Kenaikan BB</p>
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-2 text-muted-foreground">Kategori</th>
                  <th className="text-left py-1.5 px-2 text-muted-foreground">Kenaikan BB</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-1 px-2 text-red-400">Kurang</td>
                  <td className="py-1 px-2 font-mono text-red-400">&lt; 5 g/kg/hari</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-1 px-2 text-amber-300">Cukup</td>
                  <td className="py-1 px-2 font-mono text-amber-300">5–10 g/kg/hari</td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-1 px-2 text-emerald-400">Baik</td>
                  <td className="py-1 px-2 font-mono text-emerald-400">&gt; 10 g/kg/hari</td>
                </tr>
              </tbody>
            </table>
          </div>
          <InfoBox>
            <strong>Contoh:</strong> Bayi 10 bln, BB 6.0→6.4 kg setelah 14 hari. Kenaikan 400g, rata-rata BB 6.2 kg = 400/(6.2×14) = <strong className="text-orange-300">4.6 g/kg/hari → Kurang</strong>
          </InfoBox>
        </div>

        {/* Fase Tatalaksana */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">🏥 Fase Tatalaksana (WHO Protocol)</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg p-3 border border-red-500/30 bg-red-500/5">
              <p className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-2">S — Stabilisasi</p>
              <p className="text-xl font-bold font-mono text-red-400 mb-1">80–100</p>
              <p className="text-[10px] text-muted-foreground mb-2">kkal/kgBB/hari (BBA)</p>
              <div className="space-y-0.5 text-[11px] text-muted-foreground">
                <p>Hari 1–2</p>
                <p>Formula: <strong className="text-red-300">F75</strong></p>
                <p>Protein: 1–1.5 g/kg/hari</p>
                <p>Cairan: 130 ml/kg/hari</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">PNC: 50% × RDA × BBI</p>
              </div>
            </div>
            <div className="rounded-lg p-3 border border-amber-500/30 bg-amber-500/5">
              <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2">T — Transisi</p>
              <p className="text-xl font-bold font-mono text-amber-300 mb-1">100–150</p>
              <p className="text-[10px] text-muted-foreground mb-2">kkal/kgBB/hari (BBA)</p>
              <div className="space-y-0.5 text-[11px] text-muted-foreground">
                <p>Hari 3+</p>
                <p>Formula: <strong className="text-amber-300">F100</strong></p>
                <p>Protein: 1–3 g/kg/hari</p>
                <p>Cairan: 150 ml/kg/hari</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">PNC: 75% × RDA × BBI</p>
              </div>
            </div>
            <div className="rounded-lg p-3 border border-emerald-500/30 bg-emerald-500/5">
              <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2">R — Rehabilitasi</p>
              <p className="text-xl font-bold font-mono text-emerald-400 mb-1">150–220</p>
              <p className="text-[10px] text-muted-foreground mb-2">kkal/kgBB/hari (BBA)</p>
              <div className="space-y-0.5 text-[11px] text-muted-foreground">
                <p>Fase lanjut</p>
                <p>Formula: <strong className="text-emerald-300">F100 / RUTF</strong></p>
                <p>Protein: 4–6 g/kg/hari</p>
                <p>Cairan: 150–200 ml/kg/hari</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1">PNC: 100% × RDA × BBI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Komposisi Formula */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">🧪 Komposisi Formula per 100 mL</p>
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1.5 px-2 text-muted-foreground">Bahan</th>
                    <th className="text-left py-1.5 px-2 text-muted-foreground">F75</th>
                    <th className="text-left py-1.5 px-2 text-muted-foreground">F100</th>
                    <th className="text-left py-1.5 px-2 text-muted-foreground">F135</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-1 px-2">Susu skim</td>
                    <td className="py-1 px-2 font-mono text-blue-300">25 g</td>
                    <td className="py-1 px-2 font-mono text-blue-300">85 g</td>
                    <td className="py-1 px-2 font-mono text-blue-300">95 g</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-1 px-2">Gula pasir</td>
                    <td className="py-1 px-2 font-mono text-blue-300">70 g</td>
                    <td className="py-1 px-2 font-mono text-blue-300">50 g</td>
                    <td className="py-1 px-2 font-mono text-blue-300">65 g</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-1 px-2">Minyak</td>
                    <td className="py-1 px-2 font-mono text-blue-300">30 mL</td>
                    <td className="py-1 px-2 font-mono text-blue-300">60 mL</td>
                    <td className="py-1 px-2 font-mono text-blue-300">75 mL</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-1 px-2">Mineral mix</td>
                    <td className="py-1 px-2 font-mono text-blue-300">20 mL</td>
                    <td className="py-1 px-2 font-mono text-blue-300">20 mL</td>
                    <td className="py-1 px-2 font-mono text-blue-300">27 mL</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">📈 Nilai Gizi per 1000 mL</p>
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1.5 px-2 text-muted-foreground">Zat Gizi</th>
                    <th className="text-left py-1.5 px-2 text-muted-foreground">F75</th>
                    <th className="text-left py-1.5 px-2 text-muted-foreground">F100</th>
                    <th className="text-left py-1.5 px-2 text-muted-foreground">F135</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-1 px-2">Energi (kkal)</td>
                    <td className="py-1 px-2 font-mono text-blue-300">75</td>
                    <td className="py-1 px-2 font-mono text-blue-300">100</td>
                    <td className="py-1 px-2 font-mono text-blue-300">135</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-1 px-2">Protein (g)</td>
                    <td className="py-1 px-2 font-mono text-blue-300">0.9</td>
                    <td className="py-1 px-2 font-mono text-blue-300">2.9</td>
                    <td className="py-1 px-2 font-mono text-blue-300">3.3</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-1 px-2">Laktosa (g)</td>
                    <td className="py-1 px-2 font-mono text-blue-300">1.3</td>
                    <td className="py-1 px-2 font-mono text-blue-300">4.2</td>
                    <td className="py-1 px-2 font-mono text-blue-300">5.3</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-1 px-2">Kalium (mmol)</td>
                    <td className="py-1 px-2 font-mono text-blue-300">36</td>
                    <td className="py-1 px-2 font-mono text-blue-300">49</td>
                    <td className="py-1 px-2 font-mono text-blue-300">63</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-1 px-2">Natrium (mmol)</td>
                    <td className="py-1 px-2 font-mono text-blue-300">6.9</td>
                    <td className="py-1 px-2 font-mono text-blue-300">7.5</td>
                    <td className="py-1 px-2 font-mono text-blue-300">8.2</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-1 px-2">Osmolality</td>
                    <td className="py-1 px-2 font-mono text-blue-300">413</td>
                    <td className="py-1 px-2 font-mono text-blue-300">419</td>
                    <td className="py-1 px-2 font-mono text-blue-300">508</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Contoh Kasus */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">📝 Contoh Kasus: Pengentalan Susu</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Data Pasien</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-1 shrink-0">▸</span>BB: 4.6 kg | BBI: 6.4 kg | TB: 62 cm</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-1 shrink-0">▸</span>WA: 1 bln 15 hr | HA: 4 bln | CA: 11 bln</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-1 shrink-0">▸</span>Status: BB/U &lt;-3SD, TB/U &lt;-3SD, BB/TB &lt;-3SD</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 mt-1 shrink-0">▸</span>Assessment: Stunting + Nutritional Marasmus</li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Terapi</p>
              <div className="space-y-1.5">
                <div className="px-3 py-1.5 rounded bg-muted/50 border border-border font-mono text-xs text-blue-300">
                  BBI × RDA = 6.4 × 120 = 768 kkal
                </div>
                <div className="px-3 py-1.5 rounded bg-muted/50 border border-border font-mono text-xs text-orange-300">
                  BBA × 150–220 = 690–1012 kkal
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground mt-2">
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-1 shrink-0">▸</span>Kemampuan: 8 × 45 ml SGM Optigrow = 360 kkal ⚠️</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-1 shrink-0">▸</span>Pengentalan: +1 takar/45ml → +8 takar/hari</li>
                  <li className="flex items-start gap-2"><span className="text-emerald-400 mt-1 shrink-0">▸</span>Kalori akhir: 360 + (8×45) = <strong className="text-emerald-300">720 kkal ✓</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CalcCard>
  );
}
