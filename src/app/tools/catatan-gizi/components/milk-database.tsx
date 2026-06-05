"use client";

import { useState } from "react";
import { CalcCard, CalcSelect, InfoBox } from "../../components/calc-ui";

interface MilkItem {
  name: string;
  age: string;
  kal: string;
  grup: string;
  takaran: string;
}

const milkData: MilkItem[] = [
  { name: "SGM BBLR", age: "BBLR", kal: "0.8", grup: "SGM", takaran: "80 kkal/100ml" },
  { name: "SGM Ananda", age: "0-6 bln", kal: "0.65", grup: "SGM", takaran: "65 kkal/100ml" },
  { name: "SGM Ananda", age: "6-12 bln", kal: "0.67", grup: "SGM", takaran: "67 kkal/100ml" },
  { name: "SGM Eksplor", age: "1-3 thn", kal: "0.75", grup: "SGM", takaran: "150 kkal/200ml" },
  { name: "SGM Eksplor", age: "3-5 thn", kal: "0.8", grup: "SGM", takaran: "160 kkal/200ml" },
  { name: "SGM Eksplor", age: "5-12 thn", kal: "0.9", grup: "SGM", takaran: "160 kkal/170ml" },
  { name: "SGM Ananda PHPro", age: "0-6 bln", kal: "0.66", grup: "SGM", takaran: "66 kkal/100ml" },
  { name: "SGM Ananda PHPro", age: "6-12 bln", kal: "0.66", grup: "SGM", takaran: "66 kkal/100ml" },
  { name: "SGM Eksplor PHPro", age: "1-3 thn", kal: "0.75", grup: "SGM", takaran: "150 kkal/200ml" },
  { name: "SGM Ananda Soya", age: "0-6 bln", kal: "0.66", grup: "SGM", takaran: "66 kkal/100ml" },
  { name: "SGM Ananda Soya", age: "6-12 bln", kal: "0.65", grup: "SGM", takaran: "65 kkal/100ml" },
  { name: "SGM Eksplor Soya", age: "1-5 thn", kal: "0.85", grup: "SGM", takaran: "170 kkal/200ml" },
  { name: "SGM Digesmill", age: "1-3 thn", kal: "0.75", grup: "SGM", takaran: "150 kkal/200ml" },
  { name: "Lactogen 1", age: "0-6 bln", kal: "0.67", grup: "LACTOGEN", takaran: "67 kkal/100ml" },
  { name: "Lactogen 2", age: "6-12 bln", kal: "0.7", grup: "LACTOGEN", takaran: "160 kkal/230ml" },
  { name: "Lactogrow 3", age: "1-3 thn", kal: "0.84", grup: "LACTOGEN", takaran: "160 kkal/190ml" },
  { name: "Lactogrow 4", age: "3-5 thn", kal: "0.84", grup: "LACTOGEN", takaran: "160 kkal/190ml" },
  { name: "Nutribaby 1", age: "0-6 bln", kal: "0.65", grup: "NUTRICIA", takaran: "65 kkal/100ml" },
  { name: "Nutribaby 2", age: "6-12 bln", kal: "0.65", grup: "NUTRICIA", takaran: "130 kkal/200ml" },
  { name: "Nutrilon 3", age: "1-3 thn", kal: "0.78", grup: "NUTRICIA", takaran: "180 kkal/230ml" },
  { name: "Nutrilon 4", age: "3-5 thn", kal: "0.79", grup: "NUTRICIA", takaran: "185 kkal/235ml" },
  { name: "Nutribaby Royal 1", age: "0-6 bln", kal: "0.65", grup: "NUTRICIA", takaran: "65 kkal/100ml" },
  { name: "Nutribaby Royal 2", age: "6-12 bln", kal: "0.7", grup: "NUTRICIA", takaran: "140 kkal/200ml" },
  { name: "Nutrilon Royal 3", age: "1-3 thn", kal: "0.78", grup: "NUTRICIA", takaran: "180 kkal/230ml" },
  { name: "Nutrilon Royal 4", age: "3-5 thn", kal: "0.81", grup: "NUTRICIA", takaran: "190 kkal/235ml" },
  { name: "Bebelove 1", age: "0-6 bln", kal: "0.66", grup: "NUTRICIA", takaran: "66 kkal/100ml" },
  { name: "Bebelove 2", age: "6-12 bln", kal: "0.7", grup: "NUTRICIA", takaran: "140 kkal/200ml" },
  { name: "Bebelac 3", age: "1-3 thn", kal: "0.77", grup: "NUTRICIA", takaran: "180 kkal/235ml" },
  { name: "Bebelac 4", age: "3-5 thn", kal: "0.77", grup: "NUTRICIA", takaran: "180 kkal/235ml" },
  { name: "Danstart 1", age: "0-6 bln", kal: "0.67", grup: "NESTLE", takaran: "67 kkal/100ml" },
  { name: "Danstart 2", age: "6-12 bln", kal: "0.7", grup: "NESTLE", takaran: "140 kkal/200ml" },
  { name: "Dancow 3", age: "1-3 thn", kal: "0.84", grup: "NESTLE", takaran: "160 kkal/190ml" },
  { name: "Dancow 4", age: "3-5 thn", kal: "0.85", grup: "NESTLE", takaran: "170 kkal/200ml" },
  { name: "Dancow 5", age: "5-12 thn", kal: "0.97", grup: "NESTLE", takaran: "180 kkal/185ml" },
  { name: "Batita", age: "1-3 thn", kal: "0.8", grup: "NESTLE", takaran: "160 kkal/200ml" },
  { name: "Datita", age: "3-5 thn", kal: "0.8", grup: "NESTLE", takaran: "160 kkal/200ml" },
  { name: "Datita", age: "5-12 thn", kal: "0.75", grup: "NESTLE", takaran: "150 kkal/200ml" },
  { name: "NAN 1", age: "0-6 bln", kal: "0.67", grup: "NESTLE", takaran: "67 kkal/100ml" },
  { name: "NAN 2", age: "6-12 bln", kal: "0.69", grup: "NESTLE", takaran: "160 kkal/230ml" },
  { name: "NAN 3", age: "1-3 thn", kal: "0.65", grup: "NESTLE", takaran: "150 kkal/230ml" },
  { name: "Jelajah", age: "1-3 thn", kal: "0.85", grup: "FRISIAN FLAG", takaran: "170 kkal/200ml" },
  { name: "Karya", age: "3-5 thn", kal: "0.9", grup: "FRISIAN FLAG", takaran: "180 kkal/200ml" },
  { name: "BMT", age: "0-6 bln", kal: "0.67", grup: "MORINAGA", takaran: "67 kkal/100ml" },
  { name: "Chil-mil", age: "1-3 thn", kal: "0.64", grup: "MORINAGA", takaran: "140 kkal/220ml" },
  { name: "Chil-kid", age: "3-5 thn", kal: "0.75", grup: "MORINAGA", takaran: "150 kkal/200ml" },
  { name: "Chil-school", age: "5-12 thn", kal: "1.0", grup: "MORINAGA", takaran: "200 kkal/200ml" },
  { name: "Infatrini", age: "BBLR/Prematur", kal: "1.0", grup: "khusus", takaran: "1 sdt = 25ml" },
  { name: "Pediasure", age: "1-10 thn", kal: "0.84", grup: "khusus", takaran: "4 sdt + 190ml" },
  { name: "Pediacomplete", age: "1-10 thn", kal: "1.0", grup: "khusus", takaran: "5 sdt + 190ml" },
  { name: "Ensure", age: ">10 thn", kal: "1.0", grup: "khusus", takaran: "1 sdt = 50ml" },
  { name: "Goldsure", age: ">10 thn", kal: "1.0", grup: "khusus", takaran: "6 sdt + 185ml" },
  { name: "Pregestimil", age: "Alergi/Malabsorpsi", kal: "0.67", grup: "khusus", takaran: "30ml + 1 sdt" },
  { name: "Neocate", age: "Alergi berat", kal: "0.67", grup: "khusus", takaran: "30ml + 1 sdt" },
  { name: "F75", age: "Gizi Buruk Stabilisasi", kal: "0.75", grup: "khusus", takaran: "Per 1000ml" },
  { name: "F100", age: "Gizi Buruk Transisi", kal: "1.0", grup: "khusus", takaran: "Per 1000ml" },
];

