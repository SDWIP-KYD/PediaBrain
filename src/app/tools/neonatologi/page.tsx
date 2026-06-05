import type { Metadata } from "next";
import { NeonatologiClient } from "./neonatologi-client";

export const metadata: Metadata = {
  title: "Neonatologi — PediaBrain",
  description: "NICU tools: kalkulator obat, cairan, ventilator, skor, AGD",
};

export default function NeonatologiPage() {
  return <NeonatologiClient />;
}
