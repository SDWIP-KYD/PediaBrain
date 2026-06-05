export interface SepsisCalcDef {
  id: string;
  name: string;
  description: string;
}

export const sepsisSubtabs = [
  "Sepsis Bundle",
] as const;

const calculatorRegistry: Record<string, SepsisCalcDef[]> = {
  "Sepsis Bundle": [
    { id: "sepsis-bundle", name: "Sepsis Bundle Compliance", description: "SSC Hour-1 & Hour-3 bundle tracker" },
  ],
};

export function getSepsisCalculatorsForSubtab(subtab: string): SepsisCalcDef[] {
  return calculatorRegistry[subtab] || [];
}

export function getAllSepsisCalculators(): SepsisCalcDef[] {
  return Object.values(calculatorRegistry).flat();
}
