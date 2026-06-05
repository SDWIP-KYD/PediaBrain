"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

const sexOptions = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
];

const condOptions = [
  { value: "healthy", label: "Sehat / ambulan" },
  { value: "sedentary", label: "Bed-rest (tirah baring)" },
  { value: "surgery", label: "Pasca operasi ringan" },
  { value: "infection", label: "Infeksi sedang (1.2x)" },
  { value: "sepsis", label: "Sepsis / PICU (1.3x)" },
  { value: "burn30", label: "Luka bakar 30% (1.5x)" },
  { value: "burn50", label: "Luka bakar 50%+ (1.75x)" },
  { value: "catchup", label: "Catch-up growth" },
];

const palOptions = [
  { value: "1.2", label: "1.2 — Bed rest / ICU" },
  { value: "1.4", label: "1.4 — Ringan (anak kecil rawat jalan)" },
  { value: "1.6", label: "1.6 — Sedang (aktif bermain)" },
  { value: "1.8", label: "1.8 — Tinggi (olahraga rutin)" },
  { value: "2.0", label: "2.0 — Sangat aktif / atlet" },
];

const stressMap: Record<string, number> = {
  healthy: 1.0, sedentary: 0.9, surgery: 1.1, infection: 1.2,
  sepsis: 1.3, burn30: 1.5, burn50: 1.75, catchup: 1.3,
};

export function CalorieCalc() {
  const { weightGram, heightCm, ageMonths, sex } = usePatient();
  const [weight, setWeight] = useState(weightGram / 1000);
  const [height, setHeight] = useState(heightCm);
  const [age, setAge] = useState(ageMonths);
  const [selectedSex, setSelectedSex] = useState<"L" | "P">(sex);
  const [cond, setCond] = useState("healthy");
  const [pal, setPal] = useState("1.4");

  const ageYr = age / 12;

  let schofield = 0;
  if (selectedSex === "L") {
    if (ageYr < 3) schofield = Math.round(59.512 * weight - 30.4);
    else if (ageYr < 10) schofield = Math.round(22.706 * weight + 504.3);
    else if (ageYr < 18) schofield = Math.round(17.686 * weight + 658.2);
    else schofield = Math.round(15.057 * weight + 692.2);
  } else {
    if (ageYr < 3) schofield = Math.round(58.317 * weight - 31.1);
    else if (ageYr < 10) schofield = Math.round(20.315 * weight + 485.9);
    else if (ageYr < 18) schofield = Math.round(13.384 * weight + 692.6);
    else schofield = Math.round(14.818 * weight + 486.6);
  }

  let whoRee = 0;
  if (selectedSex === "L") {
    if (ageYr < 3) whoRee = Math.round(60.9 * weight - 54);
    else if (ageYr < 10) whoRee = Math.round(22.7 * weight + 495);
    else if (ageYr < 18) whoRee = Math.round(17.5 * weight + 651);
    else whoRee = Math.round(15.3 * weight + 679);
  } else {
    if (ageYr < 3) whoRee = Math.round(61.0 * weight - 51);
    else if (ageYr < 10) whoRee = Math.round(22.5 * weight + 499);
    else if (ageYr < 18) whoRee = Math.round(12.2 * weight + 746);
    else whoRee = Math.round(14.7 * weight + 496);
  }

  const sf = stressMap[cond] || 1.0;
  const palVal = parseFloat(pal) || 1.4;
  const tee = Math.round(schofield * sf * palVal);
  const perKg = weight > 0 ? Math.round(tee / weight * 10) / 10 : 0;

  let category: { label: string; color: string };
  if (perKg < 60) category = { label: "Rendah", color: "text-yellow-400" };
  else if (perKg <= 80) category = { label: "Sedang", color: "text-green-400" };
  else category = { label: "Tinggi", color: "text-orange-400" };

  return (
    <CalcCard title="Kebutuhan Energi Total (TEE)" subtitle="Schofield + WHO REE + Faktor Stres + PAL" icon="🔥">
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <CalcInput label="BB (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.5} step={0.1} />
          <CalcInput label="TB (cm)" unit="cm" value={height} onChange={(v) => setHeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={30} />
          <CalcInput label="Usia (bulan)" unit="bln" value={age} onChange={(v) => setAge(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={228} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CalcSelect label="Jenis Kelamin" value={selectedSex} onChange={(v) => setSelectedSex(v as "L" | "P")} options={sexOptions} />
          <CalcSelect label="Kondisi klinis" value={cond} onChange={setCond} options={condOptions} />
        </div>
        <CalcSelect label="Tingkat aktivitas fisik (PAL)" value={pal} onChange={setPal} options={palOptions} />
        <CalcResult>
          <ResultGrid cols={3}>
            <ResultItem label="Schofield REE" value={schofield} unit="kcal/hari" className="text-orange-400" />
            <ResultItem label="WHO REE" value={whoRee} unit="kcal/hari" />
            <ResultItem label="TEE (dengan faktor)" value={tee} unit="kcal/hari" className="text-emerald-500" />
          </ResultGrid>
          <ResultGrid cols={3}>
            <ResultItem label="Per kg BB" value={perKg} unit="kcal/kg/hari" />
            <ResultItem label="Faktor stres" value={`${sf}x`} />
            <ResultItem label="Faktor PAL" value={`${palVal}x`} />
          </ResultGrid>
          <ResultGrid cols={3}>
            <ResultItem label="Kategori" value={category.label} className={category.color} />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          TEE = Schofield REE ({schofield} kcal) x Stres ({sf}) x PAL ({palVal}) = {tee} kcal/hari.
          {cond === "catchup" ? " Catch-up growth: gunakan IBW untuk target kalori. Target 120-150 kcal/kg IBW." : ""}
          {cond === "burn30" || cond === "burn50" ? " Luka bakar: Curreri formula alternatif. Monitor nitrogen balance." : ""}
        </InfoBox>
      </div>
    </CalcCard>
  );
}
