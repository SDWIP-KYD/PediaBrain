import type { Metadata } from "next";
import { CatatanKlinisClient } from "./catatan-klinis-client";

export const metadata: Metadata = {
  title: "Catatan Klinis — PediaBrain",
  description: "Catatan klinis: SOAP, resume, rujukan, pemeriksaan fisik, prosedur, surat",
};

export default function CatatanKlinisPage() {
  return <CatatanKlinisClient />;
}
