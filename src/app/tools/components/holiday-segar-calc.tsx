"use client";

import { useState, useMemo } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox, ResultAlert } from "./calc-ui";

// ─── KONSTANTA ────────────────────────────────────────────
// Makro: 1 mL = 20 tetes → TPM = mL/jam ÷ 3
// Mikro: 1 mL = 60 tetes → TPM = mL/jam
// PWL dasar berdasarkan usia
//   Neonatus (<1 bln): 30–40 mL/kg/hari
//   Bayi (1–12 bln): 25
//   1–3 thn: 20
//   3–12 thn: 15
//   >12 thn: 12
//   Prematur: 40

function getPwlPerKg(usiaTahun: number, preterm: boolean): number {
  if (preterm) return 40;
  if (usiaTahun < 0.083) return 30;   // <1 bulan
  if (usiaTahun < 1) return 25;        // 1–12 bulan
  if (usiaTahun < 3) return 20;        // 1–3 tahun
  if (usiaTahun < 12) return 15;       // 3–12 tahun
  return 12;                           // >12 tahun
}

// ─── MODE ─────────────────────────────────────────────────
const modeList = [
  { value: "nwl",          label: "NWL saja (Holliday-Segar)",        desc: "Kebutuhan cairan dasar" },
  { value: "nwl+pwl",      label: "NWL + PWL",                        desc: "Dasar + insensible skin & respiratory loss" },
  { value: "nwl+pwl+cwl",  label: "NWL + PWL + CWL",                  desc: "Dasar + percutaneous + continuing loss" },
];

// ─── RESTRIKSI ────────────────────────────────────────────
const restriksiList = [
  { value: "normal",    label: "Normal penuh (100%)",          pct: 0 },
  { value: "ringan-70", label: "Restriksi ringan (70%)",       pct: 30 },
  { value: "sindrom-hepatorenal-60", label: "Sindrom Hepatorenal (60%)", pct: 40 },
  { value: "ascites-50", label: "Ascites / Sirosis (50%)",     pct: 50 },
  { value: "custom",    label: "Custom...",                   pct: 0 },
];

// ─── AGE HELPER ───────────────────────────────────────────
function parseUsia(usia: number, unit: "hari" | "bulan" | "tahun"): number {
  if (unit === "hari") return usia / 365;
  if (unit === "bulan") return usia / 12;
  return usia;
}

