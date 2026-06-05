import type { Metadata } from "next";
import { ReferensiObatClient } from "./referensi-obat-client";

export const metadata: Metadata = {
  title: "Referensi Obat — PediaBrain",
  description: "Referensi 50 obat pediatrik: dosis, kontraindikasi, interaksi, penyesuaian ginjal/hati",
};

export default function ReferensiObatPage() {
  return <ReferensiObatClient />;
}
