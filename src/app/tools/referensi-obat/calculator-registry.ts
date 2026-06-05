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
  "Alat & Referensi",
] as const;

const calculatorRegistry: Record<string, DrugCalcDef[]> = {
  "Semua Obat": [
    { id: "all", name: "Semua Obat", description: "Daftar lengkap obat pediatrik" },
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
    { id: "respiratory", name: "Respirasi", description: "Salbutamol, Budesonide, dll" },
    { id: "gastrointestinal", name: "Gastrointestinal", description: "Ondansetron, Omeprazole, Zinc, dll" },
    { id: "endocrine", name: "Endokrin", description: "Hydrocortisone, Insulin, dll" },
    { id: "neurology", name: "Neurologi", description: "Phenobarbital, Levetiracetam, Midazolam, dll" },
    { id: "hematology", name: "Hematologi", description: "Heparin, Warfarin, dll" },
    { id: "emergency", name: "Gawat Darurat", description: "Epinephrine, Naloxone, Adenosine, dll" },
    { id: "allergy", name: "Alergi/Imunologi", description: "Cetirizine, Loratadine, dll" },
    { id: "nutrition", name: "Nutrisi/Vitamin", description: "Zat Besi, Vitamin A/D/K, dll" },
    { id: "topical", name: "Dermatologi/Topikal", description: "Hydrocortisone cream, Mupirocin, dll" },
  ],
  "Alat & Referensi": [
    { id: "equipment", name: "Kalkulator Alat", description: "ETT, NGT, IV, Foley sizing by age/weight" },
    { id: "latin", name: "Singkatan Latin", description: "30 singkatan umum resep medis" },
  ],
};

export function getDrugCalculatorsForSubtab(subtab: string): DrugCalcDef[] {
  return calculatorRegistry[subtab] || [];
}

export function getAllDrugCalculators(): DrugCalcDef[] {
  return Object.values(calculatorRegistry).flat();
}
