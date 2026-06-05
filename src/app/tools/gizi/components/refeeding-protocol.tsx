"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcResult, InfoBox, ResultAlert } from "../../components/calc-ui";

export function RefeedingProtocol() {
  const [weight, setWeight] = useState(12);
  const [loss, setLoss] = useState(20);
  const [days, setDays] = useState(7);

  const highRisk = loss >= 15 || days >= 5;
  const startKcal = Math.round(weight * 10);
  const day3Kcal = Math.round(weight * 15);
  const day7Kcal = Math.round(weight * 20);

  return (
    <CalcCard title="Refeeding Syndrome Protocol" subtitle="Risiko, protokol pengenalan kembali makan" icon="⚠️" color="yellow">
      <div className="space-y-3">
        <InfoBox>
          <strong>Risiko tinggi refeeding:</strong> BB turun &gt;15-20%, puasa &gt;5 hari, anoreksia nervosa, alkoholisme, TPN jangka panjang.
        </InfoBox>
        <div className="grid grid-cols-3 gap-2">
          <CalcInput label="BB Aktual (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} step={0.1} />
          <CalcInput label="% Penurunan BB" unit="%" value={loss} onChange={(v) => setLoss(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={100} />
          <CalcInput label="Durasi Puasa (hari)" unit="hari" value={days} onChange={(v) => setDays(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        </div>
        <ResultAlert type={highRisk ? "danger" : "warning"}>
          {highRisk
            ? `Risiko TINGGI — BB turun ${loss}% + Puasa ${days} hari → Monitor SANGAT KETAT`
            : `Risiko Sedang — BB turun ${loss}% + Puasa ${days} hari → Monitor ketat`}
        </ResultAlert>
        <CalcResult color="yellow">
          <div className="space-y-1.5 text-xs font-mono leading-relaxed">
            <p className="font-bold text-sm mb-2">Protokol Reintroduksi Makan:</p>
            <p>Hari 1-2: <strong>{startKcal} kkal/hari</strong> (10 kkal/kgBB) — MULAI RENDAH</p>
            <p>Hari 3-4: <strong>{day3Kcal} kkal/hari</strong> (naikkan bertahap)</p>
            <p>Hari 5-7: <strong>{day7Kcal} kkal/hari</strong> (target maintenance)</p>
            <p>Hari 7+: Naik menuju kalori penuh dalam 2 minggu</p>
          </div>
        </CalcResult>
        <InfoBox>
          <strong>Monitor Refeeding Syndrome:</strong><br />
          Fosfat, Kalium, Magnesium setiap hari × 5 hari pertama<br />
          EKG (QT prolongasi), edema, sesak napas<br />
          Tiamin 100-300 mg/hari WAJIB sebelum/saat refeeding (Wernicke prevention)
        </InfoBox>
      </div>
    </CalcCard>
  );
}
