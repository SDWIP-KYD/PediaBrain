"use client";

import { useState } from "react";
import {
  ChevronDown, ChevronRight, Calendar, Copy, Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LabVisit } from "@/app/lab-lookup/types";
import { flagValue } from "@/lib/lab-utils";

function toClipboardText(visit: LabVisit): string {
  const tgl = visit.tgl && visit.tgl !== "?" ? visit.tgl : "Tanggal ?";
  const lines = [`(${tgl})`];
  for (const p of visit.params) {
    const sat = p.satuan && p.satuan !== "0" ? ` ${p.satuan}` : "";
    lines.push(`${p.name || ""} : ${p.hasil || ""}${sat}`);
  }
  return lines.join("\n");
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/**
 * One lab visit rendered as a collapsible card.
 * Shows reference range for every parameter; subtle low/high markers only
 * (no critical alerting — clinical judgment stays with the physician).
 */
export function VisitCard({
  visit,
  defaultOpen,
}: {
  visit: LabVisit;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [copied, setCopied] = useState(false);

  const abnormalCount = visit.params.filter((p) => {
    const f = flagValue(p.hasil, p.normal);
    return f === "low" || f === "high";
  }).length;

  async function doCopy() {
    const ok = await copyText(toClipboardText(visit));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-2 pr-2 bg-muted/20 hover:bg-muted/40 transition-colors">
        <button
          onClick={() => setOpen(!open)}
          className="flex-1 flex items-center gap-2 px-3 py-2.5 text-left min-w-0"
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="text-xs font-mono">{visit.tgl}</span>
          <span className="text-[10px] text-muted-foreground">
            {visit.params.length} parameter
          </span>
          {abnormalCount > 0 && (
            <Badge
              variant="outline"
              className="ml-auto text-[9px] border-orange-500/40 text-orange-300"
            >
              {abnormalCount} di luar range
            </Badge>
          )}
        </button>
        <button
          onClick={doCopy}
          title="Salin hasil kunjungan (format konsul)"
          className="shrink-0 flex items-center gap-1 rounded px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-green-400" /> tersalin
            </>
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/50">
          <table className="w-full text-xs">
            <thead className="bg-muted/30 text-muted-foreground">
              <tr>
                <th className="text-left p-2 font-medium">Parameter</th>
                <th className="text-right p-2 font-medium">Hasil</th>
                <th className="text-right p-2 font-medium">Nilai Normal</th>
              </tr>
            </thead>
            <tbody>
              {visit.params.map((p, i) => {
                const flag = flagValue(p.hasil, p.normal);
                return (
                  <tr key={i} className="border-t border-border/40">
                    <td className="p-2">{p.name}</td>
                    <td
                      className={`p-2 text-right font-mono ${
                        flag === "low"
                          ? "text-blue-300"
                          : flag === "high"
                          ? "text-orange-300"
                          : "text-foreground"
                      }`}
                    >
                      {p.hasil}
                      {p.satuan ? ` ${p.satuan}` : ""}
                      {flag === "low" && " ↓"}
                      {flag === "high" && " ↑"}
                    </td>
                    <td className="p-2 text-right text-[10px] text-muted-foreground">
                      {p.normal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
