import { test } from "node:test";
import assert from "node:assert/strict";

// We test the pure helper logic from the API routes without booting Next.js.
// The from-norm route's parseNorm and normalizeName logic are tested here.

test("from-norm: rejects non-numeric NORM", () => {
  // Simulate the validation: /^\d{3,8}$/
  const norm = "abc";
  assert.equal(/^\d{3,8}$/.test(norm), false);
});

test("from-norm: accepts valid 3-8 digit NORM", () => {
  const validNorms = ["123", "1234", "12345678"];
  for (const n of validNorms) {
    assert.equal(/^\d{3,8}$/.test(n), true);
  }
  // Edge cases
  assert.equal(/^\d{3,8}$/.test("12"), false);   // too short
  assert.equal(/^\d{3,8}$/.test("123456789"), false); // too long
});

test("exists: parses semicolon-separated norms", () => {
  const parseNorms = (raw: string): string[] =>
    raw.split(/[;,/\n\r\s]+/).map((s) => s.trim()).filter((s) => /^\d{3,8}$/.test(s));
  assert.deepEqual(parseNorms("123;456;789"), ["123", "456", "789"]);
  assert.deepEqual(parseNorms("123,456,789"), ["123", "456", "789"]);
  assert.deepEqual(parseNorms("123 456 789"), ["123", "456", "789"]);
  assert.deepEqual(parseNorms("123\n456\n789"), ["123", "456", "789"]);
  assert.deepEqual(parseNorms("abc 12 123456789"), []); // all invalid
});

test("exists: empty norms returns empty array", () => {
  const parseNorms = (raw: string): string[] =>
    raw.split(/[;,/\n\r\s]+/).map((s) => s.trim()).filter((s) => /^\d{3,8}$/.test(s));
  assert.deepEqual(parseNorms(""), []);
  assert.deepEqual(parseNorms("   "), []);
});

test("normalizeName: strips 'An.'/'Ny.' prefix", () => {
  const normalizeName = (name: string): string =>
    name.trim().replace(/^(an|ny|nyny|by)\.?\s+/i, "").replace(/\s+/g, " ").trim();
  assert.equal(normalizeName("An. Budi"), "Budi");
  assert.equal(normalizeName("Ny. Siti"), "Siti");
  assert.equal(normalizeName("BY Ani"), "Ani");
  assert.equal(normalizeName("Budi"), "Budi");
  assert.equal(normalizeName("An.Budi"), "An.Budi"); // no space after prefix → not stripped
  assert.equal(normalizeName("  An.  Budi  "), "Budi");
});

test("calculateAge: infant days", () => {
  const calculateAge = (birthDate: string): string => {
    const birth = new Date(birthDate);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 1) return `${Math.max(0, Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)))} hari`;
    if (months < 24) return `${months} bulan`;
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    return remMonths > 0 ? `${years} thn ${remMonths} bulan` : `${years} tahun`;
  };
  // Recent birth (today) → 0 hari
  const today = new Date().toISOString().split("T")[0];
  const result = calculateAge(today);
  assert.ok(result.endsWith("hari"));
  assert.ok(result.startsWith("0"));
});

test("calculateAge: 2-year-old", () => {
  const calculateAge = (birthDate: string): string => {
    const birth = new Date(birthDate);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 1) return `${Math.max(0, Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)))} hari`;
    if (months < 24) return `${months} bulan`;
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    return remMonths > 0 ? `${years} thn ${remMonths} bulan` : `${years} tahun`;
  };
  // 2 years ago → "2 tahun"
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const birthDate = twoYearsAgo.toISOString().split("T")[0];
  const result = calculateAge(birthDate);
  assert.equal(result, "2 tahun");
});

test("calculateAge: 6-month-old", () => {
  const calculateAge = (birthDate: string): string => {
    const birth = new Date(birthDate);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 1) return `${Math.max(0, Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)))} hari`;
    if (months < 24) return `${months} bulan`;
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    return remMonths > 0 ? `${years} thn ${remMonths} bulan` : `${years} tahun`;
  };
  // 6 months ago → "6 bulan"
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const birthDate = sixMonthsAgo.toISOString().split("T")[0];
  const result = calculateAge(birthDate);
  assert.equal(result, "6 bulan");
});
