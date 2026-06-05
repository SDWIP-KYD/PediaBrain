"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, InfoBox } from "../../components/calc-ui";

export function ImunosupresiNefrologiCalc() {
  const { weightGram } = usePatient();
  const [w, setW] = useState(20);
  const [h, setH] = useState(110);
  const [ind, setInd] = useState("ns-first");

  const bsa = Math.sqrt((w * h) / 3600);
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const r1 = (n: number) => Math.round(n * 10) / 10;
  const r0 = (n: number) => Math.round(n);
  const pred60 = r1(60 * bsa);
  const pred40 = r1(40 * bsa);
  const ctx = r0(500 * bsa);
  const tac = r2(0.1 * w);
  const mmf = r0(600 * bsa);

  const recs: Record<string, string> = {
    "ns-first": `SN Onset Pertama — Prednisolon:\n💊 Induksi: Prednisolon ${pred60} mg/hari (60 mg/m²/hr, maks 60 mg) q8-12h × 4–6 minggu\n💊 Tapering: ${pred40} mg selang sehari (40 mg/m²/sehari bergantian) × 4–6 minggu\n→ Monitor: BB, TD, GD, urin protein harian`,
    "ns-relapse": `SN Relaps — Prednisolon:\n💊 Prednisolon ${pred60} mg/hari sampai remisi lengkap (protein negatif 3×/minggu berturut-turut)\n→ Kemudian ${pred40} mg selang sehari × 4 minggu`,
    "ns-steroid-dep": `SN Steroid Dependen — Alternatif:\n1. Siklofosfamid (CTX) oral ${r0(2 * w)} mg/hari (2 mg/kg) × 8–12 minggu. Cek CBC tiap 2 minggu.\n2. MMF ${mmf} mg/hari (600 mg/m²) dibagi q12h × 12–24 bulan\n3. Levamisol ${r0(2.5 * w)} mg (2.5 mg/kg, maks 150 mg) selang sehari`,
    "ns-resist": `SN Steroid Resisten — Biopsi dahulu:\n1. Takrolimus ${tac} mg/dosis q12h (0.1 mg/kg/hari). Target level: 5–10 ng/mL\n2. Rituximab 375 mg/m² IV × 1–4 dosis (SDNS/SRNS)\n3. Siklosporin A 4–5 mg/kg/hari q12h. Target level 100–200 ng/mL`,
    itp: `ITP Akut — Prednisolon:\n💊 Prednisolon ${r1(1.5 * w)} mg/hari (1.5–2 mg/kg, maks 60 mg) × 2–4 minggu\n💉 IVIG ${r0(1 * w)} g/kg IV hari 1 (PLT <20.000 + perdarahan)\nAnti-D 75 mcg/kg IV bila golongan darah Rh+`,
    "hsp-nephritis": `HSP Nefritis Berat (UPCR>3.5 atau AKI):\n💊 Prednisolon ${pred60} mg/hari × 4 minggu → taper\nPulse Metilprednisolon 30 mg/kg/hari (maks 1 g) × 3 hari bila nefritis berat\nPertimbangkan ACE inhibitor untuk antiproteinurik jangka panjang`,
    transplant: `Post-Transplant Ginjal — Triple Therapy:\n💊 Takrolimus ${tac} mg q12h (target level 8–12 ng/mL bulan 1–3)\n💊 MMF ${mmf} mg/hari (600 mg/m²) dibagi q12h\n💊 Prednisolon taper dari 1 mg/kg → 0.1–0.2 mg/kg dalam 3–6 bulan\nMonitor: tacrolimus level, CBC, fungsi ginjal, BP tiap kunjungan`,
  };

  return (
    <CalcCard title="Imunosupresi Nefrologi" subtitle="Prednisolon, Siklofosfamid, Takrolimus, MMF" icon="💉" color="purple">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <CalcInput label="BB (kg)" unit="kg" value={w} onChange={(v) => setW(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} />
          <CalcInput label="TB (cm)" unit="cm" value={h} onChange={(v) => setH(typeof v === "string" ? parseFloat(v) || 0 : v)} min={30} />
        </div>
        <CalcSelect label="Indikasi" value={ind} onChange={setInd} options={[
          { value: "ns-first", label: "SN Onset Pertama (Prednisolon)" },
          { value: "ns-relapse", label: "SN Relaps (Prednisolon)" },
          { value: "ns-steroid-dep", label: "SN Steroid Dependen (CTX/MMF)" },
          { value: "ns-resist", label: "SN Steroid Resisten (Takrolimus/RTX)" },
          { value: "itp", label: "ITP (Prednisolon)" },
          { value: "hsp-nephritis", label: "HSP Nefritis berat" },
          { value: "transplant", label: "Post Transplant (Takrolimus+MMF+Pred)" },
        ]} />
        <CalcResult color="purple">
          <div className="whitespace-pre-line text-xs leading-relaxed text-foreground">
            {recs[ind] || ""}
          </div>
        </CalcResult>
      </div>
    </CalcCard>
  );
}
