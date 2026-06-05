"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox, ResultAlert } from "../../components/calc-ui";

const ageGroups = [
  { value: "neonate", label: "Neonatus (0-28 hari)" },
  { value: "infant", label: "Bayi (1-12 bulan)" },
  { value: "toddler", label: "Toddler (1-3 tahun)" },
  { value: "child", label: "Anak (4-12 tahun)" },
  { value: "adolescent", label: "Adolesen (13-18 tahun)" },
];

const cellCountRef: Record<string, { wbc: string; pmn: string; lym: string; protein: string; glucose: string }> = {
  neonate: { wbc: "0-30", pmn: "≤80%", lym: "≥20%", protein: "20-170", glucose: "30-120 (50-80% GDS)" },
  infant: { wbc: "0-20", pmn: "≤60%", lym: "≥40%", protein: "20-70", glucose: "40-80 (60-80% GDS)" },
  toddler: { wbc: "0-10", pmn: "≤30%", lym: "≥70%", protein: "15-45", glucose: "50-80 (60-80% GDS)" },
  child: { wbc: "0-5", pmn: "≤15%", lym: "≥85%", protein: "15-45", glucose: "50-80 (60-80% GDS)" },
  adolescent: { wbc: "0-5", pmn: "≤15%", lym: "≥85%", protein: "15-45", glucose: "50-80 (60-80% GDS)" },
};

const pathogenPatterns: Record<string, string[]> = {
  neonate: ["GBS", "E. coli", "Listeria monocytogenes", "Klebsiella", "Group B Streptococcus"],
  infant: ["S. pneumoniae", "N. meningitidis", "H. influenzae type b", "GBS (late-onset)"],
  toddler: ["S. pneumoniae", "N. meningitidis", "H. influenzae type b", "Enterovirus"],
  child: ["S. pneumoniae", "N. meningitidis", "Enterovirus", "HSV (immunocompromised)"],
  adolescent: ["N. meningitidis", "S. pneumoniae", "Enterovirus", "HSV"],
};

