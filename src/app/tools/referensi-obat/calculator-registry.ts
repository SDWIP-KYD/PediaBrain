export interface DrugCalcDef {
  id: string;
  name: string;
  description: string;
}

export const drugSubtabs = [
  "Semua Obat",
  "Antibiotik",
  "Analgesik",
  "Kardiovaskuler",
  "Lainnya",
] as const;

const calculatorRegistry: Record<string, DrugCalcDef[]> = {
  "Semua Obat": [
    { id: "all", name: "Semua Obat", description: "Daftar lengkap 50 obat pediatrik" },
  ],
  "Antibiotik": [
    { id: "antibiotics", name: "Antibiotik", description: "Amoxicillin, Ceftriaxone, Vancomycin, dll" },
  ],
  "Analgesik": [
    { id: "analgesics", name: "Analgesik & Antipiretik", description: "Paracetamol, Ibuprofen, Opioid, dll" },
  ],
  "Kardiovaskuler": [
    { id: "cardiovascular", name: "Kardiovaskuler", description: "Digoxin, Enalapril, Dopamine, dll" },
  ],
  "Lainnya": [
    { id: "respiratory", name: "Respirasi", description: "Salbutamol, Montelukast, dll" },
    { id: "gastrointestinal", name: "Gastrointestinal", description: "Ondansetron, Omeprazole, dll" },
    { id: "endocrine", name: "Endokrin", description: "Hydrocortisone, Insulin, dll" },
    { id: "neurology", name: "Neurologi", description: "Phenobarbital, Levetiracetam, dll" },
    { id: "hematology", name: "Hematologi", description: "Heparin, Warfarin, dll" },
    { id: "emergency", name: "Gawat Darurat", description: "Epinephrine, Naloxone, dll" },
  ],
};

export function getDrugCalculatorsForSubtab(subtab: string): DrugCalcDef[] {
  return calculatorRegistry[subtab] || [];
}

export function getAllDrugCalculators(): DrugCalcDef[] {
  return Object.values(calculatorRegistry).flat();
}
