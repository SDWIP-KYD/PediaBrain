"use client";

import { useState, useMemo } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox, ResultAlert } from "./calc-ui";

// ─── KONSTANTA TETES ──────────────────────────────────────
const TPM_MAKRO_FACTOR = 20; // tetes/mL → TPM = mL/jam * 20 / 60 = mL/jam / 3
const TPM_MIKRO_FACTOR = 60; // tetes/mL → TPM = mL/jam

// ══════════════════════════════════════════════════════════
// HOLLIDAY-SEGAR — 100/50/20 mL/kg
// ══════════════════════════════════════════════════════════
function hollidaySegar(bb: number): number {
  if (bb <= 10) return Math.round(bb * 100);
  if (bb <= 20) return Math.round(1000 + (bb - 10) * 50);
  return Math.round(1500 + (bb - 20) * 20);
}

// ══════════════════════════════════════════════════════════
// GEH — NWL per usia (mL/kg/hari)
// ══════════════════════════════════════════════════════════
function getNwlPerKg(usiaTahun: number): number {
  if (usiaTahun < 0.25)      return 160;   // 0–3 bln (Triwulan I)
  if (usiaTahun < 0.5)       return 145;   // 3–6 bln (Triwulan II)
  if (usiaTahun < 0.75)      return 132;   // 6–9 bln (Triwulan III)
  if (usiaTahun < 1)         return 115;   // 9–12 bln (Triwulan IV)
  if (usiaTahun < 3)         return 100;   // 1–3 thn
  if (usiaTahun < 6)         return 90;    // 4–6 thn
  if (usiaTahun < 9)         return 80;    // 7–9 thn
  if (usiaTahun < 12)        return 70;    // 10–12 thn
  return 60;                                // 13–19 thn
}

// ══════════════════════════════════════════════════════════
// GEH — PWL per BB (mL/kgBB/hari)
// ══════════════════════════════════════════════════════════
function getPwlPerKg(bbKg: number): number {
  if (bbKg <= 10) return 75;
  if (bbKg <= 15) return 50;
  return 30;
}

// ══════════════════════════════════════════════════════════
// GEH — CWL (mL/kgBB/hari) — konstanta
// ══════════════════════════════════════════════════════════
const CWL_PER_KG = 25;

// ─── AGE HELPER ───────────────────────────────────────────
function parseUsia(usia: number, unit: "bulan" | "tahun"): number {
  if (unit === "bulan") return usia / 12;
  return usia;
}

// ─── SKENARIO DEHIDRASI ───────────────────────────────────
const skenarioList = [
  { value: "dehidrasi",    label: "Dehidrasi",              pwl: true,  cwl: true,  desc: "(NWL + PWL + CWL) × BB" },
  { value: "diare",        label: "Diare tanpa Dehidrasi",  pwl: false, cwl: true,  desc: "(NWL + CWL) × BB" },
  { value: "normal",       label: "Tanpa Dehidrasi/Diare",  pwl: false, cwl: false, desc: "NWL × BB" },
];

// ─── RESTRIKSI ────────────────────────────────────────────
const restriksiList = [
  { value: "normal",    label: "Normal penuh (100%)",            pct: 0 },
  { value: "ringan-70", label: "Restriksi ringan (70%)",         pct: 30 },
  { value: "hepatorenal-60", label: "Sindrom Hepatorenal (60%)", pct: 40 },
  { value: "ascites-50", label: "Ascites / Sirosis (50%)",       pct: 50 },
  { value: "custom",    label: "Custom...",                      pct: 0 },
];

// ─── TAB UTAMA ──────────────────────────────────────────
const tabList = [
  { value: "hs",    label: "Holliday-Segar",  desc: "Maintenance klasik 100/50/20 mL/kg" },
  { value: "geh",   label: "NWL·PWL·CWL (GEH)", desc: "GastroEnteroHepatology — skenario klinis" },
];

