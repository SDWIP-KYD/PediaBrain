"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { LabVisit } from "@/app/lab-lookup/types";
import { flagValue } from "@/lib/lab-utils";

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

  const abnormalCount = visit.params.filter((p) => {
    const f = flagValue(p.hasil, p.normal);
    return f === "low" || f === "high";
  }).length;

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
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
