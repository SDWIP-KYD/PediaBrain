"use client";

import { useState } from "react";
import { Brain, FileText, ClipboardList, Stethoscope, MessageCircle, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LaporanTool } from "./laporan-tool";
import { NoteTool } from "./note-tool";
import { ClinicalTool } from "./clinical-tool";
import { GeneralTool } from "./general-tool";

const tools = [
  { id: "laporan", label: "Laporan Pasien", icon: FileText, color: "text-neon", desc: "Extract laporan → simpan ke Pasien" },
  { id: "note", label: "Notes", icon: ClipboardList, color: "text-blue-400", desc: "Buat catatan medis" },
  { id: "clinical", label: "Clinical Assistant", icon: Stethoscope, color: "text-green-400", desc: "Tanya seputar kedokteran anak" },
  { id: "general", label: "General", icon: MessageCircle, color: "text-purple-400", desc: "Chat bebas dengan AI" },
] as const;

type ToolId = (typeof tools)[number]["id"];

export function AIToolboxClient() {
  const [activeTool, setActiveTool] = useState<ToolId>("laporan");

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl flex items-center gap-2">
            <Brain className="h-5 w-5 text-neon" />
            AI ToolBox
          </h1>
          <p className="text-sm text-muted-foreground">AI-powered tools untuk produktivitas klinis</p>
        </div>
      </div>

      {/* Tool tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium whitespace-nowrap transition-all shrink-0",
                isActive
                  ? "border-neon/40 bg-neon/10 text-neon"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", isActive ? "text-neon" : t.color)} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active tool */}
      <div className="rounded-xl border border-border bg-card p-4">
        {activeTool === "laporan" && <LaporanTool />}
        {activeTool === "note" && <NoteTool />}
        {activeTool === "clinical" && <ClinicalTool />}
        {activeTool === "general" && <GeneralTool />}
      </div>
    </div>
  );
}
