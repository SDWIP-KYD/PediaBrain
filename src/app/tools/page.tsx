import type { Metadata } from "next";
import { ToolsClient } from "./tools-client";

export const metadata: Metadata = {
  title: "Tools — PediaBrain",
  description: "Kalkulator dan referensi klinis pediatric",
};

export default function ToolsPage() {
  return <ToolsClient />;
}
