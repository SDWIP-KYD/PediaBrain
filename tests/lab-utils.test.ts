import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMultiNorms, parseRange, flagValue, searchParams, countOutOfRange } from "../src/lib/lab-utils";
import type { LabVisit } from "@/app/lab-lookup/types";

test("parseMultiNorms: basic single norm", () => {
  assert.deepEqual(parseMultiNorms("1679157"), { norms: ["1679157"], overflow: false });
});

test("parseMultiNorms: splits on multiple delimiters", () => {
  const result = parseMultiNorms("123 456;789\n012/345,678");
  assert.deepEqual(result.norms, ["123", "456", "789", "012", "345", "678"]);
});

test("parseMultiNorms: dedupes preserving order", () => {
  const result = parseMultiNorms("123 123 456 123");
  assert.deepEqual(result.norms, ["123", "456"]);
});

test("parseMultiNorms: filters invalid (non-digit or wrong length)", () => {
  const result = parseMultiNorms("12 abc 1234 99 123456789");
  assert.deepEqual(result.norms, ["1234"]);
  // 12 is 2 digits (too short), abc is non-digit, 1234 is 4 digits (valid), 99 is 2 digits (too short), 123456789 is 9 digits (too long)
});

test("parseMultiNorms: caps at MAX_NORMS", () => {
  const norms = Array.from({ length: 150 }, (_, i) => String(i + 1).padStart(3, "0"));
  const result = parseMultiNorms(norms.join(" "));
  assert.equal(result.norms.length, 100);
  assert.equal(result.overflow, true);
});

test("parseMultiNorms: empty input", () => {
  assert.deepEqual(parseMultiNorms(""), { norms: [], overflow: false });
});

test("parseRange: parses '4.00 - 10.0'", () => {
  assert.deepEqual(parseRange("4.00 - 10.0"), { min: 4.0, max: 10.0 });
});

test("parseRange: parses comma decimals '4,5 - 12,5'", () => {
  assert.deepEqual(parseRange("4,5 - 12,5"), { min: 4.5, max: 12.5 });
});

test("parseRange: returns null for garbage", () => {
  assert.equal(parseRange("abc"), null);
});

test("flagValue: detects low value", () => {
  assert.equal(flagValue("2.0", "4.0 - 10.0"), "low");
});

test("flagValue: detects high value", () => {
  assert.equal(flagValue("12.0", "4.0 - 10.0"), "high");
});

test("flagValue: detects normal value", () => {
  assert.equal(flagValue("7.0", "4.0 - 10.0"), "normal");
});

test("flagValue: returns null for non-numeric", () => {
  assert.equal(flagValue("abc", "4.0 - 10.0"), null);
});

test("countOutOfRange: counts out-of-range params across visits", () => {
  const visits: LabVisit[] = [
    {
      tgl: "2024-01-01 10:00",
      params: [
        { name: "Hb", hasil: "2.0", normal: "4.0 - 10.0", satuan: "g/dL" }, // low
        { name: "Cr", hasil: "12.0", normal: "4.0 - 10.0", satuan: "mg/dL" }, // high
        { name: "Na", hasil: "5.0", normal: "4.0 - 10.0", satuan: "mmol/L" }, // normal
      ],
    },
    {
      tgl: "2024-01-02 10:00",
      params: [
        { name: "K", hasil: "2.0", normal: "4.0 - 10.0", satuan: "mmol/L" }, // low
      ],
    },
  ];
  assert.equal(countOutOfRange(visits), 3);
});

test("searchParams: substring match across visits, newest first", () => {
  const visits: LabVisit[] = [
    {
      tgl: "2024-01-01 10:00",
      params: [
        { name: "Hemoglobin", hasil: "12", normal: "10 - 15", satuan: "g/dL" },
        { name: "Creatinine", hasil: "0.8", normal: "0.5 - 1.2", satuan: "mg/dL" },
      ],
    },
    {
      tgl: "2024-02-01 10:00",
      params: [
        { name: "Hemoglobin", hasil: "11", normal: "10 - 15", satuan: "g/dL" },
      ],
    },
  ];
  const result = searchParams(visits, "Hem");
  assert.equal(result.length, 2);
  // newest first
  assert.equal(result[0].tgl, "2024-02-01 10:00");
  assert.equal(result[1].tgl, "2024-01-01 10:00");
});
