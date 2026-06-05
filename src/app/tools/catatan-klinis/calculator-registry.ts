export interface KlinisCalcDef {
  id: string;
  name: string;
  description: string;
  category: string;
}

export const catatanKlinisSubtabs = [
  "Divisi",
  "Kalkulator",
  "Semua",
] as const;

export const divisions = [
  { id: "nicu", name: "NICU", full: "Neonatal Intensive Care Unit", icon: "👶", sectionCount: 21 },
  { id: "picu", name: "PICU", full: "Pediatric Intensive Care Unit", icon: "💊", sectionCount: 6 },
  { id: "hemato", name: "Hemato-Onkologi", full: "Hematologi & Onkologi", icon: "🩸", sectionCount: 9 },
  { id: "kardio", name: "Kardiologi", full: "Kardiologi Anak", icon: "❤️", sectionCount: 4 },
  { id: "gastro", name: "Gastroenterologi", full: "Gastroenterologi Anak", icon: "🫁", sectionCount: 4 },
  { id: "nutrisi", name: "Nutrisi Metabolik", full: "Nutrisi & Penyakit Metabolik", icon: "🍼", sectionCount: 2 },
  { id: "neuro", name: "Neurologi", full: "Neurologi Anak", icon: "🧠", sectionCount: 3 },
  { id: "respi", name: "Respirologi", full: "Respirologi Anak", icon: "🌬️", sectionCount: 3 },
  { id: "endo", name: "Endokrinologi", full: "Endokrinologi Anak", icon: "⚗️", sectionCount: 5 },
  { id: "nefro", name: "Nefrologi", full: "Nefrologi Anak", icon: "🫘", sectionCount: 2 },
  { id: "infeksi", name: "Infeksi & Tropis", full: "Infeksi & Penyakit Tropis", icon: "🦠", sectionCount: 3 },
  { id: "alergi", name: "Alergi Imunologi", full: "Alergi & Imunologi", icon: "🛡️", sectionCount: 2 },
  { id: "pedsos", name: "Pedsos", full: "Pediatri Sosial", icon: "👥", sectionCount: 3 },
] as const;

export const calculatorRegistry: KlinisCalcDef[] = [
  { id: "gir", name: "GIR (Glucose Infusion Rate)", description: "Dari infus IV dextrose", category: "NICU & Cairan" },
  { id: "rumatan", name: "Cairan Rumatan (Holliday-Segar)", description: "Metode berat badan 100/50/20", category: "NICU & Cairan" },
  { id: "iwl", name: "IWL & Balance Cairan", description: "Hitung IWL dan balans 24 jam", category: "NICU & Cairan" },
  { id: "bicnat", name: "Koreksi Bikarbonat", description: "Bicnat / Meylon — habis 24 jam", category: "NICU & Cairan" },
  { id: "prc", name: "Volume Transfusi PRC", description: "ΔHb × 4 × BB", category: "Hematologi" },
  { id: "anc", name: "Absolute Neutrophil Count", description: "Derajat neutropenia", category: "Hematologi" },
  { id: "mentzer", name: "Indeks Mentzer", description: "Bedakan ADB vs Thalasemia", category: "Hematologi" },
  { id: "vaso", name: "Drip Obat Vasoaktif", description: "Kecepatan infus mL/jam", category: "PICU & Kardiologi" },
  { id: "nikardipin", name: "Drip Nikardipin", description: "10 mL + 40 mL NaCl 0.9%", category: "PICU & Kardiologi" },
  { id: "map", name: "Mean Arterial Pressure", description: "(Sis + 2×Dia) ÷ 3", category: "PICU & Kardiologi" },
  { id: "rr", name: "Koreksi RR Ventilator", description: "Sesuaikan RR target PCO₂", category: "PICU & Kardiologi" },
  { id: "epi", name: "Epinefrin Anafilaksis", description: "1:1000 intramuskular", category: "Kegawatan" },
  { id: "pct", name: "PCT (Parasetamol) Kontinu", description: "Infus kontinu mL/jam", category: "Kegawatan" },
  { id: "ett", name: "ETT & Kateter Umbilikus", description: "Ukuran & kedalaman", category: "Kegawatan" },
];

export function getCalculatorsByCategory(category: string): KlinisCalcDef[] {
  return calculatorRegistry.filter((c) => c.category === category);
}

export function getAllCalculatorCategories(): string[] {
  return [...new Set(calculatorRegistry.map((c) => c.category))];
}
