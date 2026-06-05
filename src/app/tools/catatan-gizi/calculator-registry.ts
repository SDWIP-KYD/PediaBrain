export interface GiziLogCalcDef {
  id: string;
  name: string;
  description: string;
}

export const catatanGiziSubtabs = [
  "Assessment",
  "Monitoring",
  "Planning",
] as const;

const calculatorRegistry: Record<string, GiziLogCalcDef[]> = {
  Assessment: [
    { id: "nutri-assessment", name: "Nutritional Assessment", description: "SGA, antropometri, biokimia, klinis" },
    { id: "food-allergy", name: "Food Allergy Record", description: "Allergen, reaksi, OFC, safe/unsafe foods" },
    { id: "feeding-eval", name: "Feeding Evaluation", description: "Oral vs tube, appetite, swallowing, skills" },
  ],
  Monitoring: [
    { id: "intake-output", name: "Intake/Output Record", description: "I/O harian dengan fluid balance" },
    { id: "growth-log", name: "Growth Monitoring Log", description: "BB, TB, LK, BMI dengan z-score WHO" },
    { id: "micronutrient-log", name: "Micronutrient Log", description: "Vitamin & mineral dose tracking" },
  ],
  Planning: [
    { id: "diet-plan", name: "Diet Plan", description: "Target kalori, makronutrien, meal plan" },
    { id: "nutri-care-plan", name: "Nutrition Care Plan", description: "Problem, goals, intervensi, monitoring" },
  ],
};

export function getGiziLogCalculatorsForSubtab(subtab: string): GiziLogCalcDef[] {
  return calculatorRegistry[subtab] || [];
}

export function getAllGiziLogCalculators(): GiziLogCalcDef[] {
  return Object.values(calculatorRegistry).flat();
}
