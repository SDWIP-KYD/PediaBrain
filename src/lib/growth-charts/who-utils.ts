/**
 * WHO Growth Standards utility functions.
 * Uses LMS method: value = M * (1 + L*S*z)^(1/L) when L ≠ 0
 *                  value = M * exp(S*z) when L = 0
 */

export interface LMSRecord {
  month: number;
  L: number;
  M: number;
  S: number;
}

export interface GrowthDataset {
  title: string;
  unit: string;
  data: LMSRecord[];
}

/** Compute value at a given z-score using LMS parameters */
export function valueAtZ(L: number, M: number, S: number, z: number): number {
  if (L === 0) return M * Math.exp(S * z);
  return M * Math.pow(1 + L * S * z, 1 / L);
}

/** Compute z-score for a given measurement */
export function computeZScores(
  value: number,
  L: number,
  M: number,
  S: number
): number {
  if (L === 0) return Math.log(value / M) / S;
  return (Math.pow(value / M, L) - 1) / (L * S);
}

/** Get the z-score lines for a dataset (-3 to +3 SD) */
export function getZSDSeries(dataset: LMSRecord[]) {
  const zScores = [-3, -2, -1, 0, 1, 2, 3];
  const labels: Record<number, string> = {
    [-3]: "-3 SD",
    [-2]: "-2 SD",
    [-1]: "-1 SD",
    0: "Median",
    1: "+1 SD",
    2: "+2 SD",
    3: "+3 SD",
  };
  const colors: Record<number, string> = {
    [-3]: "#ef4444", // red
    [-2]: "#f59e0b", // amber
    [-1]: "#eab308", // yellow
    0: "#22c55e", // green
    1: "#eab308", // yellow
    2: "#f59e0b", // amber
    3: "#ef4444", // red
  };

  return zScores.map((z) => ({
    z,
    label: labels[z],
    color: colors[z],
    data: dataset.map((r) => ({
      month: r.month,
      value: valueAtZ(r.L, r.M, r.S, z),
    })),
  }));
}

/** Interpolate LMS at a given month (for months between data points) */
export function interpolateLMS(
  dataset: LMSRecord[],
  targetMonth: number
): LMSRecord | null {
  if (dataset.length === 0) return null;
  if (targetMonth <= dataset[0].month) return dataset[0];
  if (targetMonth >= dataset[dataset.length - 1].month)
    return dataset[dataset.length - 1];

  for (let i = 0; i < dataset.length - 1; i++) {
    const curr = dataset[i];
    const next = dataset[i + 1];
    if (targetMonth >= curr.month && targetMonth <= next.month) {
      const t =
        (targetMonth - curr.month) / (next.month - curr.month);
      return {
        month: targetMonth,
        L: curr.L,
        M: curr.M + (next.M - curr.M) * t,
        S: curr.S + (next.S - curr.S) * t,
      };
    }
  }
  return null;
}

/** Get patient's z-score for a measurement at a given age in months */
export function getPatientZScores(
  dataset: LMSRecord[],
  ageMonths: number,
  measurement: number
): { zscore: number; percentile: number } | null {
  const lms = interpolateLMS(dataset, ageMonths);
  if (!lms) return null;
  const z = computeZScores(measurement, lms.L, lms.M, lms.S);
  // Approximate percentile from z-score
  const percentile = normalCDF(z);
  return { zscore: z, percentile };
}

/** Standard normal CDF approximation (Abramowitz & Stegun) */
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + p * x);
  const y =
    1 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1 + sign * y);
}

/** Display z-score category */
export function getZScoreCategory(z: number): {
  label: string;
  color: string;
} {
  if (z < -3) return { label: "Severely malnourished", color: "#ef4444" };
  if (z < -2) return { label: "Underweight/Stunted/Wasted", color: "#f59e0b" };
  if (z < -1) return { label: "At risk", color: "#eab308" };
  if (z <= 1) return { label: "Normal", color: "#22c55e" };
  if (z <= 2) return { label: "Overweight/At risk", color: "#eab308" };
  if (z <= 3) return { label: "Overweight/Obese", color: "#f59e0b" };
  return { label: "Obese", color: "#ef4444" };
}

/** Calculate age in months from birth date */
export function calcAgeMonths(
  birthDate: string | Date,
  referenceDate: string | Date
): number {
  const birth = new Date(birthDate);
  const ref = new Date(referenceDate);
  const months =
    (ref.getFullYear() - birth.getFullYear()) * 12 +
    (ref.getMonth() - birth.getMonth());
  // Account for day-of-month
  if (ref.getDate() < birth.getDate()) return months - 1;
  return months;
}
