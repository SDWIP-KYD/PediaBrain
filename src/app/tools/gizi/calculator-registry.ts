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
  "Kondisi Khusus",
  "Bahan Makanan",
] as const;

const calculatorRegistry: Record<string, NCalcDef[]> = {
  "Antropometri": [
    { id: "bmi-calc", name: "BMI Calculator", description: "BMI antropometri pediatric" },
    { id: "weight-age", name: "Weight-for-Age", description: "Z-Score WHO berat badan" },
    { id: "height-age", name: "Height-for-Age", description: "Z-Score WHO tinggi badan" },
    { id: "weight-height", name: "Weight-for-Height", description: "Z-Score WHO wasting" },
    { id: "waterlow-calc", name: "Klasifikasi Waterlow", description: "Wasting & Stunting — % median WHO" },
    { id: "catchup-calc", name: "Target BB & Catch-up", description: "IBW, deficit, growth velocity targets" },
  ],
  "Kalori & Protein": [
    { id: "calorie-calc", name: "Calorie Calculator", description: "Harris-Benedict pediatric" },
    { id: "protein-req", name: "Protein Requirements", description: "Kebutuhan protein usia" },
    { id: "ree-calc", name: "Resting Energy Expenditure", description: "Schofield equations" },
    { id: "stress-factor", name: "Stress Factor", description: "Multiplier REE" },
    { id: "akg-calc", name: "AKG Indonesia 2019", description: "Angka Kecukupan Gizi per usia" },
    { id: "macro-dist-calc", name: "Distribusi Makronutrien", description: "Karbohidrat, Protein, Lemak — harian" },
    { id: "gir-calc", name: "Glucose Infusion Rate (GIR)", description: "Target GIR & konversi konsentrasi" },
  ],
  "Mikronutrien": [
    { id: "vitamin-calc", name: "Vitamin Requirements", description: "Vitamin A,D,E,K,B,C usia" },
    { id: "mineral-calc", name: "Mineral Requirements", description: "Ca, Mg, Zn, Se usia" },
    { id: "iron-calc", name: "Iron Requirements", description: "Kebutuhan zat besi usia" },
    { id: "suplementasi-calc", name: "Suplementasi Defisiensi", description: "Fe, Zn, Vit A, Vit D, B12, Folat dosis" },
  ],
  "Feeding": [
    { id: "enteral-calc", name: "Enteral Feeding", description: "Rate, tube, formula" },
    { id: "tpn-gizi", name: "TPN Calculator", description: "Dextrose, AA, lipid" },
    { id: "elektrolit-tpn", name: "Elektrolit TPN", description: "Na, K, Ca, P, Mg — kebutuhan harian" },
    { id: "breastfeed-calc", name: "Breastfeeding", description: "Estimasi volume ASI" },
    { id: "asi-fort-calc", name: "ASI & Fortifikasi", description: "HMF needs, kcal ASI + formula" },
    { id: "mpasi-calc", name: "MPASI Guidelines", description: "Panduan makanan pendamping ASI" },
  ],
  "Assessment": [
    { id: "malnutri-screen", name: "Malnutrition Screening", description: "MUAC, weight loss" },
    { id: "refeeding-risk", name: "Refeeding Risk", description: "Risiko refeeding syndrome" },
  ],
  "Kondisi Khusus": [
    { id: "sam-protocol", name: "SAM Protocol", description: "Protokol WHO F-75, F-100, RUTF" },
    { id: "special-nutri-calc", name: "Nutrisi Kondisi Khusus", description: "Panduan per penyakit" },
    { id: "refeeding-protocol", name: "Refeeding Syndrome Protocol", description: "Risiko + protokol refeeding" },
  ],
  "Bahan Makanan": [
    { id: "food-comp-calc", name: "Komposisi Bahan Makanan", description: "Kalori, protein, lemak, KH per porsi" },
    { id: "meal-plan-calc", name: "Estimasi Menu Harian", description: "Distribusi kalori per waktu makan" },
  ],
};

export function getGiziCalculatorsForSubtab(subtab: string): NCalcDef[] {
  return calculatorRegistry[subtab] || [];
}

export function getAllGiziCalculators(): NCalcDef[] {
  return Object.values(calculatorRegistry).flat();
}
