"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, CalcButton, InfoBox, ResultAlert } from "../../components/calc-ui";

type SGAGrade = "Well-nourished" | "Mild" | "Moderate" | "Severe";

export function NutriAssessment() {
  const { weightGram, heightCm, ageMonths, sex, patient } = usePatient();
  const muac = patient.muac;
  const weightKg = weightGram / 1000;
  const bmi = heightCm > 0 ? weightKg / (heightCm / 100) ** 2 : 0;

  const [albumin, setAlbumin] = useState(3.5);
  const [prealbumin, setPrealbumin] = useState(20);
  const [lymphocytes, setLympocytes] = useState(1500);
  const [weightLoss6m, setWeightLoss6m] = useState(5);
  const [intake, setIntake] = useState(70);
  const [giSymptoms, setGiSymptoms] = useState("none");
  const [functionalStatus, setFunctionalStatus] = useState("normal");
  const [subcutFat, setSubcutFat] = useState("normal");
  const [muscleWasting, setMuscleWasting] = useState("none");
  const [edema, setEdema] = useState("none");
  const [copied, setCopied] = useState(false);

  const muacStatus = muac >= 13.5 ? "Normal" : muac >= 12.5 ? "Mild risk" : muac >= 11.5 ? "Moderate risk" : muac > 0 ? "Severe risk" : "N/A";
  const muacColor = muac >= 13.5 ? "text-green-400" : muac >= 12.5 ? "text-yellow-400" : muac >= 11.5 ? "text-orange-400" : "text-red-400";

  let sgaScore = 0;
  if (weightLoss6m > 10) sgaScore += 2;
  else if (weightLoss6m > 5) sgaScore += 1;
  if (intake < 50) sgaScore += 2;
  else if (intake < 75) sgaScore += 1;
  if (giSymptoms !== "none") sgaScore += 1;
  if (functionalStatus !== "normal") sgaScore += 1;
  if (subcutFat !== "normal") sgaScore += 1;
  if (muscleWasting !== "none") sgaScore += 1;
  if (edema !== "none") sgaScore += 1;

  const sgaGrade: SGAGrade =
    sgaScore <= 1 ? "Well-nourished" :
    sgaScore <= 3 ? "Mild" :
    sgaScore <= 5 ? "Moderate" :
    "Severe";

  const sgaColor =
    sgaGrade === "Well-nourished" ? "text-green-400" :
    sgaGrade === "Mild" ? "text-yellow-400" :
    sgaGrade === "Moderate" ? "text-orange-400" :
    "text-red-400";

  const output = `NUTRITIONAL ASSESSMENT (SGA - PEDIATRIK)
================================================
BB: ${weightKg.toFixed(1)} kg | TB: ${heightCm} cm | BMI: ${bmi.toFixed(1)}
MUAC: ${muac} cm (${muacStatus})

ANTROPOMETRI:
- BB/TB: ${bmi.toFixed(1)} kg/m²
- Weight Loss 6 bln: ${weightLoss6m}%

BIOKIMIA:
- Albumin: ${albumin} g/dL ${albumin < 3.5 ? "(↓ hipoproteinemia)" : ""}
- Prealbumin: ${prealbumin} mg/dL ${prealbumin < 15 ? "(↓)" : ""}
- Lymphocytes: ${lymphocytes}/mm³ ${lymphocytes < 1500 ? "(↓)" : ""}

KLINIS:
- Intake: ${intake}% dari kebutuhan
- GI Symptoms: ${giSymptoms}
- Functional Status: ${functionalStatus}
- Subcut Fat: ${subcutFat}
- Muscle Wasting: ${muscleWasting}
- Edema: ${edema}

SGA SCORE: ${sgaScore}
SGA GRADE: ${sgaGrade}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Nutritional Assessment (SGA)" icon="🩺" color="teal">
      <div className="space-y-3">
        <CalcInput label="Albumin (g/dL)" unit="g/dL" value={albumin} onChange={(v) => setAlbumin(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} step={0.1} />
        <CalcInput label="Prealbumin (mg/dL)" unit="mg/dL" value={prealbumin} onChange={(v) => setPrealbumin(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        <CalcInput label="Lymphocytes (/mm³)" unit="/mm³" value={lymphocytes} onChange={(v) => setLympocytes(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        <CalcInput label="BB Turun 6 bulan (%)" unit="%" value={weightLoss6m} onChange={(v) => setWeightLoss6m(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        <CalcInput label="Intake (% kebutuhan)" unit="%" value={intake} onChange={(v) => setIntake(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={100} />
        <CalcSelect label="GI Symptoms" value={giSymptoms} onChange={setGiSymptoms} options={[
          { value: "none", label: "Tidak ada" },
          { value: "nausea", label: "Mual" },
          { value: "vomiting", label: "Muntah" },
          { value: "diarrhea", label: "Diare" },
          { value: "constipation", label: "Konstipasi" },
          { value: "anorexia", label: "Anoreksia" },
        ]} />
        <CalcSelect label="Functional Status" value={functionalStatus} onChange={setFunctionalStatus} options={[
          { value: "normal", label: "Normal" },
          { value: "reduced", label: "Penurunan (bed rest)" },
          { value: "immobile", label: "Immobile" },
        ]} />
        <CalcSelect label="Subcutaneous Fat" value={subcutFat} onChange={setSubcutFat} options={[
          { value: "normal", label: "Normal" },
          { value: "mild", label: "Mild depletion" },
          { value: "moderate", label: "Moderate depletion" },
          { value: "severe", label: "Severe depletion" },
        ]} />
        <CalcSelect label="Muscle Wasting" value={muscleWasting} onChange={setMuscleWasting} options={[
          { value: "none", label: "Tidak ada" },
          { value: "mild", label: "Mild" },
          { value: "moderate", label: "Moderate" },
          { value: "severe", label: "Severe" },
        ]} />
        <CalcSelect label="Edema" value={edema} onChange={setEdema} options={[
          { value: "none", label: "Tidak ada" },
          { value: "trace", label: "Trace (+/-)" },
          { value: "mild", label: "Mild (+)" },
          { value: "moderate", label: "Moderate (++)" },
          { value: "severe", label: "Severe (+++)" },
        ]} />

        <CalcResult color="teal">
          <ResultGrid cols={2}>
            <ResultItem label="BMI" value={bmi.toFixed(1)} unit="kg/m²" />
            <ResultItem label="MUAC" value={`${muac} cm`} className={muacColor} />
            <ResultItem label="SGA Score" value={`${sgaScore}`} />
            <ResultItem label="SGA Grade" value={sgaGrade} className={sgaColor} />
          </ResultGrid>
        </CalcResult>

        {sgaGrade === "Severe" && (
          <ResultAlert type="danger">
            Malnutrisi berat — pertimbangkan intervensi nutrisi agresif, pertimbangan TPN/enteral jika intakeoral tidak adekuat.
          </ResultAlert>
        )}

        <CalcResult>
          <pre className="whitespace-pre-wrap text-xs font-mono text-foreground leading-relaxed">{output}</pre>
        </CalcResult>
        <CalcButton onClick={handleCopy} color="cyan">
          {copied ? "✓ Tersalin!" : "📋 Copy to Clipboard"}
        </CalcButton>
      </div>
    </CalcCard>
  );
}
