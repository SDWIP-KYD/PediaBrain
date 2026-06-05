"use client";

import { useState } from "react";
import { CalcCard, CalcResult, InfoBox } from "../../components/calc-ui";

interface LatinEntry {
  singkatan: string;
  latin: string;
  arti: string;
}

const latinAbbreviations: LatinEntry[] = [
  { singkatan: "R/", latin: "recipe", arti: "ambillah / tuliskan resep" },
  { singkatan: "S", latin: "signa", arti: "tandai (aturan pakai untuk pasien)" },
  { singkatan: "m.f.", latin: "misce fac", arti: "campur dan buatlah" },
  { singkatan: "pulv", latin: "pulveres / pulvis", arti: "serbuk terbagi / serbuk" },
  { singkatan: "caps", latin: "capsula", arti: "kapsul" },
  { singkatan: "dtd", latin: "da tales doses", arti: "berikan sebanyak dosis demikian" },
  { singkatan: "no.", latin: "numero", arti: "sebanyak (jumlah)" },
  { singkatan: "fl / fls", latin: "flacon / flask", arti: "botol" },
  { singkatan: "dd", latin: "de die", arti: "per hari (frekuensi)" },
  { singkatan: "cth", latin: "cochlear theae", arti: "sendok teh (5 mL)" },
  { singkatan: "C", latin: "cochlear", arti: "sendok makan (15 mL)" },
  { singkatan: "gtt", latin: "guttae", arti: "tetes" },
  { singkatan: "p.r.n.", latin: "pro re nata", arti: "bila perlu" },
  { singkatan: "a.c.", latin: "ante coenam", arti: "sebelum makan" },
  { singkatan: "p.c.", latin: "post coenam", arti: "sesudah makan" },
  { singkatan: "d.c.", latin: "durante coenam", arti: "saat makan" },
  { singkatan: "o.m.", latin: "omni mane", arti: "tiap pagi" },
  { singkatan: "o.n.", latin: "omni nocte", arti: "tiap malam" },
  { singkatan: "h.s.", latin: "hora somni", arti: "menjelang tidur" },
  { singkatan: "q.s.", latin: "quantum satis", arti: "secukupnya" },
  { singkatan: "u.e.", latin: "usus externus", arti: "pemakaian luar" },
  { singkatan: "u.c.", latin: "usus cognitus", arti: "aturan pakai diketahui" },
  { singkatan: "aa", latin: "ana", arti: "masing-masing sama banyak" },
  { singkatan: "iter", latin: "iteratie / iteretur", arti: "dapat diulang" },
];

export function LatinRef() {
  const [search, setSearch] = useState("");

  const filtered = latinAbbreviations.filter(
    (e) =>
      e.singkatan.toLowerCase().includes(search.toLowerCase()) ||
      e.latin.toLowerCase().includes(search.toLowerCase()) ||
      e.arti.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CalcCard title="Singkatan Latin pada Resep" subtitle="30 istilah umum resep medis" icon="✒️" color="purple">
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Cari Singkatan
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ketik singkatan, nama latin, atau arti..."
            className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neon/30 focus:border-neon/50"
          />
        </div>

        <CalcResult color="purple">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 pr-3 text-muted-foreground font-medium uppercase tracking-wider">Singkatan</th>
                  <th className="text-left py-1.5 pr-3 text-muted-foreground font-medium uppercase tracking-wider">Latin</th>
                  <th className="text-left py-1.5 text-muted-foreground font-medium uppercase tracking-wider">Arti</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-1.5 pr-3 font-mono font-bold text-foreground">{entry.singkatan}</td>
                    <td className="py-1.5 pr-3 italic text-cyan-400">{entry.latin}</td>
                    <td className="py-1.5 text-muted-foreground">{entry.arti}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-muted-foreground">
                      Tidak ada singkatan yang cocok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CalcResult>

        <InfoBox>
          <strong>Catatan:</strong> {latinAbbreviations.length} singkatan Latin tercatat. Singkatan ini digunakan secara internasional dalam penulisan resep medis. Selalu verifikasi dengan farmasi bila ragu.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
