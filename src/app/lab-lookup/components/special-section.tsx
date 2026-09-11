"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SpecialItem, SpecialResult } from "@/app/lab-lookup/types";

const MODULES: { key: keyof SpecialResult; label: string }[] = [
  { key: "pa", label: "Patologi Anatomi" },
  { key: "rad", label: "Radiologi" },
  { key: "bmp", label: "BMP / Gambaran Darah Tepi" },
  { key: "lcs", label: "Cairan Serebrospinal" },
  { key: "immuno", label: "Imunologi" },
  { key: "ihc", label: "Imunohistokimia" },
];

function textOf(item: SpecialItem): string {
  return (
    item.kesimpulan ||
    item.kesan ||
    item.hasil ||
    ""
  );
}

function ModuleBlock({ label, items }: { label: string; items: SpecialItem[] }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-muted/20 hover:bg-muted/40 text-left"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold">{label}</span>
        <Badge variant="secondary" className="ml-auto text-[9px]">
          {items.length}
        </Badge>
      </button>
      {open && (
        <div className="divide-y divide-border/40">
          {items.map((it, i) => (
            <div key={i} className="px-3 py-2.5 space-y-1">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="font-mono">{it.tanggal || "-"}</span>
                {it.jenis && <Badge variant="outline" className="text-[9px]">{it.jenis}</Badge>}
              </div>
              {it.klinis && (
                <p className="text-[11px] text-muted-foreground">
                  Indikasi: {it.klinis}
                </p>
              )}
              <p className="text-xs whitespace-pre-wrap leading-relaxed text-foreground">
                {textOf(it) || "-"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SpecialSection({ special }: { special: SpecialResult }) {
  const active = MODULES.filter((m) => (special[m.key] || []).length > 0);
  if (active.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-neon" />
          Hasil Penunjang Khusus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {active.map((m) => (
          <ModuleBlock key={m.key} label={m.label} items={special[m.key]} />
        ))}
      </CardContent>
    </Card>
  );
}
