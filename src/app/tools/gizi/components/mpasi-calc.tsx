"use client";

import { useState } from "react";
import { CalcCard, CalcSelect, CalcResult, InfoBox } from "../../components/calc-ui";

const mpasiData: Record<string, { title: string; texture: string; portion: string; freq: string; notes: string[] }> = {
  "6": {
    title: "6 Bulan — Awal MPASI",
    texture: "Bubur halus/puree (saring halus)",
    portion: "2-3 sdm → tingkatkan bertahap hingga ½ mangkuk (125 mL)",
    freq: "2-3× makan utama + ASI sesering mungkin",
    notes: [
      "Mulai dengan 1 bahan makanan → tunggu 3-5 hari → tambah bahan baru",
      "Hindari: garam, gula, madu, susu sapi cair",
    ],
  },
  "7": {
    title: "7-8 Bulan",
    texture: "Bubur kental, puree, cincang halus",
    portion: "½ mangkuk (125 mL) per makan",
    freq: "2-3× makan + 1-2 selingan + ASI",
    notes: ["Variasikan: sereal, sayur, buah, protein (daging, tahu, telur, ikan)"],
  },
  "9": {
    title: "9-11 Bulan",
    texture: "Cincang kasar / finger food / dipotong kecil",
    portion: "¾ mangkuk (175 mL) per makan",
    freq: "3× makan + 2 selingan + ASI",
    notes: ["Latih self-feeding. Perkenalkan anggota keluarga baru"],
  },
  "12": {
    title: "12-23 Bulan",
    texture: "Makanan keluarga yang dipotong kecil",
    portion: "1 mangkuk penuh (250 mL) per makan",
    freq: "3 makan + 2 selingan + ASI",
    notes: [
      "Kebutuhan energi dari MPASI: 500-700 kkal/hari",
      "Jangan paksa makan. Buat makanan berwarna dan bervariasi",
    ],
  },
  "24": {
    title: "24+ Bulan — Makan Bersama Keluarga",
    texture: "Makanan keluarga (perhatikan konsistensi dan rasa)",
    portion: "Sesuai kebutuhan",
    freq: "3 makan utama + 2 selingan",
    notes: [
      "Minum air putih sebagai minuman utama",
      'Terapkan "division of responsibility" Ellyn Satter: orang tua menyediakan WHAT & WHEN, anak memutuskan BERAPA BANYAK',
    ],
  },
};

const ageOptions = [
  { value: "6", label: "6 bulan (awal MPASI)" },
  { value: "7", label: "7-8 bulan" },
  { value: "9", label: "9-11 bulan" },
  { value: "12", label: "12-23 bulan" },
  { value: "24", label: "24+ bulan (makan keluarga)" },
];

export function MPASICalc() {
  const [age, setAge] = useState("6");
  const d = mpasiData[age] || mpasiData["6"];

  return (
    <CalcCard title="MPASI Guidelines" subtitle="Panduan Makanan Pendamping ASI — WHO 2023" icon="🥣" color="yellow">
      <div className="space-y-3">
        <CalcSelect label="Usia Bayi" value={age} onChange={setAge} options={ageOptions} />
        <CalcResult color="yellow">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{d.title}</h4>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider">Tekstur</span>
                <p className="mt-0.5">{d.texture}</p>
              </div>
              <div>
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider">Porsi</span>
                <p className="mt-0.5">{d.portion}</p>
              </div>
              <div>
                <span className="text-muted-foreground uppercase text-[10px] tracking-wider">Frekuensi</span>
                <p className="mt-0.5">{d.freq}</p>
              </div>
            </div>
          </div>
        </CalcResult>
        <InfoBox>
          {d.notes.map((n, i) => (
            <span key={i}>{n}{i < d.notes.length - 1 ? <br /> : ""}</span>
          ))}
        </InfoBox>
      </div>
    </CalcCard>
  );
}
