export interface CalculatorDef {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  subtab: string;
  linksTo?: string[]; // calculator IDs this one provides data to
  receivesFrom?: string[]; // calculator IDs this one receives data from
}

export const neonatologiCalculators: CalculatorDef[] = [
  // Obat Neonatus
  { id: "kafein", title: "Kafein Sitrat", subtitle: "Apnea of Prematurity", icon: "☕", color: "purple", subtab: "Obat" },
  { id: "surfaktan", title: "Surfaktan", subtitle: "Curosurf / Beractant", icon: "🫧", color: "cyan", subtab: "Obat" },
  { id: "antibiotik", title: "Antibiotik Neonatus", subtitle: "Disesuaikan GA + usia", icon: "💉", color: "green", subtab: "Obat" },
  { id: "inotropik", title: "Inotropik / Vasopresor", subtitle: "Dopamin, Dobutamin, Epinefrin", icon: "❤️", color: "red", subtab: "Obat", linksTo: ["gir"] },
  { id: "fenobarbital", title: "Fenobarbital", subtitle: "Kejang Neonatus", icon: "🧠", color: "pink", subtab: "Obat" },
  { id: "vitk", title: "Vitamin K & Profilaksis", subtitle: "Rutin BBL", icon: "💛", color: "yellow", subtab: "Obat" },

  // Cairan & TPN
  { id: "cairanharian", title: "Kebutuhan Cairan Harian", subtitle: "Total Fluid Intake", icon: "💧", color: "blue", subtab: "Cairan & TPN", linksTo: ["tpn", "gir"] },
  { id: "gir", title: "GIR", subtitle: "Glucose Infusion Rate", icon: "🍬", color: "orange", subtab: "Cairan & TPN", receivesFrom: ["cairanharian", "tpn", "inotropik"] },
  { id: "tpn", title: "TPN Neonatus", subtitle: "Total Parenteral Nutrition", icon: "🧪", color: "teal", subtab: "Cairan & TPN", receivesFrom: ["cairanharian"], linksTo: ["gir"] },
  { id: "elektrolit", title: "Elektrolit Neonatus", subtitle: "Kebutuhan Elektrolit Harian", icon: "⚖️", color: "slate", subtab: "Cairan & TPN" },

  // Ventilator
  { id: "ventilator", title: "Setting Ventilator", subtitle: "Parameter awal ventilator", icon: "🫁", color: "blue", subtab: "Ventilator" },
  { id: "tidalvolume", title: "Target Tidal Volume", subtitle: "VT/kg assessment", icon: "📊", color: "cyan", subtab: "Ventilator" },
  { id: "oi", title: "Oxygenation Index", subtitle: "OI calculation", icon: "🔬", color: "red", subtab: "Ventilator" },
  { id: "ett", title: "ETT Size & Depth", subtitle: "Ukuran ETT & kedalaman", icon: "🩺", color: "green", subtab: "Ventilator" },

  // Skor & Tabel
  { id: "apgar", title: "Skor APGAR", subtitle: "Evaluasi neonatus", icon: "📋", color: "yellow", subtab: "Skor" },
  { id: "ballard", title: "New Ballard Score", subtitle: "Estimasi GA", icon: "📐", color: "purple", subtab: "Skor" },
  { id: "silverman", title: "Silverman-Anderson", subtitle: "Respiratory distress", icon: "🫁", color: "orange", subtab: "Skor" },
  { id: "fototerapi", title: "Fototerapi & Transfusi", subtitle: "Bilirubin thresholds", icon: "☀️", color: "yellow", subtab: "Skor" },

  // AGD & Elektrolit
  { id: "agd", title: "Interpretasi AGD", subtitle: "Asam-Basa Neonatus", icon: "🧪", color: "teal", subtab: "AGD" },
  { id: "natrium", title: "Koreksi Natrium", subtitle: "Hiponatremia", icon: "⚗️", color: "blue", subtab: "AGD" },
];

export const subtabs = ["Obat", "Cairan & TPN", "Ventilator", "Skor", "AGD"];

export function getCalculatorsForSubtab(subtab: string) {
  return neonatologiCalculators.filter((c) => c.subtab === subtab);
}

export function getCalculatorById(id: string) {
  return neonatologiCalculators.find((c) => c.id === id);
}
