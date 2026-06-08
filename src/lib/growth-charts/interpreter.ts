/**
 * PediaBrain Growth Interpreter
 *
 * Klasifikasi status gizi anak berdasarkan WHO (0-5 tahun) dan CDC (5-20 tahun).
 *
 * WHO Anthropometric Standards (2006):
 *   - BB/U  : Weight-for-Age           → underweight, normal, overweight
 *   - TB/U  : Height-for-Age           → stunting classification
 *   - BB/TB : Weight-for-Height        → wasting / obesity classification
 *   - IMT/U : BMI-for-Age              → thinness / overweight / obesity
 *
 * CDC Growth Charts (2000, updated 2022):
 *   - BB/U  : Weight-for-Age (2-20 thn)
 *   - TB/U  : Height-for-Age (2-20 thn)
 *   - IMT/U : BMI-for-Age (2-20 thn)   → gold standard for obesity diagnosis ≥5 thn
 *
 * Referensi:
 *   WHO: https://www.who.int/tools/child-growth-standards/standards
 *   CDC: https://www.cdc.gov/growthcharts/
 */

export type ReferenceSystem = "WHO" | "CDC";

export interface ZScoreResult {
  z: number | null;
  c: string;
  i: string;
  reference: ReferenceSystem;
}

export interface GrowthReport {
  ageMonths: number;
  ageText: string;
  reference: ReferenceSystem;
  bb_u?: ZScoreResult;   // Weight-for-Age
  tb_u?: ZScoreResult;   // Height-for-Age
  bb_tb?: ZScoreResult;  // Weight-for-Height (WHO) / Weight-for-Height
  imt_u?: ZScoreResult;  // BMI-for-Age
  bmi?: number;           // Raw BMI value
  bmiNote?: string;       // Note about obesity confirmation
}

// ─── Z-score from LMS ───────────────────────────────────────────

export function calcZ(
  value: number,
  L: number,
  M: number,
  S: number,
): number {
  if (value <= 0 || M <= 0) return -5; // extreme
  // z = ((x/M)^L - 1) / (L*S)  for L ≠ 0
  // z = ln(x/M) / S            for L = 0
  if (Math.abs(L) < 0.0001) {
    return Math.log(value / M) / S;
  }
  const ratio = value / M;
  if (ratio <= 0) return -5;
  return (Math.pow(ratio, L) - 1) / (L * S);
}

export function valueAtZ(z: number, L: number, M: number, S: number): number {
  if (z <= -3.5) return 0; // safety
  if (Math.abs(L) < 0.0001) {
    return M * Math.exp(S * z);
  }
  return M * Math.pow(1 + L * S * z, 1 / L);
}

// ─── BMI ─────────────────────────────────────────────────────────

export function calcBMI(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0;
  const hM = heightCm / 100;
  return weightKg / (hM * hM);
}

// ─── Classifications ────────────────────────────────────────────

// WHO weight-for-age
function whoBBU(z: number): { c: string; i: string } {
  if (z > 3) return { c: "≥ +3SD", i: "Overweight (berat badan lebih)" };
  if (z > 2) return { c: "> +2SD", i: "Overweight (berat badan lebih)" };
  if (z >= 1) return { c: "+1SD s.d. +2SD", i: "Risiko berat badan lebih" };
  if (z >= -2) return { c: "-2SD s.d. +1SD", i: "Berat badan normal (gizi baik)" };
  if (z >= -3) return { c: "-3SD s.d. -2SD", i: "Berat badan kurang (underweight)" };
  return { c: "< -3SD", i: "Berat badan sangat kurang (severely underweight)" };
}

// WHO height-for-age
function whoTBU(z: number): { c: string; i: string } {
  if (z > 2) return { c: "> +2SD", i: "Tinggi (normal varian)" };
  if (z >= -2) return { c: "-2SD s.d. +2SD", i: "Tinggi badan normal (gizi baik)" };
  if (z >= -3) return { c: "-3SD s.d. -2SD", i: "Pendek (stunted)" };
  return { c: "< -3SD", i: "Sangat pendek (severely stunted)" };
}

