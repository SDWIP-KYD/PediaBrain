import type { Metadata } from "next";
import { CatatanGiziClient } from "./catatan-gizi-client";

export const metadata: Metadata = {
  title: "Catatan Gizi — PediaBrain",
  description: "Nutrition notes, growth monitoring, diet planning",
};

export default function CatatanGiziPage() {
  return <CatatanGiziClient />;
}
