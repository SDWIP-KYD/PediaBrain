"use client";

import { CalcCard, CalcResult, ResultGrid, ResultItem, InfoBox, ResultAlert } from "../../components/calc-ui";

const vitalSigns = [
  { age: "0–1 bulan", tachycardia: ">180", bradycardia: "<100", tachypnea: ">50", hypotension: "<60" },
  { age: "1–12 bulan", tachycardia: ">180", bradycardia: "<90", tachypnea: ">40", hypotension: "<70" },
  { age: "1–5 tahun", tachycardia: ">140", bradycardia: "–", tachypnea: ">34", hypotension: "<75" },
  { age: "6–12 tahun", tachycardia: ">130", bradycardia: "–", tachypnea: ">22", hypotension: "<83" },
  { age: "12–18 tahun", tachycardia: ">110", bradycardia: "–", tachypnea: ">18", hypotension: "<90" },
];

const coldWarmData = [
  { feature: "Ekstremitas", cold: "Dingin, mottled", warm: "Hangat, merah" },
  { feature: "CRT", cold: "> 2 detik", warm: "Flash (<1 detik)" },
  { feature: "Nadi", cold: "Lemah, filiformis", warm: "Kuat, bounding" },
  { feature: "TD", cold: "Rendah / normal", warm: "Rendah, pulse pressure lebar" },
  { feature: "Urine", cold: "Oliguria", warm: "Bisa normal awal" },
  { feature: "Lebih sering pada", cold: "Anak (dominan)", warm: "Dewasa, early sepsis" },
];

const organManifestations = [
  { system: "Respirasi", symptoms: "Takipnea, distres napas, SpO₂ ↓, retraksi" },
  { system: "Kardiovaskular", symptoms: "Takikardia, hipotensi, CRT panjang, gallop" },
  { system: "Neurologis", symptoms: "Agitasi/somnolen, GCS ↓, kejang" },
  { system: "Ginjal", symptoms: "Oliguria, edema, kreatinin ↑" },
  { system: "Koagulasi", symptoms: "Petechiae, purpura, perdarahan spontan" },
  { system: "GI", symptoms: "Ileus, hepatomegali, ikterus" },
  { system: "Metabolik", symptoms: "Hipoglikemia, hipokalsemia, asidosis" },
];

export function SepsisKlinis() {
  return (
    <div className="space-y-3">
      <CalcCard title="Manifestasi Klinis" subtitle="Tanda & gejala sepsis dan septic shock pada anak" icon="🩺" color="blue">
        <InfoBox>
          <strong>⚡ Red Flags — Kenali Segera!</strong>
          <br />
          • Demam tinggi atau hipotermia (bayi)
          <br />
          • Takikardia tidak sesuai keadaan klinis
          <br />
          • Capillary refill time &gt; 2 detik
          <br />
          • Perubahan status mental / penurunan kesadaran
          <br />
          • Oliguria atau anuria
          <br />
          • Petechiae / purpura
          <br />
          • Neonatus: letargi, malas minum, tidak mau menangis
        </InfoBox>
      </CalcCard>

      <CalcCard title="Tanda Vital per Usia" icon="📊" color="red">
        <CalcResult>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-semibold">Usia</th>
                  <th className="text-left py-2 pr-3 font-semibold">Takikardia (HR)</th>
                  <th className="text-left py-2 pr-3 font-semibold">Bradikardi</th>
                  <th className="text-left py-2 pr-3 font-semibold">Takipnea (RR)</th>
                  <th className="text-left py-2 font-semibold">Hipotensi (SBP)</th>
                </tr>
              </thead>
              <tbody>
                {vitalSigns.map((row) => (
                  <tr key={row.age} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.age}</td>
                    <td className="py-2 pr-3 text-red-400">{row.tachycardia}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{row.bradycardia}</td>
                    <td className="py-2 pr-3 text-orange-400">{row.tachypnea}</td>
                    <td className="py-2 text-red-400">{row.hypotension}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcResult>
      </CalcCard>

      <CalcCard title="Cold Shock vs Warm Shock" icon="🌡️" color="green">
        <CalcResult>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-semibold">Fitur</th>
                  <th className="text-left py-2 pr-3 font-semibold">Cold Shock (↓ CO)</th>
                  <th className="text-left py-2 font-semibold">Warm Shock (↓ SVR)</th>
                </tr>
              </thead>
              <tbody>
                {coldWarmData.map((row) => (
                  <tr key={row.feature} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.feature}</td>
                    <td className="py-2 pr-3 text-blue-400">{row.cold}</td>
                    <td className="py-2 text-orange-400">{row.warm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcResult>
      </CalcCard>

      <CalcCard title="Manifestasi Klinis Berdasarkan Organ" icon="🫁" color="purple">
        <CalcResult>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-semibold">Sistem</th>
                  <th className="text-left py-2 font-semibold">Gejala / Tanda</th>
                </tr>
              </thead>
              <tbody>
                {organManifestations.map((row) => (
                  <tr key={row.system} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.system}</td>
                    <td className="py-2 text-muted-foreground">{row.symptoms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcResult>
      </CalcCard>

      <CalcCard title="Khusus Neonatus & Bayi Muda" icon="👶" color="pink">
        <InfoBox>
          <strong>🧒 Khusus Neonatus & Bayi Muda</strong>
          <br />
          • Gejala sering tidak spesifik: malas minum, letargi
          <br />
          • Demam mungkin tidak ada — hipotermia lebih sering
          <br />
          • Bulging fontanel → meningitis
          <br />
          • Kuning mendadak, apnea berulang
          <br />
          • Threshold curiga lebih rendah → evaluasi segera
        </InfoBox>
      </CalcCard>
    </div>
  );
}
