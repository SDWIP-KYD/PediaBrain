// lab-utils.ts — helpers for lab data display
// NOTE: No critical-value alerting by design (clinical judgment stays with the
// physician). We only show the reference range and a subtle low/high marker.

import type { LabVisit } from "@/app/lab-lookup/types";

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

export type SearchRow = {
  tgl: string;
  name: string;
  hasil: string;
  normal: string;
  satuan: string;
};

/**
 * Cross-visit parameter search (port of Hema lookup.html searchParams rule):
 * substring match on parameter name, case-insensitive, newest first.
 */
export function searchParams(visits: LabVisit[], q: string): SearchRow[] {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  const rows: SearchRow[] = [];
  for (const v of visits) {
    const tgl = v.tgl && v.tgl !== "?" ? v.tgl.slice(0, 16) : "Tanggal ?";
    for (const p of v.params) {
      if (String(p.name || "").toLowerCase().includes(term)) {
        rows.push({ tgl, name: p.name, hasil: p.hasil, normal: p.normal, satuan: p.satuan });
      }
    }
  }
  return rows.sort((a, b) => b.tgl.localeCompare(a.tgl));
}

/** Count params outside reference range in a set of visits. */
export function countOutOfRange(visits: LabVisit[]): number {
  let n = 0;
  for (const v of visits)
    for (const p of v.params) {
      const f = flagValue(p.hasil, p.normal);
      if (f === "low" || f === "high") n++;
    }
  return n;
}

export const MAX_NORMS = 100;

export type ParsedNorms = { norms: string[]; overflow: boolean };

/**
 * Parse multi-RM input (Hema-compatible): split on ; , / newline whitespace,
 * keep pure digits 3-8 chars, dedupe preserving order, cap at MAX_NORMS.
 */
export function parseMultiNorms(input: string): ParsedNorms {
  const raw = input
    .split(/[;,/\n\r\s]+/)
    .map((s) => s.trim())
    .filter((s) => /^\d{3,8}$/.test(s));
  const seen = new Set<string>();
  const norms: string[] = [];
  for (const s of raw) {
    if (!seen.has(s)) {
      seen.add(s);
      norms.push(s);
    }
  }
  const overflow = norms.length > MAX_NORMS;
  return { norms: overflow ? norms.slice(0, MAX_NORMS) : norms, overflow };
}
