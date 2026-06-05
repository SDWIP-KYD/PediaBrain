"use client";

import { PatientProvider } from "./patient-context";
import { CalculatorLinkProvider } from "./calculator-link-context";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PatientProvider>
      <CalculatorLinkProvider>
        {children}
      </CalculatorLinkProvider>
    </PatientProvider>
  );
}
