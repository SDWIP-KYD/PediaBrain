"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox } from "../../components/calc-ui";

const neonatalWeightRanges = [
  { weight: "< 1 kg", ett: "2.5", depth: "6.5-7", ngt: "5", suction: "5", catheter: "5" },
  { weight: "1-2 kg", ett: "3.0", depth: "7-8", ngt: "5-6", suction: "6", catheter: "6" },
  { weight: "2-3 kg", ett: "3.0-3.5", depth: "8-9", ngt: "6-8", suction: "6-8", catheter: "6-8" },
  { weight: "> 3 kg", ett: "3.5-4.0", depth: "9-10", ngt: "8", suction: "8", catheter: "8" },
];

export function EquipmentCalc() {
  const { weightGram, ageYears } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [age, setAge] = useState(ageYears);
  const [ettType, setEttType] = useState("uncuffed");

  const yrs = age;
  const isNeonate = yrs < 1 && w < 5;

  // ETT calculation
  let ettSize = 0;
  let ettAlt = "";
  let ettDepthOral = 0;
  let ettDepthNasal = 0;
  let suctionFr = 0;
  let bladeSize = "";

  if (isNeonate) {
    if (w < 1) ettSize = 2.5;
    else if (w < 3) ettSize = 3.0;
    else ettSize = 3.5;
    ettDepthOral = +(w + 6).toFixed(1);
    ettDepthNasal = +(w + 8).toFixed(1);
  } else if (yrs >= 1) {
    if (ettType === "uncuffed") {
      ettSize = +((yrs / 4) + 4).toFixed(1);
    } else {
      ettSize = +((yrs / 4) + 3.5).toFixed(1);
    }
    ettDepthOral = +(ettSize * 3).toFixed(1);
    ettDepthNasal = +(ettDepthOral + 2).toFixed(1);
  }

  ettAlt = `${(ettSize - 0.5).toFixed(1)} / ${(ettSize + 0.5).toFixed(1)} mm`;
  suctionFr = Math.round(ettSize * 2);

  if (yrs < 1) bladeSize = "Miller 0-1";
  else if (yrs < 6) bladeSize = "Miller 1 / Macintosh 0";
  else if (yrs < 12) bladeSize = "Macintosh 2";
  else bladeSize = "Macintosh 2-3";

  // NGT calculation
  let ngtSize = "";
  let ngtNote = "";
  if (yrs < 0.083) { ngtSize = "5-6 Fr"; ngtNote = "NGT sangat kecil untuk neonatus"; }
  else if (yrs < 1) { ngtSize = "6-8 Fr"; ngtNote = "Bayi: feeding tube"; }
  else if (yrs < 6) { ngtSize = "8-10 Fr"; ngtNote = "Anak kecil"; }
  else if (yrs < 12) { ngtSize = "10-12 Fr"; ngtNote = "Anak sekolah"; }
  else { ngtSize = "12-16 Fr"; ngtNote = "Adolesen/dewasa muda"; }

  // IV cannula calculation
  let ivSize = "";
  let ivColor = "";
  let ivNote = "";
  if (yrs < 0.083) { ivSize = "26 G"; ivColor = "Ungu"; ivNote = "Prematur - sangat kecil"; }
  else if (yrs < 1) { ivSize = "24 G"; ivColor = "Kuning"; ivNote = "Neonatus/bayi - vena kecil"; }
  else if (yrs < 6) { ivSize = "22-24 G"; ivColor = "Biru/Kuning"; ivNote = "Anak kecil"; }
  else if (yrs < 12) { ivSize = "20-22 G"; ivColor = "Hijau/Biru"; ivNote = "Anak sekolah"; }
  else { ivSize = "18-20 G"; ivColor = "Merah/Hijau"; ivNote = "Adolesen - resusitasi"; }

  // Foley catheter
  let foleySize = "";
  if (yrs < 1) foleySize = "5-6 Fr";
  else if (yrs < 4) foleySize = "6-8 Fr";
  else if (yrs < 8) foleySize = "8-10 Fr";
  else foleySize = "10-12 Fr";

  // LMA
  let lmaSize = "";
  if (w < 5) lmaSize = "1";
  else if (w < 10) lmaSize = "1.5";
  else if (w < 20) lmaSize = "2";
  else if (w < 30) lmaSize = "2.5";
  else lmaSize = "3";

  return (
    <CalcCard title="Kalkulator Alat" subtitle="ETT, NGT, IV, Foley sizing" icon="📏" color="blue">
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
        <CalcInput label="Usia (tahun)" value={age} onChange={(v) => setAge(v as number)} step={0.5} />
        <CalcSelect label="Jenis ETT" value={ettType} onChange={setEttType} options={[
          { value: "uncuffed", label: "Uncuffed" },
          { value: "cuffed", label: "Cuffed" },
        ]} />
      </div>

      <CalcResult color="blue">
        <ResultGrid cols={2}>
          <ResultItem label="ETT Size" value={`${ettSize}`} unit="mm ID" note={ettAlt} />
          <ResultItem label="Kedalaman Bibir" value={`${ettDepthOral}`} unit="cm" note="Oral intubation" />
        </ResultGrid>
        <ResultGrid cols={2}>
          <ResultItem label="Kedalaman Nares" value={`${ettDepthNasal}`} unit="cm" note="Nasal intubation" />
          <ResultItem label="Suction" value={`${suctionFr}`} unit="Fr" note={`Blade: ${bladeSize}`} />
        </ResultGrid>
        <ResultGrid cols={2}>
          <ResultItem label="NGT/OGT" value={ngtSize} note={ngtNote} />
          <ResultItem label="IV Cannula" value={ivSize} note={`${ivColor} — ${ivNote}`} />
        </ResultGrid>
        <ResultGrid cols={2}>
          <ResultItem label="Foley Catheter" value={foleySize} note="Kateter urin" />
          <ResultItem label="LMA" value={`Ukuran ${lmaSize}`} note="Sungkup laring" />
        </ResultGrid>
      </CalcResult>

      {isNeonate && (
        <InfoBox>
          <strong>Tabel Neonatus (berbasis berat lahir):</strong>
          <div className="mt-1 overflow-x-auto">
            <table className="w-full text-[10px] font-mono border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-0.5 pr-2">BB Lahir</th>
                  <th className="text-left py-0.5 pr-2">ETT (mm)</th>
                  <th className="text-left py-0.5 pr-2">Kedalaman</th>
                  <th className="text-left py-0.5 pr-2">NGT (Fr)</th>
                  <th className="text-left py-0.5">Suction (Fr)</th>
                </tr>
              </thead>
              <tbody>
                {neonatalWeightRanges.map((r, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-0.5 pr-2">{r.weight}</td>
                    <td className="py-0.5 pr-2">{r.ett}</td>
                    <td className="py-0.5 pr-2">{r.depth} cm</td>
                    <td className="py-0.5 pr-2">{r.ngt}</td>
                    <td className="py-0.5">{r.suction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InfoBox>
      )}

      <InfoBox>
        <strong>Referensi:</strong> ETT uncuffed = (usia/4)+4 mm; cuffed = (usia/4)+3.5 mm. Kedalaman oral = ID × 3 cm.
        NGT diukur dari ujung hidung → daun telinga → prosesus xifoid (NEMU). Resusitasi: gunakan ukuran terbesar yang muat / IO.
      </InfoBox>
    </CalcCard>
  );
}
