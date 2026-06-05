"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, CalcButton, InfoBox } from "../../components/calc-ui";

export function FeedingEval() {
  const { ageMonths, weightGram } = usePatient();
  const [feedingRoute, setFeedingRoute] = useState("oral");
  const [appetite, setAppetite] = useState("good");
  const [swallowing, setSwallowing] = useState("normal");
  const [oralSkills, setOralSkills] = useState("age-appropriate");
  const [texture, setTexture] = useState("age-appropriate");
  const [mealDuration, setMealDuration] = useState(20);
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [snacksPerDay, setSnacksPerDay] = useState(2);
  const [fluidIntake, setFluidIntake] = useState(800);
  const [reflux, setReflux] = useState("none");
  const [choking, setChoking] = useState("none");
  const [behavioralIssues, setBehavioralIssues] = useState("none");
  const [copied, setCopied] = useState(false);

  const ageYr = Math.floor(ageMonths / 12);
  const ageMo = ageMonths % 12;
  const ageStr = ageYr > 0 ? `${ageYr} thn ${ageMo} bln` : `${ageMo} bln`;

  const hasConcerns = feedingRoute === "tube" || appetite === "poor" || swallowing !== "normal" || choking !== "none" || behavioralIssues !== "none";

  const output = `EVALUASI FEEDING
====================
Usia: ${ageStr} | BB: ${(weightGram / 1000).toFixed(1)} kg

ROUTE: ${feedingRoute === "oral" ? "Oral" : feedingRoute === "enteral" ? "Enteral (tube)" : "Parenteral"}

ORAL ASSESSMENT:
- Appetite: ${appetite}
- Swallowing: ${swallowing}
- Oral Skills: ${oralSkills}
- Texture Tolerance: ${texture}
- Meal Duration: ${mealDuration} menit

INTAKE:
- Meals/hari: ${mealsPerDay}
- Snacks/hari: ${snacksPerDay}
- Fluid intake: ${fluidIntake} mL/hari

CONCERNS:
- Reflux: ${reflux}
- Choking: ${choking}
- Behavioral Issues: ${behavioralIssues}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Feeding Evaluation" icon="🍽️" color="cyan">
      <div className="space-y-3">
        <CalcSelect label="Feeding Route" value={feedingRoute} onChange={setFeedingRoute} options={[
          { value: "oral", label: "Oral" },
          { value: "enteral", label: "Enteral (tube feeding)" },
          { value: "parenteral", label: "Parenteral" },
        ]} />

        <CalcSelect label="Appetite" value={appetite} onChange={setAppetite} options={[
          { value: "good", label: "Baik" },
          { value: "fair", label: "Kurang" },
          { value: "poor", label: "Sangat kurang / anoreksia" },
        ]} />

        <CalcSelect label="Swallowing" value={swallowing} onChange={setSwallowing} options={[
          { value: "normal", label: "Normal" },
          { value: "difficulty", label: "Kesulitan menelan" },
          { value: "aspiration", label: "Risiko aspirasi" },
          { value: "unsafe", label: "Tidak aman oral" },
        ]} />

        <CalcSelect label="Oral Motor Skills" value={oralSkills} onChange={setOralSkills} options={[
          { value: "age-appropriate", label: "Sesuai usia" },
          { value: "delayed", label: "Tertunda" },
          { value: "impaired", label: "Gangguan" },
        ]} />

        <CalcSelect label="Texture Tolerance" value={texture} onChange={setTexture} options={[
          { value: "age-appropriate", label: "Sesuai usia" },
          { value: "puree", label: "Puree saja" },
          { value: "liquid", label: "Cair saja" },
        ]} />

        <div className="grid grid-cols-2 gap-3">
          <CalcInput label="Durasi Makan (mnt)" unit="mnt" value={mealDuration} onChange={(v) => setMealDuration(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
          <CalcInput label="Meals/hari" value={mealsPerDay} onChange={(v) => setMealsPerDay(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CalcInput label="Snacks/hari" value={snacksPerDay} onChange={(v) => setSnacksPerDay(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
          <CalcInput label="Fluid (mL/hari)" unit="mL" value={fluidIntake} onChange={(v) => setFluidIntake(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        </div>

        <CalcSelect label="Reflux" value={reflux} onChange={setReflux} options={[
          { value: "none", label: "Tidak ada" },
          { value: "mild", label: "Mild (GER)" },
          { value: "moderate", label: "Moderate (GERD)" },
          { value: "severe", label: "Severe" },
        ]} />

        <CalcSelect label="Choking/Cough" value={choking} onChange={setChoking} options={[
          { value: "none", label: "Tidak ada" },
          { value: "occasional", label: "Kadang-kadang" },
          { value: "frequent", label: "Sering" },
        ]} />

        <CalcSelect label="Behavioral Issues" value={behavioralIssues} onChange={setBehavioralIssues} options={[
          { value: "none", label: "Tidak ada" },
          { value: "food-refusal", label: "Food refusal" },
          { value: "selective", label: "Selective eating" },
          { value: "aversion", label: "Food aversion" },
          { value: "fighting", label: "Fighting/forcing" },
        ]} />

        <CalcResult color="cyan">
          <ResultGrid cols={2}>
            <ResultItem label="Route" value={feedingRoute === "oral" ? "Oral" : feedingRoute === "enteral" ? "Enteral" : "Parenteral"} />
            <ResultItem label="Concerns" value={hasConcerns ? "Ada" : "Tidak ada"} className={hasConcerns ? "text-yellow-400" : "text-green-400"} />
          </ResultGrid>
        </CalcResult>

        {hasConcerns && (
          <InfoBox>
            <strong>Evaluasi lanjutan diperlukan:</strong> Pertimbangkan speech therapy, GI consult, atau nutritional rehabilitation.
          </InfoBox>
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
