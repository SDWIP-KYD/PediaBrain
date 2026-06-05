export interface CalculatorDef {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  subtab: string;
}

export const picuCalculators: CalculatorDef[] = [
  // Resusitasi
  { id: "resusitasi", title: "Resusitasi Cepat", subtitle: "Panduan resusitasi & drug doses", icon: "🫀", color: "red", subtab: "Resusitasi" },
  { id: "epinefrin", title: "Epinefrin Detail", subtitle: "Dose & concentration by route", icon: "💉", color: "red", subtab: "Resusitasi" },
  { id: "defibrilasi", title: "Defibrilasi & Kardioversi", subtitle: "Energy dose calculation", icon: "⚡", color: "yellow", subtab: "Resusitasi" },
  { id: "adenosin", title: "Adenosin SVT", subtitle: "SVT conversion dosing", icon: "💊", color: "purple", subtab: "Resusitasi" },
  { id: "atropin", title: "Atropin", subtitle: "Bradycardia, premed, organophosphate", icon: "💊", color: "cyan", subtab: "Resusitasi" },

  // Ventilator
  { id: "rsi", title: "RSI Protocol", subtitle: "Rapid Sequence Intubation", icon: "🫁", color: "orange", subtab: "Ventilator" },
  { id: "ett-picu", title: "ETT Size & Depth", subtitle: "Tube sizing & equipment", icon: "🩺", color: "green", subtab: "Ventilator" },
  { id: "vent-picu", title: "Setting Ventilator PICU", subtitle: "Settings by diagnosis", icon: "🫁", color: "blue", subtab: "Ventilator" },
  { id: "oi-picu", title: "Oxygenation Index", subtitle: "OI, PF ratio, SF ratio, ARDS", icon: "🔬", color: "red", subtab: "Ventilator" },

  // Hemodinamik
  { id: "syok", title: "Evaluasi Syok", subtitle: "Shock assessment & targets", icon: "❤️", color: "red", subtab: "Hemodinamik" },
  { id: "cairan-syok", title: "Resusitasi Cairan", subtitle: "Fluid bolus calculation", icon: "💧", color: "blue", subtab: "Hemodinamik" },
  { id: "cardiac-output", title: "Cardiac Output", subtitle: "CO, CI, SVR, DO₂", icon: "❤️", color: "pink", subtab: "Hemodinamik" },

  // Infus Obat
  { id: "syringe-picu", title: "Syringe Pump (Rule of 6)", subtitle: "Drug infusion calculator", icon: "💉", color: "teal", subtab: "Infus Obat" },
  { id: "antikoagulan", title: "Heparin & Antikoagulan", subtitle: "UFH, enoxaparin, CRRT, ECMO", icon: "🩸", color: "red", subtab: "Infus Obat" },
  { id: "insulin", title: "Insulin Infus", subtitle: "DKA, stress hyperglycemia", icon: "💉", color: "yellow", subtab: "Infus Obat" },

  // Sedasi & Analgesia
  { id: "sedasi", title: "Obat Sedasi & Analgesia", subtitle: "Regimen sedation/analgesia", icon: "💊", color: "purple", subtab: "Sedasi" },
  { id: "flacc", title: "FLACC Score", subtitle: "Pediatric pain assessment", icon: "📋", color: "orange", subtab: "Sedasi" },
  { id: "nmb", title: "Neuromuscular Blockade", subtitle: "Paralytic agents dosing", icon: "💉", color: "slate", subtab: "Sedasi" },

  // Skor & Scoring
  { id: "pelod2", title: "PELOD-2", subtitle: "Pediatric sepsis severity", icon: "📊", color: "yellow", subtab: "Skor" },
  { id: "prism", title: "PRISM-III", subtitle: "Pediatric risk of mortality", icon: "📊", color: "red", subtab: "Skor" },
  { id: "sepsis-score", title: "Sepsis Criteria", subtitle: "IPSCC / Sepsis-3 pediatric", icon: "🦠", color: "amber", subtab: "Skor" },

  // Cairan & Nutrisi
  { id: "cairan-picu", title: "Cairan PICU", subtitle: "Holliday-Segar + critical illness", icon: "💧", color: "blue", subtab: "Cairan & Nutrisi" },
  { id: "nutrisi-picu", title: "Nutrisi PICU", subtitle: "Calorie & protein requirements", icon: "🍼", color: "orange", subtab: "Cairan & Nutrisi" },
  { id: "burn", title: "Parkland Burn", subtitle: "Burn fluid resuscitation", icon: "🔥", color: "red", subtab: "Cairan & Nutrisi" },

  // Lainnya
  { id: "csf", title: "Analisis CSF", subtitle: "Lumbar puncture interpretation", icon: "🧪", color: "teal", subtab: "Lainnya" },
];

export const picuSubtabs = ["Resusitasi", "Ventilator", "Hemodinamik", "Infus Obat", "Sedasi", "Skor", "Cairan & Nutrisi", "Lainnya"];

export function getPicuCalculatorsForSubtab(subtab: string) {
  return picuCalculators.filter((c) => c.subtab === subtab);
}