// WHO weight-for-height
function whoBBTB(z: number): { c: string; i: string } {
  if (z > 3) return { c: "> +3SD", i: "Obesitas (gizi lebih)" };
  if (z > 2) return { c: "> +2SD", i: "Overweight (gizi lebih)" };
  if (z >= 1) return { c: "+1SD s.d. +2SD", i: "Risiko gizi lebih (at risk of overweight)" };
  if (z >= -2) return { c: "-2SD s.d. +1SD", i: "Gizi baik (normal nutritional status)" };
  if (z >= -3) return { c: "-3SD s.d. -2SD", i: "Gizi kurang (wasted)" };
  return { c: "< -3SD", i: "Gizi buruk (severely wasted)" };
}

// WHO BMI-for-age
function whoIMTU(z: number): { c: string; i: string } {
  if (z > 3) return { c: "> +3SD", i: "Obesitas" };
  if (z > 2) return { c: "> +2SD", i: "Overweight (kelebihan berat badan)" };
  if (z >= 1) return { c: "+1SD s.d. +2SD", i: "Risiko overweight" };
  if (z >= -2) return { c: "-2SD s.d. +1SD", i: "IMT normal (gizi baik)" };
  if (z >= -3) return { c: "-3SD s.d. -2SD", i: "Gizi kurang (thinness)" };
  return { c: "< -3SD", i: "Gizi buruk (severe thinness)" };
}

// CDC BMI-for-age uses percentiles conceptually but we map z-scores
function cdcIMTU(z: number): { c: string; i: string } {
  if (z > 2) return { c: "≥ +2SD (≥ P95)", i: "Obesitas — lihat rekomendasi di bawah" };
  if (z > 1) return { c: "+1SD s.d. +2SD (P85-P95)", i: "Overweight (kelebihan berat badan)" };
  if (z >= -2) return { c: "-2SD s.d. +1SD (P5-P85)", i: "IMT normal" };
  if (z >= -3) return { c: "-3SD s.d. -2SD (P1-P5)", i: "Underweight" };
  return { c: "< -3SD (< P1)", i: "Severely underweight" };
}

// CDC height-for-age
function cdcTBU(z: number): { c: string; i: string } {
  if (z > 2) return { c: "> +2SD", i: "Tinggi badan di atas rata-rata" };
  if (z >= -2) return { c: "-2SD s.d. +2SD", i: "Tinggi badan normal" };
  if (z >= -3) return { c: "-3SD s.d. -2SD", i: "Pendek (stunted)" };
  return { c: "< -3SD", i: "Sangat pendek (severely stunted)" };
}

// CDC weight-for-age
function cdcBBU(z: number): { c: string; i: string } {
  if (z > 2) return { c: "> +2SD", i: "Berat badan di atas rata-rata" };
  if (z >= -2) return { c: "-2SD s.d. +2SD", i: "Berat badan normal" };
  if (z >= -3) return { c: "-3SD s.d. -2SD", i: "Berat badan kurang (underweight)" };
  return { c: "< -3SD", i: "Berat badan sangat kurang" };
}

// ─── Main interpreter ──────────────────────────────────────────

import { weightForAgeBoys, weightForAgeGirls, heightForAgeBoys, heightForAgeGirls, bmiForAgeBoys, bmiForAgeGirls, LMSRow } from "./who-data";
import { cdcBMIBoys, cdcBMIGirls, cdcWeightBoys, cdcWeightGirls, cdcHeightBoys, cdcHeightGirls } from "./cdc-data";

function rowsToMap(rows: LMSRow[]): Record<number, [number, number, number]> {
  const map: Record<number, [number, number, number]> = {};
  for (const [m, L, M, S] of rows) {
    map[m] = [L, M, S];
  }
  return map;
}

