import type { Metadata } from "next";
import { CatatanKlinisClient } from "./catatan-klinis-client";

export const metadata: Metadata = {
  title: "Catatan Klinis Anak — PediaBrain",
  description: "Referensi klinis: 13 divisi, 14 kalkulator bedside, search lintas konten",
};

export default function CatatanKlinisPage() {
  return <CatatanKlinisClient />;
}
