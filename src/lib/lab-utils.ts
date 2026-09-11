// lab-utils.ts — helpers for lab data display
// NOTE: No critical-value alerting by design (clinical judgment stays with the
// physician). We only show the reference range and a subtle low/high marker.

import type { LabVisit } from "@/app/lab-lookup/types";

export type TrendPoint = { date: string; value: number };

/** Parse "4.00 - 10.0" style ranges. Returns null when unparseable. */
export function parseRange(normal: string): { min: number; max: number } | null {
  if (!normal) return null;
  const m = normal.match(/(-?\d+(?:[.,]\d+)?)\s*[-–]\s*(-?\d+(?:[.,]\d+)?)/);
  if (!m) return null;
  const min = parseFloat(m[1].replace(",", "."));
  const max = parseFloat(m[2].replace(",", "."));
  if (Number.isNaN(min) || Number.isNaN(max)) return null;
  return { min, max };
}

/** Simple marker: 'low' | 'high' | 'normal' | null (null = can't evaluate). */
export function flagValue(
  hasil: string,
  normal: string
): "low" | "high" | "normal" | null {
  const value = parseFloat(String(hasil).replace(",", "."));
  if (Number.isNaN(value)) return null;
  const range = parseRange(normal);
  if (!range) return null;
  if (value < range.min) return "low";
  if (value > range.max) return "high";
  return "normal";
}

/**
 * Extract chronological trend for one parameter across visits.
 * Matches param names case-insensitively, tolerates aliases.
 */
export function extractTrend(
  visits: LabVisit[],
  names: string[]
): TrendPoint[] {
  const wanted = names.map((n) => n.toUpperCase());
  const points: TrendPoint[] = [];

  for (const v of visits) {
    for (const p of v.params) {
      const pname = p.name.toUpperCase();
      const hit = wanted.some(
        (w) => pname === w || pname.startsWith(w + " ") || pname.startsWith(w + "(")
      );
      if (!hit) continue;
      const value = parseFloat(String(p.hasil).replace(",", "."));
      if (Number.isNaN(value)) continue;
      const date = (v.tgl || "").slice(0, 10);
      if (!date) continue;
      points.push({ date, value });
      break; // one value per visit
    }
  }

  // chronological oldest → newest, dedupe same date (keep last)
  points.sort((a, b) => a.date.localeCompare(b.date));
  const byDate = new Map<string, number>();
  for (const pt of points) byDate.set(pt.date, pt.value);
  return Array.from(byDate.entries()).map(([date, value]) => ({ date, value }));
}

/** Last N days filter for trend windows. */
export function lastNDays(points: TrendPoint[], days: number): TrendPoint[] {
  if (points.length === 0) return [];
  const newest = new Date(points[points.length - 1].date).getTime();
  const cutoff = newest - days * 24 * 60 * 60 * 1000;
  return points.filter((p) => new Date(p.date).getTime() >= cutoff);
}
