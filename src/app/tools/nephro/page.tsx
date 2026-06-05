import type { Metadata } from "next";
import { NephroClient } from "./nephro-client";

export const metadata: Metadata = {
  title: "Nefrologi — PediaBrain",
  description: "Nefrologi tools: GFR, AKI, elektrolit, dialisis, transplantasi",
};

export default function NephroPage() {
  return <NephroClient />;
}