const filters = [
  { value: "semua", label: "Semua" },
  { value: "SGM", label: "SGM" },
  { value: "LACTOGEN", label: "Lactogen" },
  { value: "NUTRICIA", label: "Nutricia" },
  { value: "NESTLE", label: "Nestle" },
  { value: "FRISIAN FLAG", label: "Frisian Flag" },
  { value: "MORINAGA", label: "Morinaga" },
  { value: "khusus", label: "Formula Khusus" },
];

export function MilkDatabaseCalc() {
  const [filter, setFilter] = useState("semua");
  const filtered = filter === "semua" ? milkData : milkData.filter((m) => m.grup === filter);

  return (
    <CalcCard title="Database Susu Formula" subtitle="46+ produk Indonesia" icon="🥛" color="blue">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${
              filter === f.value
                ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="max-h-[400px] overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-2 text-muted-foreground font-medium">Merk Susu</th>
              <th className="text-left py-2 px-2 text-muted-foreground font-medium">Usia</th>
              <th className="text-left py-2 px-2 text-muted-foreground font-medium">Takaran</th>
              <th className="text-right py-2 px-2 text-muted-foreground font-medium">Kalori/cc</th>
              <th className="text-left py-2 px-2 text-muted-foreground font-medium">Grup</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => {
              const kal = parseFloat(m.kal);
              const kalColor = kal >= 1.0 ? "text-emerald-400" : kal >= 0.8 ? "text-amber-400" : "text-blue-300";
              return (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-1.5 px-2 font-medium">{m.name}</td>
                  <td className="py-1.5 px-2 text-muted-foreground">{m.age}</td>
                  <td className="py-1.5 px-2 text-muted-foreground font-mono">{m.takaran}</td>
                  <td className={`py-1.5 px-2 text-right font-mono font-bold ${kalColor}`}>{m.kal}</td>
                  <td className="py-1.5 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      m.grup === "khusus" ? "bg-red-500/15 text-red-300" :
                      m.grup === "SGM" ? "bg-blue-500/15 text-blue-300" :
                      "bg-emerald-500/15 text-emerald-300"
                    }`}>
                      {m.grup}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Susu Sering Digunakan */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">⭐ Susu Sering Digunakan</p>
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 px-2 text-muted-foreground">Susu</th>
                  <th className="text-left py-1.5 px-2 text-muted-foreground">Takaran</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Infatrini", takaran: "1 sdt = 25 ml air" },
                  { name: "SGM Gain 100", takaran: "1 sdt = 20 ml air" },
                  { name: "SGM Optigrow", takaran: "1 sdt = 45 ml air" },
                  { name: "Pediacomplete", takaran: "1 sdt = 40 ml air" },
                  { name: "Pediasure", takaran: "1 sdt = 50 ml air" },
                  { name: "Goldsure", takaran: "1 sdt = 30 ml air" },
                  { name: "Chilkid Platinum", takaran: "1 sdt = 35 ml air" },
                  { name: "Morigro", takaran: "1 sdt = 35 ml air" },
                ].map((s, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1 px-2 font-medium">{s.name}</td>
                    <td className="py-1 px-2 font-mono text-blue-300">{s.takaran}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">🎯 Rekomendasi per Usia</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/50 text-xs">
              <span>👶 &lt; 1 tahun</span>
              <div className="flex gap-1">
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-300">SGM Ananda</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-300">Lactogen</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-300">Infatrini</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-500/15 text-orange-300">Pregestimil</span>
              </div>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/50 text-xs">
              <span>🧒 1–10 tahun</span>
              <div className="flex gap-1">
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300">Pediasure</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300">Pediacomplete</span>
              </div>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/50 text-xs">
              <span>🧑 &gt; 10 tahun</span>
              <div className="flex gap-1">
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-300">Ensure</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-300">Goldsure</span>
              </div>
            </div>
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/50 text-xs">
              <span>🚨 Gizi Buruk</span>
              <div className="flex gap-1">
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/15 text-red-300">F75</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/15 text-red-300">F100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SGM Optigrow kandungan */}
      <div className="mt-3">
        <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-2">SGM Optigrow / 100g</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="px-3 py-1.5 rounded bg-muted/50 border border-border font-mono text-xs text-blue-300">Protein: 12.2 g</div>
          <div className="px-3 py-1.5 rounded bg-muted/50 border border-border font-mono text-xs text-blue-300">Na: 149 mg</div>
          <div className="px-3 py-1.5 rounded bg-muted/50 border border-border font-mono text-xs text-emerald-300">K: 466 mg</div>
          <div className="px-3 py-1.5 rounded bg-muted/50 border border-border font-mono text-xs text-orange-300">P: 264 mg</div>
        </div>
      </div>
    </CalcCard>
  );
}
