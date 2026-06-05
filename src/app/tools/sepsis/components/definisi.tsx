"use client";

import { CalcCard, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

const comparisonData = [
  { aspect: "Sepsis", ip2005: "SIRS + infeksi", phoenix2024: "Infeksi + disfungsi organ" },
  { aspect: "Severe sepsis", ip2005: "Sepsis + disfungsi organ", phoenix2024: "Tidak digunakan lagi" },
  { aspect: "Septic shock", ip2005: "Sepsis + hipoperfusi", phoenix2024: "Sepsis + ≥1 disfungsi kardiovaskular" },
  { aspect: "Skor", ip2005: "Kriteria SIRS", phoenix2024: "Phoenix Sepsis Score" },
];

export function SepsisDefinisi() {
  return (
    <div className="space-y-3">
      <CalcCard title="Definisi & Terminologi" subtitle="Phoenix Criteria 2024 — digunakan dalam SSC 2026" icon="📖" color="red">
        <div className="space-y-3">
          <InfoBox>
            <strong>⚠️ Definisi Sepsis Anak (Baru 2024)</strong>
            <br />
            <strong>Sepsis</strong> = Infeksi + disfungsi organ yang mengancam jiwa, dioperasionalisasikan sebagai disfungsi sedang-berat pada ≥1 sistem berikut:
          </InfoBox>

          <CalcResult color="red">
            <div className="space-y-1 text-xs">
              <p className="font-semibold">Sistem Organ yang Dinilai (Phoenix Criteria):</p>
              <p>• 🫁 <strong>Respirasi</strong></p>
              <p>• ❤️ <strong>Kardiovaskular</strong></p>
              <p>• 🩸 <strong>Koagulasi</strong></p>
              <p>• 🧠 <strong>Neurologis</strong></p>
              <p className="mt-2 text-muted-foreground">→ Phoenix Sepsis Score (operasionalisasi resmi)</p>
            </div>
          </CalcResult>

          <InfoBox>
            <strong>⚡ Definisi Septic Shock</strong>
            <br />
            <strong>Septic Shock</strong> = Sepsis + ≥1 disfungsi kardiovaskular berupa:
            <br />
            • Hipotensi (TD &lt; persentil 5 sesuai usia)
            <br />
            • Hiperlaktatemia ≥ <strong>5 mmol/L</strong>
            <br />
            • Penggunaan obat vasoaktif
          </InfoBox>
        </div>
      </CalcCard>

      <CalcCard title="Populasi yang Dicakup Panduan" icon="📋" color="blue">
        <CalcResult>
          <ResultGrid cols={2}>
            <ResultItem label="Usia minimum" value="≥ 37 minggu gestasi saat lahir" />
            <ResultItem label="Usia maksimum" value="18 tahun" />
            <ResultItem label="Kelompok" value="Bayi, balita, anak usia sekolah, remaja" />
            <ResultItem label="Setting" value="RS, IGD, atau fasilitas perawatan akut" />
          </ResultGrid>
        </CalcResult>
      </CalcCard>

      <CalcCard title="Perbandingan IPSCC 2005 vs Phoenix 2024" icon="🔄" color="yellow">
        <CalcResult>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-semibold">Aspek</th>
                  <th className="text-left py-2 pr-3 font-semibold">IPSCC 2005</th>
                  <th className="text-left py-2 font-semibold">Phoenix 2024 / SSC 2026</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row) => (
                  <tr key={row.aspect} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.aspect}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{row.ip2005}</td>
                    <td className="py-2 text-green-400">{row.phoenix2024}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcResult>
      </CalcCard>

      <CalcCard title="Phoenix Sepsis Score Ringkasan" icon="📊" color="yellow">
        <InfoBox>
          Sistem skoring operasional yang menggantikan SIRS pada anak. Menilai 4 domain organ:
          <br />
          <strong>Respirasi</strong>: SpO₂/FiO₂, PaO₂/FiO₂, ventilasi mekanik
          <br />
          <strong>Kardiovaskular</strong>: laktat, vasoaktif, MAP vs persentil usia
          <br />
          <strong>Koagulasi</strong>: platelet, INR, D-dimer, fibrinogen
          <br />
          <strong>Neurologis</strong>: GCS, pupil reaktif
        </InfoBox>
        <CalcResult color="yellow">
          <ResultGrid cols={2}>
            <ResultItem label="Sepsis" value="Phoenix score ≥ 2" />
            <ResultItem label="Septic Shock" value="Sepsis + ≥1 poin kardiovaskular" />
          </ResultGrid>
        </CalcResult>
      </CalcCard>
    </div>
  );
}
