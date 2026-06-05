"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface CalculatorOutput {
  calculatorId: string;
  label: string;
  value: string | number;
  unit: string;
  timestamp: number;
}

interface CalculatorLinkContextValue {
  outputs: Record<string, CalculatorOutput>;
  setOutput: (calcId: string, label: string, value: string | number, unit: string) => void;
  getOutput: (calcId: string) => CalculatorOutput | undefined;
  getAllOutputs: () => CalculatorOutput[];
  clearOutputs: () => void;
}

const CalculatorLinkContext = createContext<CalculatorLinkContextValue | null>(null);

export function CalculatorLinkProvider({ children }: { children: ReactNode }) {
  const [outputs, setOutputs] = useState<Record<string, CalculatorOutput>>({});

  const setOutput = useCallback((calcId: string, label: string, value: string | number, unit: string) => {
    setOutputs((prev) => ({
      ...prev,
      [calcId]: { calculatorId: calcId, label, value, unit, timestamp: Date.now() },
    }));
  }, []);

  const getOutput = useCallback((calcId: string) => outputs[calcId], [outputs]);

  const getAllOutputs = useCallback(() => Object.values(outputs), [outputs]);

  const clearOutputs = useCallback(() => setOutputs({}), []);

  return (
    <CalculatorLinkContext.Provider value={{ outputs, setOutput, getOutput, getAllOutputs, clearOutputs }}>
      {children}
    </CalculatorLinkContext.Provider>
  );
}

export function useCalculatorLink() {
  const ctx = useContext(CalculatorLinkContext);
  if (!ctx) throw new Error("useCalculatorLink must be used within CalculatorLinkProvider");
  return ctx;
}
