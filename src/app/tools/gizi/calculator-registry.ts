export interface NCalcDef {
  id: string;
  name: string;
  description: string;
}

export const giziSubtabs = [
  "Antropometri",
  "Kalori & Protein",
  "Mikronutrien",
  "Feeding",
  "Assessment",
] as const;

const calculatorRegistry: Record<string, NCalcDef[]> = {
  "Antropometri": [
    { id: "bmi-calc", name: "BMI Calculator", description: "BMI antropometri pediatric" },
    { id: "weight-age", name: "Weight-for-Age", description: "Z-Score WHO berat badan" },
    { id: "height-age", name: "Height-for-Age", description: "Z-Score WHO tinggi badan" },
    { id: "weight-height", name: "Weight-for-Height", description: "Z-Score WHO wasting" },
  ],
  "Kalori & Protein": [
    { id: "calorie-calc", name: "Calorie Calculator", description: "Harris-Benedict pediatric" },
    { id: "protein-req", name: "Protein Requirements", description: "Kebutuhan protein usia" },
    { id: "ree-calc", name: "Resting Energy Expenditure", description: "Schofield equations" },
    { id: "stress-factor", name: "Stress Factor", description: "Multiplier REE" },
  ],
  "Mikronutrien": [
    { id: "vitamin-calc", name: "Vitamin Requirements", description: "Vitamin A,D,E,K,B,C usia" },
    { id: "mineral-calc", name: "Mineral Requirements", description: "Ca, Mg, Zn, Se usia" },
    { id: "iron-calc", name: "Iron Requirements", description: "Kebutuhan zat besi usia" },
  ],
  "Feeding": [
    { id: "enteral-calc", name: "Enteral Feeding", description: "Rate, tube, formula" },
    { id: "tpn-gizi", name: "TPN Calculator", description: "Dextrose, AA, lipid" },
    { id: "breastfeed-calc", name: "Breastfeeding", description: "Estimasi volume ASI" },
  ],
  "Assessment": [
    { id: "malnutri-screen", name: "Malnutrition Screening", description: "MUAC, weight loss" },
    { id: "refeeding-risk", name: "Refeeding Risk", description: "Risiko refeeding syndrome" },
  ],
};

export function getGiziCalculatorsForSubtab(subtab: string): NCalcDef[] {
  return calculatorRegistry[subtab] || [];
}

export function getAllGiziCalculators(): NCalcDef[] {
  return Object.values(calculatorRegistry).flat();
}
