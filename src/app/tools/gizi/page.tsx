import type { Metadata } from "next";
import { GiziClient } from "./gizi-client";

export const metadata: Metadata = {
  title: "Gizi — PediaBrain",
  description: "Kalkulator gizi pediatric: antropometri, kalori, protein, mikronutrien, feeding",
};

export default function GiziPage() {
  return <GiziClient />;
}
