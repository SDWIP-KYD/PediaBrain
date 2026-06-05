"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, CalcButton, InfoBox } from "../../components/calc-ui";

export function DietPlan() {
  const { weightGram, heightCm, ageMonths, sex } = usePatient();
  const weightKg = weightGram / 1000;
  const bmi = heightCm > 0 ? weightKg / (heightCm / 100) ** 2 : 0;

  const [calorieTarget, setCalorieTarget] = useState(0);
  const [proteinTarget, setProteinTarget] = useState(0);
  const [carbPct, setCarbPct] = useState(55);
  const [fatPct, setFatPct] = useState(30);
  const [proteinPct, setProteinPct] = useState(15);
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [snacksPerDay, setSnacksPerDay] = useState(3);
  const [copied, setCopied] = useState(false);

  const ageYr = Math.floor(ageMonths / 12);
  const ageMo = ageMonths % 12;

  const estimatedCalories = weightKg * 80;
  const target = calorieTarget > 0 ? calorieTarget : estimatedCalories;

  const carbG = (target * carbPct / 100) / 4;
  const fatG = (target * fatPct / 100) / 9;
  const proteinG = proteinTarget > 0 ? proteinTarget : (target * proteinPct / 100) / 4;

  const totalMeals = mealsPerDay + snacksPerDay;
  const calPerMeal = totalMeals > 0 ? Math.round(target / totalMeals) : 0;

  const output = `DIET PLAN
===========
BB: ${weightKg.toFixed(1)} kg | TB: ${heightCm} cm | BMI: ${bmi.toFixed(1)}
Usia: ${ageYr} thn ${ageMo} bln

TARGET KALORI: ${target} kkal/hari

DISTRIBUSI MAKRONUTRIEN:
- Karbohidrat: ${carbG.toFixed(0)} g (${carbPct}%)
- Protein: ${proteinG.toFixed(0)} g (${proteinPct}%)
- Lemak: ${fatG.toFixed(0)} g (${fatPct}%)

MEAL PLAN:
- ${mealsPerDay} makan utama × ${calPerMeal} kkal
- ${snacksPerDay} snack × ${calPerMeal} kkal`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Diet Plan" icon="🍽️" color="emerald">
      <div className="space-y-3">
        <CalcInput label="Target Kalori (kkal/hari)" unit="kkal" value={calorieTarget} onChange={(v) => setCalorieTarget(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} placeholder={`Estimasi: ${estimatedCalories} kkal`} />
        <CalcInput label="Target Protein (g/hari)" unit="g" value={proteinTarget} onChange={(v) => setProteinTarget(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} placeholder="Otomatis dari %" />

        <div className="grid grid-cols-3 gap-2">
          <CalcInput label="Karbo (%)" unit="%" value={carbPct} onChange={(v) => setCarbPct(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={100} />
          <CalcInput label="Protein (%)" unit="%" value={proteinPct} onChange={(v) => setProteinPct(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={100} />
          <CalcInput label="Lemak (%)" unit="%" value={fatPct} onChange={(v) => setFatPct(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} max={100} />
        </div>
        <p className="text-[10px] text-muted-foreground text-right">
          Total: {carbPct + proteinPct + fatPct}% {carbPct + proteinPct + fatPct !== 100 ? "(seharusnya 100%)" : ""}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <CalcInput label="Makan Utama/hari" value={mealsPerDay} onChange={(v) => setMealsPerDay(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
          <CalcInput label="Snacks/hari" value={snacksPerDay} onChange={(v) => setSnacksPerDay(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        </div>

        <CalcResult color="emerald">
          <ResultGrid cols={2}>
            <ResultItem label="Target Kalori" value={`${target} kkal`} />
            <ResultItem label="Karbohidrat" value={`${carbG.toFixed(0)} g`} />
            <ResultItem label="Protein" value={`${proteinG.toFixed(0)} g`} />
            <ResultItem label="Lemak" value={`${fatG.toFixed(0)} g`} />
            <ResultItem label="Kalori/serving" value={`${calPerMeal} kkal`} />
            <ResultItem label="Total servings" value={`${totalMeals}`} />
          </ResultGrid>
        </CalcResult>

        <InfoBox>
          <strong>Estimasi:</strong> Kebutuhan kalori pediatric ~70-90 kkal/kg/hari (tergantung usia dan aktivitas).
          Protein: 1-2 g/kg/hari (tergantung kondisi).
        </InfoBox>

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