// ─── KOMPONEN ─────────────────────────────────────────────
export function HolidaySegarCalc() {
  // ── Input utama ──
  const [bb, setBb] = useState<number>(15);
  const [mode, setMode] = useState("nwl+pwl");
  const [usiaVal, setUsiaVal] = useState<number>(5);
  const [usiaUnit, setUsiaUnit] = useState<"hari" | "bulan" | "tahun">("tahun");
  const [preterm, setPreterm] = useState(false);

  // ── PWL faktor ──
  const [suhu, setSuhu] = useState<number>(37);
  const [rr, setRr] = useState<number>(20);
  const [rrNormal, setRrNormal] = useState<number>(20);
  const [fototerapi, setFototerapi] = useState(false);
  const [inkubator, setInkubator] = useState(false);
  const [kulitLepas, setKulitLepas] = useState(false);  // STD / luka bakar luas → PWL tinggi

  // ── Restriksi ──
  const [restriksi, setRestriksi] = useState("normal");
  const [customPct, setCustomPct] = useState<number>(25);

  // ── CWL ──
  const [cwlDiare, setCwlDiare] = useState<number>(0);
  const [cwlMuntah, setCwlMuntah] = useState<number>(0);
  const [cwlNgt, setCwlNgt] = useState<number>(0);
  const [cwlDrain, setCwlDrain] = useState<number>(0);
  const [cwlLain, setCwlLain] = useState<number>(0);

  const hasil = useMemo(() => {
    // ═══ 1. NWL — Holliday-Segar ═══
    let nwl: number;
    if (bb <= 10) {
      nwl = bb * 100;
    } else if (bb <= 20) {
      nwl = 1000 + (bb - 10) * 50;
    } else {
      nwl = 1500 + (bb - 20) * 20;
    }
    nwl = Math.round(nwl);

    // ═══ 2. PWL — Percutaneous Water Loss ═══
    const usiaTahun = parseUsia(usiaVal, usiaUnit);
    const pwlPerKg = getPwlPerKg(usiaTahun, preterm);
    let pwl = Math.round(bb * pwlPerKg);

    let faktorPwl = 1.0;
    const faktorDetail: string[] = [];

    // Demam → +12.5% per °C di atas 38
    if (suhu > 38) {
      const inc = (suhu - 38) * 0.125;
      faktorPwl += inc;
      faktorDetail.push(`demam +${Math.round(inc * 100)}%`);
    }

    // Takipneu → +15%
    if (rr > rrNormal * 1.2) {
      faktorPwl += 0.15;
      faktorDetail.push("takipneu +15%");
    }

    // Fototerapi → +25%
    if (fototerapi) {
      faktorPwl += 0.25;
      faktorDetail.push("fototerapi +25%");
    }

    // Prematur → sudah di-accommodate lewat pwlPerKg (40), tapi boleh tambah +10% lagi
    if (preterm) {
      // prematuritas sudah termasuk di pwlPerKg = 40
    }

    // Kulit lepas (STD/staphylococcal scalded skin/burn) → +30%
    if (kulitLepas) {
      faktorPwl += 0.30;
      faktorDetail.push("skin loss +30%");
    }

    // Inkubator humidified → -30% (mengurangi PWL)
    if (inkubator) {
      faktorPwl -= 0.30;
      faktorDetail.push("inkubator -30%");
    }

    faktorPwl = Math.max(0.3, faktorPwl); // floor 30%
    pwl = Math.round(pwl * faktorPwl);

    // ═══ 3. CWL — Continuing Water Loss ═══
    const cwl = cwlDiare + cwlMuntah + cwlNgt + cwlDrain + cwlLain;

    // ═══ 4. Total sebelum restriksi ═══
    let totalRaw: number;
    if (mode === "nwl") {
      totalRaw = nwl;
    } else if (mode === "nwl+pwl") {
      totalRaw = nwl + pwl;
    } else {
      totalRaw = nwl + pwl + cwl;
    }

    // ═══ 5. Restriksi ═══
    const restriksiObj = restriksiList.find((r) => r.value === restriksi)!;
    const finalPct = restriksi === "custom" ? customPct : restriksiObj.pct;
    const total = Math.round(totalRaw * (1 - finalPct / 100));

    // ═══ 6. Rate & TPM ═══
    const perJam = +(total / 24).toFixed(1);
    const tpmMakro = +(perJam / 3).toFixed(1);
    const tpmMikro = +perJam.toFixed(1);

    return {
      usiaTahun,
      nwl,
      pwlPerKg,
      pwl,
      faktorPwl,
      faktorDetail,
      cwl,
      totalRaw,
      restriksiPct: finalPct,
      total,
      perJam,
      tpmMakro,
      tpmMikro,
    };
  }, [bb, mode, usiaVal, usiaUnit, preterm, suhu, rr, rrNormal, fototerapi, inkubator, kulitLepas, restriksi, customPct, cwlDiare, cwlMuntah, cwlNgt, cwlDrain, cwlLain]);

  const isRestriksiCustom = restriksi === "custom";
  const showPwl = mode === "nwl+pwl" || mode === "nwl+pwl+cwl";
  const showCwl = mode === "nwl+pwl+cwl";

  return (
    <CalcCard
      title="Kebutuhan Cairan Maintenance"
      subtitle="NWL + PWL + CWL (GastroEnteroHepatology) + tetes per menit"
      icon="💧"
      color="blue"
    >
      {/* ℹ️ Info konsep */}
      <InfoBox>
        <strong>NWL</strong> = Normal Water Loss (Holliday-Segar) ·{" "}
        <strong>PWL</strong> = Percutaneous Water Loss (kulit + napas) ·{" "}
        <strong>CWL</strong> = Continuing Water Loss (diare/muntah/drainase).{" "}
        <strong>Tetes:</strong> Makro 20 tts/mL → TPM = mL/jam ÷ 3 · Mikro 60 tts/mL → TPM = mL/jam.
      </InfoBox>

      {/* ═══ ROW 1: BB + MODE + USIA ═══ */}
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="Berat Badan" value={bb} onChange={(v) => setBb(v as number)} unit="kg" min={0.5} max={200} step={0.1} />
        <CalcSelect label="Mode Perhitungan" value={mode} onChange={setMode} options={modeList} />
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Usia</label>
          <div className="flex gap-1">
            <input type="number" value={usiaVal} onChange={(e) => setUsiaVal(parseFloat(e.target.value) || 0)} min={0} step={1}
              className="w-full rounded-lg border border-border bg-muted/50 px-2 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neon/30" />
            <select value={usiaUnit} onChange={(e) => setUsiaUnit(e.target.value as "hari" | "bulan" | "tahun")}
              className="rounded-lg border border-border bg-muted/50 px-1 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-neon/30 shrink-0 w-16">
              <option value="hari">Hr</option>
              <option value="bulan">Bln</option>
              <option value="tahun">Thn</option>
            </select>
          </div>
        </div>
      </div>

      {/* ═══ ROW 2: RESTRIKSI ═══ */}
      <div className="grid grid-cols-2 gap-3">
        <CalcSelect label="Restriksi Cairan" value={restriksi} onChange={setRestriksi} options={restriksiList} />
        {isRestriksiCustom && (
          <CalcInput label={`Reduksi (${customPct}%)`} value={customPct} onChange={(v) => setCustomPct(v as number)} unit="%" min={0} max={80} step={5} />
        )}
      </div>

      {/* ═══ PWL PANEL (hanya jika mode ada PWL) ═══ */}
      {showPwl && (
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 space-y-2">
          <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
            PWL (Percutaneous Water Loss) — {hasil.pwlPerKg} mL/kg/hari dasar
          </p>
          <div className="grid grid-cols-4 gap-2">
            <CalcInput label="Suhu (°C)" value={suhu} onChange={(v) => setSuhu(v as number)} min={36} max={42} step={0.5} />
            <CalcInput label="RR aktual" value={rr} onChange={(v) => setRr(v as number)} min={0} max={120} />
            <CalcInput label="RR normal" value={rrNormal} onChange={(v) => setRrNormal(v as number)} min={10} max={60} />
            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={preterm} onChange={(e) => setPreterm(e.target.checked)} className="rounded accent-blue-500" />
                Prematur
              </label>
              <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={fototerapi} onChange={(e) => setFototerapi(e.target.checked)} className="rounded accent-blue-500" />
                Fototerapi (+25%)
              </label>
              <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={inkubator} onChange={(e) => setInkubator(e.target.checked)} className="rounded accent-blue-500" />
                Inkubator (−30%)
              </label>
              <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
                <input type="checkbox" checked={kulitLepas} onChange={(e) => setKulitLepas(e.target.checked)} className="rounded accent-blue-500" />
                Skin loss (+30%)
              </label>
            </div>
          </div>
          {hasil.faktorDetail.length > 0 && (
            <p className="text-[10px] text-blue-300/70">
              PWL adjustment: {hasil.faktorDetail.join(" · ")} → ×{hasil.faktorPwl.toFixed(2)}
            </p>
          )}
        </div>
      )}

      {/* ═══ CWL PANEL ═══ */}
      {showCwl && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 space-y-2">
          <p className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">
            CWL (Continuing Water Loss) — Estimasi abnormal losses mL/hari
          </p>
          <div className="grid grid-cols-5 gap-2">
            <CalcInput label="Diare"       value={cwlDiare}  onChange={(v) => setCwlDiare(v as number)}  unit="mL" min={0} max={5000} />
            <CalcInput label="Muntah"      value={cwlMuntah} onChange={(v) => setCwlMuntah(v as number)} unit="mL" min={0} max={5000} />
            <CalcInput label="NGT drain"   value={cwlNgt}    onChange={(v) => setCwlNgt(v as number)}    unit="mL" min={0} max={5000} />
            <CalcInput label="Drain lain"  value={cwlDrain}  onChange={(v) => setCwlDrain(v as number)}  unit="mL" min={0} max={5000} />
            <CalcInput label="Lain-lain"   value={cwlLain}   onChange={(v) => setCwlLain(v as number)}   unit="mL" min={0} max={5000} />
          </div>
        </div>
      )}

      {/* ═══ HASIL ═══ */}
      <CalcResult color="blue">
        {/* Rincian komponen */}
        <div className="text-center border-b border-blue-500/20 pb-2 mb-2">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-mono">
            {/* NWL */}
            <span className="text-muted-foreground">
              NWL <span className="text-foreground font-bold">{hasil.nwl}</span>
            </span>
            {/* PWL */}
            {showPwl && (
              <span className="text-muted-foreground">
                + PWL <span className="text-foreground font-bold">{hasil.pwl}</span>
                <span className="text-[10px] ml-0.5">({hasil.pwlPerKg} mL/kg ×{hasil.faktorPwl.toFixed(2)})</span>
              </span>
            )}
            {/* CWL */}
            {showCwl && hasil.cwl > 0 && (
              <span className="text-muted-foreground">
                + CWL <span className="text-foreground font-bold">{hasil.cwl}</span>
              </span>
            )}
            <span className="text-muted-foreground">
              = <span className="text-foreground font-bold">{hasil.totalRaw}</span> mL/hari
            </span>
          </div>
          {hasil.restriksiPct > 0 && (
            <p className="text-xs text-amber-400 mt-1">
              ↓ Restriksi {hasil.restriksiPct}% → <strong>{hasil.total}</strong> mL/hari
            </p>
          )}
        </div>

        {/* mL/hari + mL/jam */}
        <ResultGrid cols={2}>
          <ResultItem label="Total per Hari" value={hasil.total} unit="mL/hari" />
          <ResultItem label="Rate" value={hasil.perJam} unit="mL/jam" />
        </ResultGrid>

        {/* TPM */}
        <div className="rounded-lg border-2 border-blue-500/30 bg-blue-500/5 p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider text-center mb-2">
            Kecepatan Infus — Tetes per Menit
          </p>
          <div className="grid grid-cols-2 gap-4">
            {/* Makro */}
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Makro (20 tts/mL)</p>
              <p className="text-2xl font-bold font-mono text-blue-400">
                {hasil.tpmMakro}<span className="text-xs font-normal text-muted-foreground ml-1">tpm</span>
              </p>
              <p className="text-[9px] text-muted-foreground mt-0.5">mL/jam ÷ 3</p>
            </div>
            {/* Mikro */}
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mikro (60 tts/mL)</p>
              <p className="text-2xl font-bold font-mono text-blue-400">
                {hasil.tpmMikro}<span className="text-xs font-normal text-muted-foreground ml-1">tpm</span>
              </p>
              <p className="text-[9px] text-muted-foreground mt-0.5">TPM = mL/jam</p>
            </div>
          </div>

          {/* Konversi balik */}
          <div className="mt-3 pt-3 border-t border-blue-500/20 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Konversi Cepat</p>
            <p className="text-[11px] text-muted-foreground">
              <strong>Makro:</strong> mL/jam = TPM × 3 —{" "}
              <strong>Mikro:</strong> mL/jam = TPM —{" "}
              TPM makro = {hasil.perJam} ÷ 3 = <strong>{hasil.tpmMakro} tpm</strong>
            </p>
          </div>
        </div>

        <InfoBox>
          <strong>NWL:</strong> 100/50/20 mL/kg (Holliday-Segar) ·{" "}
          <strong>PWL dasar:</strong> {hasil.pwlPerKg} mL/kg/hari (usia {hasil.usiaTahun < 1 ? `${Math.round(hasil.usiaTahun * 12)} bln` : `${Math.round(hasil.usiaTahun)} thn`}{preterm ? ", prematur" : ""}) ·{" "}
          Demam +12.5%/°C di atas 38°C · Takipneu +15% · Fototerapi +25% · Inkubator −30%
        </InfoBox>
      </CalcResult>

      {/* ⚠️ Warning kalau PWL terlalu rendah atau tinggi */}
      {showPwl && hasil.faktorPwl < 0.5 && (
        <ResultAlert type="warning">⚠️ PWL adjustment sangat rendah (×{hasil.faktorPwl.toFixed(2)}). Pastikan inkubator + semua faktor sudah benar.</ResultAlert>
      )}
      {showPwl && hasil.faktorPwl > 1.8 && (
        <ResultAlert type="warning">⚠️ PWL adjustment sangat tinggi (×{hasil.faktorPwl.toFixed(2)}). Monitor balans cairan ketat!</ResultAlert>
      )}
    </CalcCard>
  );
}
