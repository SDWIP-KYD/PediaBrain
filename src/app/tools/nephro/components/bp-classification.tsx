"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const mBP: Record<number, Record<number, [number, number]>> = {
  5: { 5: [96, 50], 25: [99, 52], 50: [101, 54], 75: [103, 56], 90: [104, 57], 95: [105, 58] },
  8: { 5: [101, 55], 25: [104, 57], 50: [106, 59], 75: [108, 61], 90: [110, 62], 95: [111, 63] },
  10: { 5: [103, 58], 25: [106, 60], 50: [108, 62], 75: [110, 64], 90: [112, 65], 95: [113, 66] },
  12: { 5: [106, 61], 25: [109, 63], 50: [111, 65], 75: [113, 67], 90: [115, 68], 95: [116, 69] },
};

const fBP: Record<number, Record<number, [number, number]>> = {
  5: { 5: [95, 53], 25: [98, 55], 50: [100, 57], 75: [102, 59], 90: [103, 60], 95: [104, 61] },
  8: { 5: [99, 57], 25: [102, 59], 50: [104, 61], 75: [106, 63], 90: [107, 64], 95: [108, 65] },
  10: { 5: [101, 59], 25: [104, 61], 50: [106, 63], 75: [108, 65], 90: [109, 66], 95: [110, 67] },
  12: { 5: [103, 62], 25: [106, 64], 50: [108, 66], 75: [110, 68], 90: [111, 69], 95: [112, 70] },
};

export function BPClassificationCalc() {
  const [age, setAge] = useState(8);
  const [sex, setSex] = useState("m");
  const [htPct, setHtPct] = useState("50");
  const [sys, setSys] = useState(120);
  const [dia, setDia] = useState(78);

  const ageKey = [5, 8, 10, 12].reduce((a, b) => Math.abs(b - age) < Math.abs(a - age) ? b : a);
  const ref = (sex === "m" ? mBP : fBP)[ageKey]?.[parseInt(htPct)] || [100, 60];
  const p50s = ref[0];
  const p50d = ref[1];
  const p90s = p50s + 8;
  const p95s = p50s + 12;
  const p99s = p50s + 20;
  const p90d = p50d + 5;
  const p95d = p50d + 8;
  const p99d = p50d + 15;

  let cls = "";
  let color = "";
  let rec = "";
  if (sys < p90s && dia < p90d) {
    cls = "Normal";
    color = "text-green-400";
    rec = "BP normal. Monitor rutin tahunan.";
  } else if (sys < p95s && dia < p95d) {
    cls = "Elevated";
    color = "text-yellow-400";
    rec = "Elevated BP: ulangi pengukuran 6 bulan. Restriksi Na, aktivitas fisik.";
  } else if (sys <= p99s + 5 && dia <= p99d + 5) {
    cls = "HTN Stage 1";
    color = "text-orange-400";
    rec = "HTN Stage 1: konfirmasi 2 kunjungan berbeda. Lifestyle modification. HCTZ/Amlodipin bila tidak respons 6 bulan.";
  } else {
    cls = "HTN Stage 2";
    color = "text-red-400";
    rec = "HTN Stage 2: Inisiasi antihipertensi SEGERA. Evaluasi penyakit ginjal, jantung, endokrin. Pertimbangkan rawat inap bila simtomatik.";
  }

  return (
    <CalcCard title="Klasifikasi Tekanan Darah" subtitle="AAP 2017 — Normal, Elevasi, HTN Std 1 & 2" icon="💓" color="red">
      <div className="space-y-3">
        <InfoBox>AAP 2017: Normal &lt;P90; Elevated P90–P95; HTN Stage 1: P95–P99+5mmHg; HTN Stage 2: &gt;P99+5mmHg. Persentil berdasarkan usia, jenis kelamin, tinggi.</InfoBox>
        <div className="grid grid-cols-2 gap-3">
          <CalcInput label="Usia (thn)" value={age} onChange={(v) => setAge(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} max={17} />
          <CalcSelect label="Jenis Kelamin" value={sex} onChange={setSex} options={[{ value: "m", label: "Laki-laki" }, { value: "f", label: "Perempuan" }]} />
          <CalcSelect label="Persentil TB (%)" value={htPct} onChange={setHtPct} options={[{ value: "5", label: "P5" }, { value: "25", label: "P25" }, { value: "50", label: "P50" }, { value: "75", label: "P75" }, { value: "90", label: "P90" }, { value: "95", label: "P95" }]} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CalcInput label="Sistolik (mmHg)" unit="mmHg" value={sys} onChange={(v) => setSys(typeof v === "string" ? parseFloat(v) || 0 : v)} min={60} max={300} />
          <CalcInput label="Diastolik (mmHg)" unit="mmHg" value={dia} onChange={(v) => setDia(typeof v === "string" ? parseFloat(v) || 0 : v)} min={30} max={200} />
        </div>
        <CalcResult color="red">
          <ResultItem label="Klasifikasi" value={cls} className={color} />
          <ResultGrid cols={3}>
            <ResultItem label="P90" value={`${p90s}/${p90d}`} unit="mmHg" />
            <ResultItem label="P95" value={`${p95s}/${p95d}`} unit="mmHg" />
            <ResultItem label="P99" value={`${p99s}/${p99d}`} unit="mmHg" />
          </ResultGrid>
          <div className="rounded-lg bg-muted/50 border border-border px-3 py-2 text-xs text-muted-foreground leading-relaxed">
            TD Aktual: {sys}/{dia} mmHg<br />
            Referensi (usia {age}th, {sex === "m" ? "♂" : "♀"}, P{htPct} TB):<br />
            <strong>Rekomendasi:</strong> {rec}
          </div>
        </CalcResult>
      </div>
    </CalcCard>
  );
}
