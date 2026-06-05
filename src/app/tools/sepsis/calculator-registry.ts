export interface SepsisCalcDef {
  id: string;
  name: string;
  description: string;
}

export const sepsisSubtabs = [
  "Definisi",
  "Patofisiologi",
  "Klinis",
  "Diagnosis",
  "Tatalaksana",
  "Evaluasi",
] as const;

const calculatorRegistry: Record<string, SepsisCalcDef[]> = {
  "Definisi": [
    { id: "sepsis-definisi", name: "Definisi & Terminologi", description: "Phoenix Criteria 2024 — definisi sepsis anak" },
  ],
  "Patofisiologi": [
    { id: "sepsis-patofisiologi", name: "Patofisiologi", description: "Mekanisme molekular hingga disfungsi organ" },
  ],
  "Klinis": [
    { id: "sepsis-klinis", name: "Manifestasi Klinis", description: "Tanda & gejala sepsis dan septic shock" },
  ],
  "Diagnosis": [
    { id: "sepsis-diagnosis", name: "Diagnosis & Phoenix Score", description: "Phoenix Sepsis Score interaktif + pemeriksaan penunjang" },
  ],
  "Tatalaksana": [
    { id: "sepsis-tatalaksana", name: "Tatalaksana SSC 2026", description: "Resusitasi, antibiotik, vasoaktif, ventilasi" },
  ],
  "Evaluasi": [
    { id: "sepsis-evaluasi", name: "Evaluasi & Monitoring", description: "Target resusitasi, de-eskalasi, follow-up" },
  ],
};

export function getSepsisCalculatorsForSubtab(subtab: string): SepsisCalcDef[] {
  return calculatorRegistry[subtab] || [];
}

export function getAllSepsisCalculators(): SepsisCalcDef[] {
  return Object.values(calculatorRegistry).flat();
}
