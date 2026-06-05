import type { Metadata } from "next";
import { PICUClient } from "./picu-client";

export const metadata: Metadata = {
  title: "PICU — PediaBrain",
  description: "PICU tools: resusitasi, ventilator, hemodinamik, sedasi, scoring",
};

export default function PICUPage() {
  return <PICUClient />;
}
