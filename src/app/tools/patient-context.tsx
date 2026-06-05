"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type PatientType = "neonate" | "infant" | "child" | "adolescent" | "adult";

export interface PatientData {
  type: PatientType;
  weightGram: number;
  gestationalAge: number; // minggu (hanya untuk neonate)
  ageDays: number;
  ageMonths: number;
  ageYears: number;
  sex: "L" | "P";
  heightCm: number;
  headCircumference: number; // cm
  muac: number; // cm (Mid-Upper Arm Circumference)
}

export interface PatientContextValue {
  patient: PatientData;
  // Shorthand accessors for common fields
  weightGram: number;
  gestationalAge: number;
  ageDays: number;
  ageMonths: number;
  ageYears: number;
  sex: "L" | "P";
  heightCm: number;
  setPatient: (p: Partial<PatientData>) => void;
  setWeightGram: (g: number) => void;
  setGestationalAge: (w: number) => void;
  setAgeDays: (d: number) => void;
  setAgeMonths: (m: number) => void;
  setAgeYears: (y: number) => void;
  setSex: (s: "L" | "P") => void;
  setHeightCm: (h: number) => void;
  setHeadCircumference: (h: number) => void;
  setMuac: (m: number) => void;
  setType: (t: PatientType) => void;
  // Derived helpers
  weightKg: number;
  pma: string; // "30+1 mgg"
  category: string; // "VLBW", "ELBW", etc.
}

const defaultPatient: PatientData = {
  type: "neonate",
  weightGram: 1500,
  gestationalAge: 30,
  ageDays: 1,
  ageMonths: 0,
  ageYears: 0,
  sex: "L",
  heightCm: 40,
  headCircumference: 28,
  muac: 0,
};

function calcCategory(wg: number, ga: number): string {
  if (wg < 1000) return "ELBW";
  if (wg < 1500) return "VLBW";
  if (wg < 2500) return "LBW";
  if (ga < 37) return "Prematur";
  if (wg >= 4000) return "LBG";
  return "Normal";
}

function calcPMA(ga: number, ageDays: number): string {
  const weeks = ga + Math.floor(ageDays / 7);
  const days = ageDays % 7;
  return `${weeks}+${days} mgg`;
}

const PatientContext = createContext<PatientContextValue | null>(null);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patient, setPatientState] = useState<PatientData>(defaultPatient);

  const setPatient = useCallback((p: Partial<PatientData>) => {
    setPatientState((prev) => ({ ...prev, ...p }));
  }, []);

  const setWeightGram = useCallback((g: number) => setPatientState((p) => ({ ...p, weightGram: g })), []);
  const setGestationalAge = useCallback((w: number) => setPatientState((p) => ({ ...p, gestationalAge: w })), []);
  const setAgeDays = useCallback((d: number) => setPatientState((p) => ({ ...p, ageDays: d })), []);
  const setAgeMonths = useCallback((m: number) => setPatientState((p) => ({ ...p, ageMonths: m })), []);
  const setAgeYears = useCallback((y: number) => setPatientState((p) => ({ ...p, ageYears: y })), []);
  const setSex = useCallback((s: "L" | "P") => setPatientState((p) => ({ ...p, sex: s })), []);
  const setHeightCm = useCallback((h: number) => setPatientState((p) => ({ ...p, heightCm: h })), []);
  const setHeadCircumference = useCallback((h: number) => setPatientState((p) => ({ ...p, headCircumference: h })), []);
  const setMuac = useCallback((m: number) => setPatientState((p) => ({ ...p, muac: m })), []);
  const setType = useCallback((t: PatientType) => setPatientState((p) => ({ ...p, type: t })), []);

  const weightKg = patient.weightGram / 1000;
  const pma = calcPMA(patient.gestationalAge, patient.ageDays);
  const category = calcCategory(patient.weightGram, patient.gestationalAge);

  return (
    <PatientContext.Provider
      value={{
        patient,
        weightGram: patient.weightGram,
        gestationalAge: patient.gestationalAge,
        ageDays: patient.ageDays,
        ageMonths: patient.ageMonths,
        ageYears: patient.ageYears,
        sex: patient.sex,
        heightCm: patient.heightCm,
        setPatient,
        setWeightGram,
        setGestationalAge,
        setAgeDays,
        setAgeMonths,
        setAgeYears,
        setSex,
        setHeightCm,
        setHeadCircumference,
        setMuac,
        setType,
        weightKg,
        pma,
        category,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient(): PatientContextValue {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("usePatient must be used within PatientProvider");
  return ctx;
}