function interpolateLMS(
  data: Record<number, [number, number, number]>,
  month: number,
): [number, number, number] | null {
  const months = Object.keys(data).map(Number).sort((a, b) => a - b);
  if (months.length === 0) return null;
  if (month <= months[0]) return data[months[0]];
  if (month >= months[months.length - 1]) return data[months[months.length - 1]];

  for (let i = 0; i < months.length - 1; i++) {
    if (month >= months[i] && month < months[i + 1]) {
      const ratio = (month - months[i]) / (months[i + 1] - months[i]);
      const a = data[months[i]];
      const b = data[months[i + 1]];
      return [
        a[0] + (b[0] - a[0]) * ratio,
        a[1] + (b[1] - a[1]) * ratio,
        a[2] + (b[2] - a[2]) * ratio,
      ];
    }
  }
  return data[months[months.length - 1]];
}

// Pre-computed WHO maps
const whoWeightL = rowsToMap(weightForAgeBoys);
const whoWeightP = rowsToMap(weightForAgeGirls);
const whoHeightL = rowsToMap(heightForAgeBoys);
const whoHeightP = rowsToMap(heightForAgeGirls);
const whoBMIL = rowsToMap(bmiForAgeBoys);
const whoBMIP = rowsToMap(bmiForAgeGirls);

function getWHOLMS(
  indicator: "weight" | "height" | "bmi",
  sex: "L" | "P",
  month: number,
): [number, number, number] | null {
  const isMale = sex === "L";
  switch (indicator) {
    case "weight": return interpolateLMS(isMale ? whoWeightL : whoWeightP, month);
    case "height": return interpolateLMS(isMale ? whoHeightL : whoHeightP, month);
    case "bmi":    return interpolateLMS(isMale ? whoBMIL : whoBMIP, month);
  }
}

// CDC LMS maps (already in LMSMap format from cdc-data.ts)
const cdcWeightLM = cdcWeightBoys;
const cdcWeightPM = cdcWeightGirls;
const cdcHeightLM = cdcHeightBoys;
const cdcHeightPM = cdcHeightGirls;
const cdcBMILM = cdcBMIBoys;
const cdcBMIPM = cdcBMIGirls;

function getCDCLMS(
  indicator: "weight" | "height" | "bmi",
  sex: "L" | "P",
  month: number,
): [number, number, number] | null {
  let map: Record<number, [number, number, number]>;
  const isMale = sex === "L";
  switch (indicator) {
    case "weight": map = isMale ? cdcWeightLM : cdcWeightPM; break;
    case "height": map = isMale ? cdcHeightLM : cdcHeightPM; break;
    case "bmi":    map = isMale ? cdcBMILM : cdcBMIPM; break;
  }
  return interpolateLMS(map, month);
}

