"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, InfoBox } from "../../components/calc-ui";

export function DehidrasiAssessmentCalc() {
  const [w, setW] = useState(20);
  const [deg, setDeg] = useState("mod");
  const [type, setType] = useState("iso");

  const pctMap: Record<string, number> = { mild: 4, mod: 7, sev: 10 };
  const pct = pctMap[deg];
  const deficit = Math.round(w * pct * 10);
  const bolus = deg === "sev" ? Math.round(20 * w) : deg === "mod" ? Math.round(10 * w) : 0;
  const maintenance = Math.round(w <= 10 ? 100 * w : w <= 20 ? 1000 + (w - 10) * 50 : 1500 + (w - 20) * 20);
  const replace = Math.round(deficit - bolus);
  const total24 = Math.round(replace + maintenance);

  const recs: Record<string, string> = {
    iso: `Dehidrasi Isotonik — ${deg.toUpperCase()} (${pct}%)\n💧 Defisit: ${deficit} mL | Bolus awal: ${bolus} mL NS 0.9% dalam 15–30 mnt\n📊 Sisa defisit (${replace} mL) + Maintenance (${maintenance} mL) = ${total24} mL dalam 24 jam\n💉 Cairan: NS 0.9% + 20 mEq/L KCl setelah kencing`,
    hypo: `Dehidrasi Hipotonik (Na <130)\n⚠️ Koreksi Na HATI-HATI. Maks naik 8–10 mEq/L/hari.\nBolus: ${bolus} mL NS 0.9% → lanjut NS 0.9% sampai Na normal\nPantau Na tiap 4–6 jam selama koreksi`,
    hyper: `Dehidrasi Hipertonik (Na >150)\n⚠️ Koreksi SANGAT LAMBAT. Turunkan Na maks 0.5 mEq/L/jam (max 10 mEq/L/hari).\nBolus awal: ${bolus} mL NS 0.9% → lanjut D5 NS 0.45%\nRehidrasi selama 48–72 jam! Monitor EKG (hipokalemia)`,
  };

  return (
    <CalcCard title="Dehidrasi — Penilaian & Rehidrasi" subtitle="Volume resusitasi berdasarkan derajat" icon="🏜️" color="orange">
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <CalcInput label="BB aktual (kg)" unit="kg" value={w} onChange={(v) => setW(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} />
          <CalcSelect label="Derajat Dehidrasi" value={deg} onChange={setDeg} options={[
            { value: "mild", label: "Ringan (3–5%)" },
            { value: "mod", label: "Sedang (6–9%)" },
            { value: "sev", label: "Berat (≥10%)" },
          ]} />
          <CalcSelect label="Jenis Dehidrasi" value={type} onChange={setType} options={[
            { value: "iso", label: "Isotonik (Na 130–150)" },
            { value: "hypo", label: "Hipotonik (Na <130)" },
            { value: "hyper", label: "Hipertonik (Na >150)" },
          ]} />
        </div>
        <CalcResult color="orange">
          <div className="whitespace-pre-line text-xs leading-relaxed text-foreground">
            {recs[type] || ""}
          </div>
        </CalcResult>
      </div>
    </CalcCard>
  );
}
