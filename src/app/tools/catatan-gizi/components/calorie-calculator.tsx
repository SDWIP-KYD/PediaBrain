"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, CalcButton, InfoBox, ResultAlert } from "../../components/calc-ui";

const kaloriSusu: Record<string, number> = {
  sgm_ananda_06: 0.65,
  sgm_ananda_612: 0.67,
  sgm_optigrow: 0.45,
  infatrini: 1.0,
  pediasure: 0.84,
  pediacomplete: 1.0,
  lactogen1: 0.67,
  lactogen2: 0.7,
  ensure: 1.0,
  goldsure: 1.0,
  f75: 0.75,
  f100: 1.0,
};

const milkOptions = [
  { value: "", label: "-- Pilih susu --" },
  { value: "sgm_ananda_06", label: "SGM Ananda 0-6 bln (0.65)" },
  { value: "sgm_ananda_612", label: "SGM Ananda 6-12 bln (0.67)" },
  { value: "sgm_optigrow", label: "SGM Optigrow (0.45/cc)" },
  { value: "infatrini", label: "Infatrini (1.0/cc)" },
  { value: "pediasure", label: "Pediasure (0.84/cc)" },
  { value: "pediacomplete", label: "Pediacomplete (1.0/cc)" },
  { value: "lactogen1", label: "Lactogen 1 (0.67)" },
  { value: "lactogen2", label: "Lactogen 2 (0.7)" },
  { value: "ensure", label: "Ensure (1.0/cc)" },
  { value: "goldsure", label: "Goldsure (1.0/cc)" },
  { value: "f75", label: "F75 (0.75/cc)" },
  { value: "f100", label: "F100 (1.0/cc)" },
];

function getRDA(usiaBln: number): number {
  if (usiaBln <= 6) return 120;
  if (usiaBln <= 12) return 110;
  if (usiaBln <= 36) return 100;
  if (usiaBln <= 72) return 90;
  if (usiaBln <= 108) return 80;
  if (usiaBln <= 144) return 70;
  if (usiaBln <= 180) return 60;
  return 50;
}

export function CalorieCalculator() {
  const { weightGram } = usePatient();
  const weightKg = weightGram / 1000;

  const [bba, setBba] = useState(weightKg);
  const [bbi, setBbi] = useState(0);
  const [usiaBln, setUsiaBln] = useState(6);
  const [statusGizi, setStatusGizi] = useState("normal");
  const [jenisSusu, setJenisSusu] = useState("");
  const [volSekali, setVolSekali] = useState(0);
  const [frekuensi, setFrekuensi] = useState(0);

  const rda = getRDA(usiaBln);
  const kebutuhanBBI = bbi * rda;
  const totalVol = volSekali * frekuensi;
  const kalSusu = jenisSusu ? kaloriSusu[jenisSusu] ?? null : null;
  const kalAktual = kalSusu !== null ? totalVol * kalSusu : null;

  let minKal = 0;
  let maxKal = 0;
  let formula = "";
  if (statusGizi === "buruk") {
    minKal = bba * 80;
    maxKal = bba * 220;
    formula = `BBA (${bba}kg) × 80–220 kkal/kg`;
  } else if (statusGizi === "kurang") {
    minKal = bbi * rda * 0.75;
    maxKal = bbi * rda;
    formula = `BBI (${bbi}kg) × RDA (${rda}) × 75–100%`;
  } else if (statusGizi === "obesitas") {
    minKal = kebutuhanBBI * 0.7;
    maxKal = kebutuhanBBI * 0.7;
    formula = `BBI (${bbi}kg) × RDA (${rda}) × 70% (reduksi 30%)`;
  } else {
    minKal = kebutuhanBBI;
    maxKal = kebutuhanBBI;
    formula = `BBI (${bbi}kg) × RDA (${rda} kkal/kg)`;
  }

  const defisit = kalAktual !== null && kalAktual < minKal ? minKal - kalAktual : 0;

  return (
    <CalcCard title="Kebutuhan Kalori & Pengentalan Susu" subtitle="Calorie Needs & Milk Thickening" icon="⚡" color="green">
      <InfoBox>
        <strong>Rumus Kalori:</strong> BBI × RDA = kebutuhan kkal/hari. RDA bervariasi menurut usia (115-50 kkal/kg/hari).
      </InfoBox>

      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB Aktual (kg)" unit="kg" value={bba} onChange={(v) => setBba(typeof v === "string" ? parseFloat(v) || 0 : v)} step={0.1} placeholder="mis. 4.6" />
        <CalcInput label="BB Ideal / BBI (kg)" unit="kg" value={bbi} onChange={(v) => setBbi(typeof v === "string" ? parseFloat(v) || 0 : v)} step={0.1} placeholder="mis. 6.4" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Usia (bulan)" unit="bln" value={usiaBln} onChange={(v) => setUsiaBln(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} placeholder="mis. 11" />
        <CalcSelect label="Status Gizi" value={statusGizi} onChange={setStatusGizi} options={[
          { value: "normal", label: "Normal" },
          { value: "kurang", label: "Gizi Kurang" },
          { value: "buruk", label: "Gizi Buruk" },
          { value: "obesitas", label: "Obesitas" },
        ]} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <CalcSelect label="Jenis Susu" value={jenisSusu} onChange={setJenisSusu} options={milkOptions} className="col-span-2" />
        <CalcInput label="Vol/kali minum (mL)" unit="mL" value={volSekali} onChange={(v) => setVolSekali(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} placeholder="mis. 45" />
      </div>
      <CalcInput label="Frekuensi minum/hari" unit="×/hari" value={frekuensi} onChange={(v) => setFrekuensi(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} placeholder="mis. 8" />

      <CalcResult color="green">
        <ResultGrid cols={2}>
          <ResultItem label="RDA" value={`${rda}`} unit="kkal/kg/hari" />
          <ResultItem label="Kebutuhan (BBI)" value={`${Math.round(kebutuhanBBI)}`} unit="kkal/hari" />
          <ResultItem label="Range Target" value={`${Math.round(minKal)}–${Math.round(maxKal)}`} unit="kkal/hari" />
          {kalAktual !== null && (
            <ResultItem
              label="Kalori Aktual"
              value={`${Math.round(kalAktual)}`}
              unit={kalAktual >= minKal ? "✓ Terpenuhi" : "⚠️ Defisit"}
              className={kalAktual >= minKal ? "text-emerald-400" : "text-red-400"}
            />
          )}
        </ResultGrid>
        <div className="mt-2 px-3 py-2 rounded-lg bg-muted/50 border border-border font-mono text-xs text-blue-300">
          Formula: {formula}
        </div>
      </CalcResult>

      {kalAktual !== null && kalAktual < minKal && (
        <ResultAlert type="warning">
          Defisit <strong>{Math.round(defisit)} kkal/hari</strong>. Pertimbangkan pengentalan atau penambahan frekuensi minum.
        </ResultAlert>
      )}
      {kalAktual !== null && kalAktual >= minKal && (
        <ResultAlert type="success">
          Kalori aktual mencukupi kebutuhan minimal.
        </ResultAlert>
      )}
    </CalcCard>
  );
}