export function computeReport(
  weightKg: number | null | undefined,
  heightCm: number | null | undefined,
  headCircumferenceCm: number | null | undefined,
  birthDate: string,
  measurementDate: string,
  sex: "L" | "P",
): GrowthReport {
  const birth = new Date(birthDate);
  const meas = new Date(measurementDate);
  const totalMonths =
    (meas.getFullYear() - birth.getFullYear()) * 12 +
    (meas.getMonth() - birth.getMonth()) +
    (meas.getDate() >= birth.getDate() ? 0 : -1);

  const ageMonths = Math.max(0, totalMonths);
  const ref: ReferenceSystem = ageMonths < 60 ? "WHO" : "CDC";

  // Age text
  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;
  let ageText = "";
  if (years > 0 && months > 0) ageText = `${years} tahun ${months} bulan`;
  else if (years > 0) ageText = `${years} tahun`;
  else if (months > 0) ageText = `${months} bulan`;
  else ageText = "Baru lahir";

  const report: GrowthReport = { ageMonths, ageText, reference: ref };

  // BMI
  if (weightKg && heightCm) {
    const bmi = calcBMI(weightKg, heightCm);
    report.bmi = Math.round(bmi * 10) / 10;
  }

  // Get LMS data
  function getLMS(indicator: "weight" | "height" | "bmi"): [number, number, number] | null {
    if (ref === "WHO") {
      return getWHOLMS(indicator, sex, ageMonths);
    }
    return getCDCLMS(indicator, sex, ageMonths);
  }

  // BB/U — Weight-for-Age
  if (weightKg && weightKg > 0) {
    const lms = getLMS("weight");
    if (lms) {
      const z = calcZ(weightKg, lms[0], lms[1], lms[2]);
      const cls = ref === "WHO" ? whoBBU(z) : cdcBBU(z);
      report.bb_u = { z: Math.round(z * 100) / 100, ...cls, reference: ref };
    }
  }

  // TB/U — Height-for-Age
  if (heightCm && heightCm > 0) {
    const lms = getLMS("height");
    if (lms) {
      const z = calcZ(heightCm, lms[0], lms[1], lms[2]);
      const cls = ref === "WHO" ? whoTBU(z) : cdcTBU(z);
      report.tb_u = { z: Math.round(z * 100) / 100, ...cls, reference: ref };
    }
  }

  // BB/TB — Weight-for-Height
  // WHO: Uses BMI-for-age as proxy for BB/TB
  // CDC: Uses BMI-for-age classification
  if (weightKg && heightCm && heightCm > 0) {
    const bmi = calcBMI(weightKg, heightCm);
    report.bmi = Math.round(bmi * 10) / 10;

    if (ref === "WHO") {
      // WHO BB/TB using BMI-for-age LMS
      const lms = getLMS("bmi");
      if (lms) {
        const z = calcZ(bmi, lms[0], lms[1], lms[2]);
        const cls = whoBBTB(z);
        report.bb_tb = { z: Math.round(z * 100) / 100, ...cls, reference: "WHO" };
      }
    } else {
      // CDC: BMI-for-age
      const lms = getLMS("bmi");
      if (lms) {
        const z = calcZ(bmi, lms[0], lms[1], lms[2]);
        const cdcClass = cdcIMTU(z);
        report.bb_tb = { z: Math.round(z * 100) / 100, ...cdcClass, reference: "CDC" };
        report.imt_u = { z: Math.round(z * 100) / 100, ...cdcClass, reference: "CDC" };
      }
    }
  }

  // WHO IMT/U — separate BMI-for-age report
  if (ref === "WHO" && weightKg && heightCm) {
    const bmi = calcBMI(weightKg, heightCm);
    report.bmi = Math.round(bmi * 10) / 10;
    const lms = getLMS("bmi");
    if (lms) {
      const z = calcZ(bmi, lms[0], lms[1], lms[2]);
      report.imt_u = { z: Math.round(z * 100) / 100, ...whoIMTU(z), reference: "WHO" };
    }
  }

  // Obesitas note: if BB/TB suggests overweight/obese, confirm with BMI curve
  if (report.bb_tb && report.bb_tb.z !== null && report.bb_tb.z > 2) {
    if (ref === "CDC" && report.imt_u) {
      if (report.imt_u.z !== null && report.imt_u.z > 2) {
        report.bmiNote = "✅ Dikonfirmasi obesitas berdasarkan kurva IMT/U (BMI-for-age). Risiko komorbiditas terkait obesitas perlu dievaluasi.";
      } else if (report.imt_u.z !== null && report.imt_u.z > 1) {
        report.bmiNote = "⚠️ BB/TB menunjukkan overweight, namun IMT/U masih di rentang overweight (belum obesitas). Monitoring berkala dianjurkan.";
      } else {
        report.bmiNote = "ℹ️ BB/TB menunjukkan kegemukan tetapi IMT/U normal. Kemungkinan anak memiliki massa otot yang baik atau frame tubuh yang besar.";
      }
    } else if (ref === "WHO") {
      if (report.imt_u && report.imt_u.z !== null && report.imt_u.z > 2) {
        report.bmiNote = "✅ Dikonfirmasi obesitas berdasarkan kurva IMT/U WHO. Evaluasi klinis lebih lanjut diperlukan.";
      } else if (report.imt_u && report.imt_u.z !== null && report.imt_u.z > 1) {
        report.bmiNote = "⚠️ BB/TB menunjukkan overweight. IMT/U juga menunjukkan risiko overweight. Pertahankan pola makan sehat dan aktivitas fisik.";
      } else {
        report.bmiNote = "ℹ️ Kelebihan berat mungkin terkait tinggi badan atau kerangka besar. Lihat IMT/U untuk konfirmasi.";
      }
    }
  }

  return report;
}