export function CSFCalc() {
  const { weightGram, ageYears } = usePatient();
  const [w, setW] = useState(weightGram / 1000);
  const [ageGroup, setAgeGroup] = useState("child");
  const [csfGlu, setCSFGlu] = useState(45);
  const [bloodGlu, setBloodGlu] = useState(90);
  const [csfPro, setCSFPro] = useState(80);
  const [wbc, setWbc] = useState(50);
  const [pmn, setPmn] = useState(70);
  const [rbc, setRbc] = useState(0);
  const [openingPressure, setOpeningPressure] = useState(120);
  const [gramStain, setGramStain] = useState("negatif");

  const ratio = bloodGlu > 0 ? +(csfGlu / bloodGlu).toFixed(2) : 0;

  let glucoseStatus = "";
  let glucoseType: "success" | "warning" | "danger" = "success";
  if (ratio < 0.4) { glucoseStatus = "Sangat Rendah"; glucoseType = "danger"; }
  else if (ratio < 0.5) { glucoseStatus = "Rendah"; glucoseType = "danger"; }
  else if (ratio < 0.6) { glucoseStatus = "Borderline"; glucoseType = "warning"; }
  else { glucoseStatus = "Normal"; glucoseType = "success"; }

  let proteinStatus = "";
  let proteinType: "success" | "warning" | "danger" = "success";
  if (csfPro > 200) { proteinStatus = "Sangat Tinggi"; proteinType = "danger"; }
  else if (csfPro > 100) { proteinStatus = "Tinggi"; proteinType = "danger"; }
  else if (csfPro > 45) { proteinStatus = "Sedikit Tinggi"; proteinType = "warning"; }
  else { proteinStatus = "Normal"; proteinType = "success"; }

  let wbcStatus = "";
  let wbcType: "success" | "warning" | "danger" = "success";
  const wbcRef = cellCountRef[ageGroup];
  const wbcMax = parseInt(wbcRef.wbc.split("-")[1] || "5");
  if (wbc > 1000) { wbcStatus = "Sangat Tinggi (bakterial?)"; wbcType = "danger"; }
  else if (wbc > wbcMax) { wbcStatus = "Tinggi"; wbcType = "warning"; }
  else { wbcStatus = "Normal"; wbcType = "success"; }

  let pressureStatus = "";
  let pressureType: "success" | "warning" | "danger" = "success";
  if (openingPressure > 250) { pressureStatus = "Sangat Tinggi (↑↑ ICP)"; pressureType = "danger"; }
  else if (openingPressure > 180) { pressureStatus = "Tinggi"; pressureType = "warning"; }
  else if (openingPressure < 60) { pressureStatus = "Rendah"; pressureType = "warning"; }
  else { pressureStatus = "Normal"; pressureType = "success"; }

  let interpretation = "";
  let interpType: "danger" | "warning" | "success" | "info" = "info";
  if (wbc > 1000 && pmn > 80 && ratio < 0.5 && csfPro > 100 && gramStain === "positif") {
    interpretation = "Meningitis bakterial — Empiris antibiotics SEGERA: Ampisilin + Ceftriaxone ± Deksametason.";
    interpType = "danger";
  } else if (wbc > 1000 && pmn > 80 && ratio < 0.5) {
    interpretation = "Polimorfonuklear tinggi, ratio rendah — Meningitis bakterial sangat mungkin. Mulai empiris ABX.";
    interpType = "danger";
  } else if (wbc >= 10 && wbc <= 300 && (pmn < 50 || wbc < 50) && ratio >= 0.5) {
    interpretation = "Limfosit dominan, ratio normal — Meningitis viral. OAT negatif. Supportif therapy.";
    interpType = "info";
  } else if (wbc >= 100 && wbc <= 500 && pmn < 50 && csfPro > 100 && ratio < 0.6) {
    interpretation = "Protein tinggi, limfosit, ratio rendah — DDx: TBC meningitis, jamur. Pemeriksaan kultur AFB;";
    interpType = "warning";
  } else if (ratio >= 0.6 && csfPro <= 45 && wbc <= wbcMax && openingPressure <= 180) {
    interpretation = "Hasil CSF normal. Evaluasi ulang bila klinis memburuk.";
    interpType = "success";
  } else {
    interpretation = "Perlu interpretasi korelasi klinis. Pertimbangkan kultur, PCR, dan tes tambahan.";
    interpType = "info";
  }

  const pathogens = pathogenPatterns[ageGroup];

  return (
    <CalcCard title="Analisis CSF" subtitle="Lumbar puncture interpretation & cell count" icon="🧪" color="teal">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <CalcInput label="BB (kg)" value={w} onChange={(v) => setW(v as number)} step={0.5} />
          <CalcSelect label="Kelompok Usia" value={ageGroup} onChange={setAgeGroup} options={ageGroups} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <CalcInput label="CSF Glukosa (mg/dL)" value={csfGlu} onChange={(v) => setCSFGlu(v as number)} />
          <CalcInput label="Blood Glukosa (GDS)" value={bloodGlu} onChange={(v) => setBloodGlu(v as number)} />
          <CalcInput label="CSF Protein (mg/dL)" value={csfPro} onChange={(v) => setCSFPro(v as number)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <CalcInput label="WBC (/µL)" value={wbc} onChange={(v) => setWbc(v as number)} />
          <CalcInput label="PMN (%)" value={pmn} onChange={(v) => setPmn(v as number)} />
          <CalcInput label="RBC (/µL)" value={rbc} onChange={(v) => setRbc(v as number)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CalcInput label="Opening Pressure (mmH₂O)" value={openingPressure} onChange={(v) => setOpeningPressure(v as number)} />
          <CalcSelect label="Gram Stain" value={gramStain} onChange={setGramStain} options={[
            { value: "negatif", label: "Negatif" },
            { value: "positif", label: "Positif" },
            { value: "belum", label: "Belum / Pending" },
          ]} />
        </div>
      </div>

      <CalcResult color="teal">
        <ResultGrid cols={2}>
          <ResultItem label="Rasio CSF/GDS" value={`${ratio}`} unit="" note={glucoseStatus} />
          <ResultItem label="Protein" value={`${csfPro}`} unit="mg/dL" note={proteinStatus} />
        </ResultGrid>
        <ResultGrid cols={2}>
          <ResultItem label="WBC" value={`${wbc}`} unit="/µL" note={wbcStatus} />
          <ResultItem label="Opening Pressure" value={`${openingPressure}`} unit="mmH₂O" note={pressureStatus} />
        </ResultGrid>
        <ResultAlert type={interpType}>
          {interpretation}
        </ResultAlert>
      </CalcResult>

      <InfoBox>
        <strong>Nilai Normal CSF per Usia:</strong>
        <div className="mt-1 text-[10px] font-mono leading-relaxed">
          WBC: {wbcRef.wbc}/µL | PMN: {wbcRef.pmn} | LYM: {wbcRef.lym} | Protein: {wbcRef.protein} mg/dL | Glukosa: {wbcRef.glucose}
        </div>
      </InfoBox>

      <InfoBox>
        <strong>Pathogen Umum ({ageGroup}):</strong>
        <span className="ml-1">{pathogens.join(", ")}</span>
      </InfoBox>

      <InfoBox>
        <strong>Referensi:</strong> Tekanan normal 70-180 mmH₂O. Rasio CSF/GDS normal ≥0.6. Protein normal 20-45 mg/dL.
        Gram stain positif pada 60-90% meningitis bakterial. PMN dominan = bakterial; Limfosit dominan = viral/TBC.
      </InfoBox>
    </CalcCard>
  );
}
