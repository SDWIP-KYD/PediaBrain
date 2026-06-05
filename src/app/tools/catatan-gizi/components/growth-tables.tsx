"use client";

import { CalcCard, InfoBox } from "../../components/calc-ui";

const growthData = [
  { usia: "0–3 bln", bbHarian: "30", bbBulanan: "900", tb: "3.5", lk: "1.0", rda: "115" },
  { usia: "3–6 bln", bbHarian: "20", bbBulanan: "600", tb: "2.0", lk: "1.0", rda: "110" },
  { usia: "6–9 bln", bbHarian: "15", bbBulanan: "450", tb: "1.5", lk: "0.5", rda: "100" },
  { usia: "9–12 bln", bbHarian: "12", bbBulanan: "360", tb: "1.2", lk: "0.5", rda: "100" },
  { usia: "1–3 thn", bbHarian: "8", bbBulanan: "240", tb: "1.0", lk: "0.25", rda: "100" },
  { usia: "4–6 thn", bbHarian: "6", bbBulanan: "180", tb: "0.5", lk: "0.25", rda: "90–100" },
];

const rdaData = [
  { usia: "0–1 tahun", laki: "110–120", perempuan: "110–120" },
  { usia: "1–3 tahun", laki: "100", perempuan: "100" },
  { usia: "4–6 tahun", laki: "90", perempuan: "90" },
  { usia: "7–9 tahun", laki: "80", perempuan: "80" },
  { usia: "10–12 tahun", laki: "70", perempuan: "60" },
  { usia: "13–15 tahun", laki: "60", perempuan: "50" },
  { usia: "15–18 tahun", laki: "50–70", perempuan: "40–65" },
];

const fluidData = [
  { usia: "0–3 hari", kebutuhan: "80–100" },
  { usia: "3–7 hari", kebutuhan: "120–150" },
  { usia: "1–3 bulan", kebutuhan: "140–160" },
  { usia: "3–6 bulan", kebutuhan: "130–155" },
  { usia: "6–9 bulan", kebutuhan: "120–135" },
  { usia: "9–12 bulan", kebutuhan: "115–125" },
  { usia: "1–2 tahun", kebutuhan: "110–125" },
  { usia: "2–5 tahun", kebutuhan: "100–110" },
  { usia: "5–10 tahun", kebutuhan: "80–90" },
  { usia: "10–13 tahun", kebutuhan: "70–85" },
  { usia: ">13 tahun", kebutuhan: "40–60" },
];

export function GrowthTablesCalc() {
  return (
    <CalcCard title="Tabel Pertumbuhan & Kebutuhan" subtitle="Growth Charts" icon="📈" color="orange">
      <div className="space-y-4">
        {/* BB Target Table */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">⚖️ Target Kenaikan BB Normal</p>
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-2 text-muted-foreground">Usia</th>
                  <th className="text-left py-1.5 px-2 text-muted-foreground">per Hari</th>
                  <th className="text-left py-1.5 px-2 text-muted-foreground">per Bulan</th>
                </tr>
              </thead>
              <tbody>
                {growthData.map((d, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1 px-2">{d.usia}</td>
                    <td className="py-1 px-2 font-mono text-blue-300">{d.bbHarian} g</td>
                    <td className="py-1 px-2 font-mono text-emerald-300">{d.bbBulanan} g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RDA Table */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">⚡ RDA — Kebutuhan Energi (kkal/kg/hari)</p>
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-2 text-muted-foreground">Usia</th>
                  <th className="text-left py-1.5 px-2 text-muted-foreground">Laki-laki</th>
                  <th className="text-left py-1.5 px-2 text-muted-foreground">Perempuan</th>
                </tr>
              </thead>
              <tbody>
                {rdaData.map((d, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1 px-2">{d.usia}</td>
                    <td className="py-1 px-2 font-mono text-amber-300">{d.laki}</td>
                    <td className="py-1 px-2 font-mono text-amber-300">{d.perempuan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fluid Needs */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">💧 Kebutuhan Cairan (mL/kgBB/hari)</p>
          <div className="grid grid-cols-2 gap-3">
            {fluidData.map((d, i) => (
              <div key={i} className="flex justify-between items-center px-2 py-1 border-b border-border/50 text-xs">
                <span>{d.usia}</span>
                <span className="font-mono text-blue-300">{d.kebutuhan}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabel Pertumbuhan Lengkap */}
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">📊 Tabel Pertumbuhan Lengkap</p>
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-2 text-muted-foreground">Usia</th>
                  <th className="text-left py-1.5 px-2 text-muted-foreground">BB Harian (g)</th>
                  <th className="text-left py-1.5 px-2 text-muted-foreground">BB Bulanan (g)</th>
                  <th className="text-left py-1.5 px-2 text-muted-foreground">TB (cm/bln)</th>
                  <th className="text-left py-1.5 px-2 text-muted-foreground">LK (cm/bln)</th>
                  <th className="text-left py-1.5 px-2 text-muted-foreground">RDA</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { usia: "0–3 bln", bbHarian: "30", bbBulanan: "900", tb: "3.5", lk: "1.0", rda: "115" },
                  { usia: "3–6 bln", bbHarian: "20", bbBulanan: "600", tb: "2.0", lk: "1.0", rda: "110" },
                  { usia: "6–9 bln", bbHarian: "15", bbBulanan: "450", tb: "1.5", lk: "0.5", rda: "100" },
                  { usia: "9–12 bln", bbHarian: "12", bbBulanan: "360", tb: "1.2", lk: "0.5", rda: "100" },
                  { usia: "1–3 thn", bbHarian: "8", bbBulanan: "240", tb: "1.0", lk: "0.25", rda: "100" },
                  { usia: "4–6 thn", bbHarian: "6", bbBulanan: "180", tb: "0.5", lk: "0.25", rda: "90–100" },
                ].map((d, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1 px-2">{d.usia}</td>
                    <td className="py-1 px-2 font-mono text-blue-300">{d.bbHarian}</td>
                    <td className="py-1 px-2 font-mono text-blue-300">{d.bbBulanan}</td>
                    <td className="py-1 px-2 font-mono text-blue-300">{d.tb}</td>
                    <td className="py-1 px-2 font-mono text-blue-300">{d.lk}</td>
                    <td className="py-1 px-2 font-mono text-amber-300">{d.rda}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CalcCard>
  );
}
