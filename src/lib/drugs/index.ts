// Drug database types (compatible with PediaBrain schema)
export interface DrugRecord {
  id: number;
  name: string;
  drug_class: string;
  is_pediatric_approved: number;
  neonatal_safe: number;
  is_discontinued: number;
  dosing_summary: string;
  uses_summary: string;
  interactions_coverage: 'full' | 'partial' | 'none';
  quality_score: number;
}

export interface DrugIndication {
  id: number;
  indication: string;
  route: string;
  dose_per_kg: number | null;
  dose_unit: string;
  dose_frequency: string;
  max_single_dose: number | null;
  max_daily_dose: number | null;
}

// Load drug index from static JSON
export async function getDrugIndex(): Promise<DrugRecord[]> {
  try {
    const res = await fetch('/drug-index.json');
    if (!res.ok) throw new Error('Failed to load drug index');
    return res.json();
  } catch {
    return [];
  }
}

// Search drugs (client-side fuzzy)
export async function searchDrugsLocal(query: string, limit = 20): Promise<DrugRecord[]> {
  const drugs = await getDrugIndex();
  const lower = query.toLowerCase();
  return drugs
    .filter(d => d.name.toLowerCase().includes(lower) || d.drug_class.toLowerCase().includes(lower))
    .slice(0, limit);
}

// Get drug by exact name
export async function getDrugByName(name: string): Promise<DrugRecord | null> {
  const drugs = await getDrugIndex();
  return drugs.find(d => d.name.toLowerCase() === name.toLowerCase()) || null;
}

// Dosing calculation (simple weight-based)
export function calculateSimpleDose(
  drug: DrugRecord,
  weightKg: number,
  indication?: string
): {
  calculatedDose: string | null;
  dosePerKg: string | null;
  frequency: string | null;
  warnings: string[];
} {
  // Parse dosing_summary for common patterns
  const summary = drug.dosing_summary || '';
  const warnings: string[] = [];

  // Extract dose per kg pattern
  const mgKgMatch = summary.match(/(\d+(?:\.\d+)?)\s*(?:mg|mcg|g)\/kg\s*(?:per\s*)?(?:day|daily)?/i);
  let dosePerKg = mgKgMatch ? parseFloat(mgKgMatch[1]) : null;

  // Extract frequency
  const freqMatch = summary.match(/(?:q(\d+h)|every\s+(\d+)\s*hours?|per\s+day|daily)/i);
  let frequency = freqMatch ? (freqMatch[1] || freqMatch[2] + 'h') : null;

  // Calculate total
  let calculatedDose: string | null = null;
  if (dosePerKg && weightKg) {
    const total = dosePerKg * weightKg;
    calculatedDose = `${total.toFixed(1)} mg`;
  }

  // Add warnings
  if (!drug.is_pediatric_approved) {
    warnings.push(`⚠️ Pediasi approval tidak terbukti untuk ${drug.name}`);
  }
  if (warnings.length === 0 && !calculatedDose) {
    warnings.push('⚠️ Data dosis terstruktur belum tersedia — gunakan dosing_summary');
  }

  return { calculatedDose, dosePerKg: dosePerKg ? `${dosePerKg} mg/kg` : null, frequency, warnings };
}