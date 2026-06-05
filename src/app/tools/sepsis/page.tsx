import type { Metadata } from "next";
import { SepsisClient } from "./sepsis-client";

export const metadata: Metadata = {
  title: "Sepsis — PediaBrain",
  description: "SSC pediatric sepsis bundle compliance tracker",
};

export default function SepsisPage() {
  return <SepsisClient />;
}
