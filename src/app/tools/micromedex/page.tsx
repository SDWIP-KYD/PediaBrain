import type { Metadata } from "next";
import { MicromedexClient } from "./micromedex-client";

export const metadata: Metadata = {
  title: "Micromedex Drug Reference — PediaBrain",
  description: "953+ pediatric drug monographs from Micromedex 2026: dosing, interactions, PK, contraindications, neonatal safety",
};

export default function MicromedexPage() {
  return <MicromedexClient />;
}