// ═══════════════════════════════════════════════════════════
export function HolidaySegarCalc() {
  // ── Input ──
  const [tab, setTab] = useState("hs");
  const [bb, setBb] = useState<number>(15);
  const [usiaVal, setUsiaVal] = useState<number>(5);
  const [usiaUnit, setUsiaUnit] = useState<"bulan" | "tahun">("tahun");
  const [skenario, setSkenario] = useState("dehidrasi");
  const [restriksi, setRestriksi] = useState("normal");
  const [customPct, setCustomPct] = useState<number>(25);

  const hasil = useMemo(() => {
    // 1. Holliday-Segar
    const hs = hollidaySegar(bb);

    // 2. GEH — hitung komponen per mL/kg/hari, lalu × BB
    const nwlPerKg = getNwlPerKg(parseUsia(usiaVal, usiaUnit));
    const nwl = Math.round(nwlPerKg * bb);

    const pwlPerKg = getPwlPerKg(bb);
    const pwl = Math.round(pwlPerKg * bb);

    const cwl = Math.round(CWL_PER_KG * bb);

    // Tentukan komponen berdasarkan skenario
    const skenarioObj = skenarioList.find((s) => s.value === skenario)!;
    const usePwl = skenarioObj.pwl;
    const useCwl = skenarioObj.cwl;

    let totalGEH: number;
    if (usePwl && useCwl) totalGEH = nwl + pwl + cwl;
    else if (useCwl) totalGEH = nwl + cwl;
    else totalGEH = nwl;

    // Restriksi
    const restriksiObj = restriksiList.find((r) => r.value === restriksi)!;
    const finalPct = restriksi === "custom" ? customPct : restriksiObj.pct;
    const totalGEHRestricted = Math.round(totalGEH * (1 - finalPct / 100));
    const hsRestricted = Math.round(hs * (1 - finalPct / 100));

    // Pilih total berdasarkan tab
    const total = tab === "hs" ? hsRestricted : totalGEHRestricted;
    const totalRaw = tab === "hs" ? hs : totalGEH;

    // Rate & TPM
    const perJam = +(total / 24).toFixed(1);
    const tpmMakro = +(perJam / 3).toFixed(1);
    const tpmMikro = +perJam.toFixed(1);

    return {
      hs, hsRestricted,
      nwlPerKg, nwl, pwlPerKg, pwl, cwl,
      usePwl, useCwl,
      totalGEH, totalGEHRestricted,
      totalRaw, total, perJam, tpmMakro, tpmMikro,
      restriksiPct: finalPct,
    };
  }, [bb, tab, usiaVal, usiaUnit, skenario, restriksi, customPct]);

  const isRestriksiCustom = restriksi === "custom";
  const isHS = tab === "hs";

  return (
    <CalcCard
      title="Kalkulator Cairan Maintenance"
      subtitle="Holliday-Segar + NWL·PWL·CWL (GastroEnteroHepatology) + TPM"
      icon="💧"
      color="blue"
    >
      <InfoBox>
        <strong>Holliday-Segar:</strong> 100/50/20 mL/kg — maintenance klasik.{" "}
        <strong>GEH:</strong> NWL (Normal) berdasarkan usia · PWL (Percutaneous) berdasarkan BB · CWL (Continuing) = 25 mL/kg.{" "}
        Skenario: Dehidrasi = NWL+PWL+CWL · Diare = NWL+CWL · Normal = NWL saja.{" "}
        <strong>Tetes:</strong> Makro 20 tts/mL (TPM=mL/jam÷3) · Mikro 60 tts/mL (TPM=mL/jam).
      </InfoBox>

      {/* ═══ TAB ═══ */}
      <div className="grid grid-cols-2 rounded-lg bg-muted/50 p-1">
        {tabList.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`rounded-md px-3 py-2 text-[12px] font-medium transition-colors ${
              tab === t.value ? "bg-blue-500 text-white shadow" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`} title={t.desc}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ INPUT: BB ─═══ */}
      <CalcInput label="Berat Badan" value={bb} onChange={(v) => setBb(v as number)} unit="kg" min={0.5} max={200} step={0.1} />

      {/* ═══ GEH INPUTS ═══ */}
      {!isHS && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Usia</label>
              <div className="flex gap-1">
                <input type="number" value={usiaVal} onChange={(e) => setUsiaVal(parseFloat(e.target.value) || 0)} min={0} step={1}
                  className="w-full rounded-lg border border-border bg-muted/50 px-2 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neon/30" />
                <select value={usiaUnit} onChange={(e) => setUsiaUnit(e.target.value as "bulan" | "tahun")}
                  className="rounded-lg border border-border bg-muted/50 px-1 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-neon/30 shrink-0 w-16">
                  <option value="bulan">Bln</option>
                  <option value="tahun">Thn</option>
                </select>
              </div>
            </div>
            <CalcSelect label="Skenario Klinis" value={skenario} onChange={setSkenario} options={skenarioList} />
          </div>

          {/* NWL + PWL + CWL reference table */}
          <div className="rounded-lg bg-muted/30 border border-border p-2 text-[10px] text-muted-foreground">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><strong className="text-blue-400">NWL</strong><br />{hasil.nwlPerKg} mL/kg<br /><span className="text-[9px]">× {bb} kg = {hasil.nwl} mL</span></div>
              <div><strong className="text-blue-400">PWL</strong><br />{hasil.pwlPerKg} mL/kg<br /><span className="text-[9px]">× {bb} kg = {hasil.pwl} mL</span></div>
              <div><strong className="text-blue-400">CWL</strong><br />25 mL/kg<br /><span className="text-[9px]">× {bb} kg = {hasil.cwl} mL</span></div>
            </div>
          </div>
        </>
      )}

      {/* ═══ RESTRIKSI ═══ */}
      <div className="grid grid-cols-2 gap-3">
        <CalcSelect label="Restriksi Cairan" value={restriksi} onChange={setRestriksi} options={restriksiList} />
        {isRestriksiCustom && (
          <CalcInput label={`Reduksi (${customPct}%)`} value={customPct} onChange={(v) => setCustomPct(v as number)} unit="%" min={0} max={80} step={5} />
        )}
      </div>

      {/* ═══ HASIL ═══ */}
      <CalcResult color="blue">
        {/* GEH formula breakdown */}
        {!isHS && (
          <div className="text-center pb-2 mb-2 border-b border-blue-500/20">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
              Total = ({hasil.nwlPerKg} + {hasil.usePwl ? hasil.pwlPerKg + " + " : ""}{hasil.useCwl ? "25" : ""}) × {bb} kg
              = <strong className="text-base">{hasil.totalRaw}</strong> mL/hari
            </p>
            {hasil.restriksiPct > 0 && (
              <p className="text-[10px] text-red-400 mt-0.5">Setelah restriksi {hasil.restriksiPct}% = {hasil.total} mL/hari</p>
            )}
          </div>
        )}

        {/* H-S formula */}
        {isHS && (
          <div className="text-center pb-2 mb-2 border-b border-blue-500/20">
            <p className="text-[11px] text-muted-foreground">
              Holliday-Segar {bb <= 10 ? `${bb} × 100` : bb <= 20 ? `1000 + (${bb}-10)×50` : `1500 + (${bb}-20)×20`}
              {" "}= <strong className="text-base">{hasil.totalRaw}</strong> mL/hari
            </p>
            {hasil.restriksiPct > 0 && (
              <p className="text-[10px] text-red-400 mt-0.5">Setelah restriksi {hasil.restriksiPct}% = {hasil.total} mL/hari</p>
            )}
          </div>
        )}

        {/* Cross-reference: GEH vs H-S */}
        {!isHS && (
          <div className="text-center text-[10px] text-blue-300/70 mb-1">
            Cross-check H‑S: {hasil.hs} mL/hari ({Math.round(hasil.hs / bb)} mL/kg)
            {hasil.restriksiPct > 0 && ` → restriksi ${hasil.restriksiPct}% = ${hasil.hsRestricted} mL/hari`}
          </div>
        )}

        {isHS && (
          <div className="text-center text-[10px] text-blue-300/70 mb-1">
            Cross-check GEH: NWL/PWL/CWL = {hasil.totalGEH} mL/hari (skenario dehidrasi)
          </div>
        )}

        {/* mL/hari + mL/jam */}
        <ResultGrid cols={2}>
          <ResultItem label="Total per Hari" value={hasil.total} unit="mL/hari" />
          <ResultItem label="Rate" value={hasil.perJam} unit="mL/jam" />
        </ResultGrid>

        {/* TPM */}
        <div className="rounded-lg border-2 border-blue-500/30 bg-blue-500/5 p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider text-center mb-2">Tetes per Menit</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Makro (20 tts/mL)</p>
              <p className="text-2xl font-bold font-mono text-blue-400">{hasil.tpmMakro}<span className="text-xs font-normal text-muted-foreground ml-1">tpm</span></p>
              <p className="text-[9px] text-muted-foreground mt-0.5">mL/jam ÷ 3</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mikro (60 tts/mL)</p>
              <p className="text-2xl font-bold font-mono text-blue-400">{hasil.tpmMikro}<span className="text-xs font-normal text-muted-foreground ml-1">tpm</span></p>
              <p className="text-[9px] text-muted-foreground mt-0.5">TPM = mL/jam</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-500/20 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Konversi Cepat</p>
            <p className="text-[11px] text-muted-foreground">
              <strong>Makro:</strong> mL/jam = TPM × 3 · <strong>Mikro:</strong> mL/jam = TPM · TPM makro = {hasil.perJam} ÷ 3 = <strong>{hasil.tpmMakro}</strong>
            </p>
          </div>
        </div>

        <InfoBox>
          {isHS ? (
            <><strong>Holliday-Segar:</strong> 100 mL/kg (0–10 kg) + 50 mL/kg (11–20 kg) + 20 mL/kg (&gt;20 kg). Sudah mencakup NWL+PWL normal. Untuk dekomposisi detail gunakan tab GEH.</>
          ) : (
            <>
              <strong>GEH:</strong> NWL per usia (160→60 mL/kg) · PWL per BB ({hasil.pwlPerKg} mL/kg) · CWL = 25 mL/kg.{" "}
              Skenario: Dehidrasi (NWL+PWL+CWL), Diare (NWL+CWL), Normal (NWL saja).
            </>
          )}
        </InfoBox>
      </CalcResult>
    </CalcCard>
  );
}
