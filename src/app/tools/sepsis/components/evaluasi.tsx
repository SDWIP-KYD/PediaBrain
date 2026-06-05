"use client";

import { CalcCard, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

const hemodynamicTargets = [
  { parameter: "Heart Rate", target: "↓ Normal", desc: "Sesuai usia" },
  { parameter: "Tekanan Darah", target: "≥P50", desc: "MAP sesuai usia" },
  { parameter: "Capillary Refill", target: "≤2 dtk", desc: "Perfusi perifer" },
  { parameter: "Urine Output", target: ">1 mL/kg/j", desc: "Target diuresis" },
  { parameter: "Laktat", target: "<2 mmol/L", desc: "Clearance laktat" },
  { parameter: "ScvO₂", target: "≥70%", desc: "Jika CVC tersedia" },
];

const ecmoData = [
  { modality: "VV-ECMO", indication: "Hipoksemia refrakter meski terapi lain maksimal" },
  { modality: "VA-ECMO", indication: "Septic shock refrakter semua terapi (rescue only)" },
];

const rehabData = [
  { recommendation: "Rehabilitasi dini", detail: "✅ Bundle rehabilitasi individual sejak fase akut (rekomendasi kondisional)" },
  { recommendation: "Nilai faktor risiko", detail: "Identifikasi risiko morbiditas post-sepsis saat discharge" },
  { recommendation: "Edukasi keluarga", detail: "Informasikan gejala post-sepsis syndrome kepada pasien, keluarga, dan klinisi" },
  { recommendation: "Evaluasi post-discharge", detail: "Cari sekuele baru jangka panjang setelah pulang" },
  { recommendation: "Follow-up terstruktur", detail: "Bukti belum cukup untuk rekomendasi rutin (disesuaikan kasus)" },
];

const recommendationStrength = [
  { rec: "Program peningkatan performa RS", strength: "Kuat", color: "text-green-400" },
  { rec: "Ukur laktat darah", strength: "Kuat", color: "text-green-400" },
  { rec: "Antibiotik <1 jam (shock)", strength: "Kuat", color: "text-green-400" },
  { rec: "Hindari bolus (tanpa ICU, tanpa hipotensi)", strength: "Kuat", color: "text-green-400" },
  { rec: "Cabut IV line sumber infeksi", strength: "Kuat", color: "text-green-400" },
  { rec: "Balanced crystalloid vs NaCl 0,9%", strength: "Kondisional", color: "text-blue-400" },
  { rec: "Vasoaktif via perifer", strength: "Kondisional", color: "text-blue-400" },
  { rec: "SpO₂ target 88–92%", strength: "Kondisional", color: "text-blue-400" },
  { rec: "Hindari etomidate", strength: "Kondisional", color: "text-blue-400" },
  { rec: "Rehabilitasi dini", strength: "Kondisional", color: "text-blue-400" },
];

export function SepsisEvaluasi() {
  return (
    <div className="space-y-3">
      <CalcCard title="Parameter Monitoring Hemodinamik" icon="📊" color="yellow">
        <CalcResult>
          <ResultGrid cols={2}>
            {hemodynamicTargets.map((item) => (
              <ResultItem key={item.parameter} label={item.parameter} value={item.target} note={item.desc} />
            ))}
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          Monitor secara <strong>berkelanjutan</strong>: HR, TD, CRT, suhu ekstremitas, kualitas nadi, kesadaran (GCS), urine output. Gunakan <strong>POCUS</strong> untuk panduan resusitasi jika tersedia.
        </InfoBox>
      </CalcCard>

      <CalcCard title="De-eskalasi Antibiotik" icon="🔄" color="green">
        <div className="space-y-2">
          <div className="rounded-lg border border-border p-3 text-xs">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Langkah 1</p>
            <p>Kultur tersedia + sensitivitas diketahui → <strong>pertimbangkan de-eskalasi atau penyempitan cakupan</strong></p>
          </div>
          <p className="text-center text-muted-foreground text-xs">↓</p>
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 border-dashed p-3 text-xs">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Langkah 2</p>
            <p>Tidak ada patogen teridentifikasi → <strong>evaluasi klinis</strong> + konsultasi ID/mikrobiologi → pertimbangkan <strong>hentikan antibiotik</strong></p>
          </div>
          <p className="text-center text-muted-foreground text-xs">↓</p>
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Catatan</p>
            <p>Procalcitonin (PCT): <strong>tidak</strong> rutin digunakan untuk panduan de-eskalasi jika sudah ada program stewardship yang efektif</p>
          </div>
        </div>
      </CalcCard>

      <CalcCard title="Manajemen Cairan Fase Lanjut" icon="💧" color="blue">
        <InfoBox>
          Setelah hemodinamik stabil:
          <br />
          • Cegah <strong>fluid overload</strong> — pantau total intake
          <br />
          • Pertimbangkan <strong>de-resusitasi aktif</strong> (diuretik/UF)
          <br />
          • Monitor ketat: jangan sampai compromising perfusi organ
          <br />
          • RRT jika diperlukan → gunakan <strong>hemofiltripsi volume tinggi</strong> (&gt;35 mL/kg/jam)
        </InfoBox>
      </CalcCard>

      <CalcCard title="ECMO — Rescue Therapy" icon="🫀" color="purple">
        <CalcResult>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-semibold">Modalitas</th>
                  <th className="text-left py-2 font-semibold">Indikasi</th>
                </tr>
              </thead>
              <tbody>
                {ecmoData.map((row) => (
                  <tr key={row.modality} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.modality}</td>
                    <td className="py-2 text-muted-foreground">{row.indication}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcResult>
      </CalcCard>

      <CalcCard title="Rehabilitasi & Follow-up Jangka Panjang" icon="🆕" color="orange">
        <InfoBox>
          <strong>⚠️ Post-Sepsis Syndrome</strong>
          <br />
          Hingga <strong>30–40%</strong> anak yang selamat dari sepsis berat (butuh ICU) mengalami morbiditas jangka panjang: gangguan kognitif, fisik, emosional, dan kualitas hidup.
        </InfoBox>
        <CalcResult>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-semibold">Rekomendasi</th>
                  <th className="text-left py-2 font-semibold">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {rehabData.map((row) => (
                  <tr key={row.recommendation} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.recommendation}</td>
                    <td className="py-2 text-muted-foreground">{row.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcResult>
      </CalcCard>

      <CalcCard title="Ringkasan Kekuatan Rekomendasi Kunci" icon="📋" color="green">
        <CalcResult color="green">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-semibold">Rekomendasi</th>
                  <th className="text-left py-2 font-semibold">Kekuatan</th>
                </tr>
              </thead>
              <tbody>
                {recommendationStrength.map((row) => (
                  <tr key={row.rec} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.rec}</td>
                    <td className={`py-2 font-semibold ${row.color}`}>{row.strength}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcResult>
      </CalcCard>
    </div>
  );
}
