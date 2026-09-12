"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, FileText, Image, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RadState, SpecialItem, SpecialResult } from "@/app/lab-lookup/types";

const RAD_STATE_UI: Record<RadState, { label: string; cls: string }> = {
  read: { label: "terbaca", cls: "border-green-500/40 text-green-300" },
  unread: { label: "gambaran basah", cls: "border-amber-500/40 text-amber-300" },
  menunggu: { label: "menunggu", cls: "border-gray-500/40 text-gray-300" },
  batal: { label: "batal", cls: "border-red-500/40 text-red-300" },
};

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
          {items.map((it, i) => {
            const st = it.state ? RAD_STATE_UI[it.state] : null;
            const body = textOf(it);
            return (
              <div key={i} className="px-3 py-2.5 space-y-1">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                  <span className="font-mono">{it.tanggal || "-"}</span>
                  {it.jenis && (
                    <Badge variant="outline" className="text-[9px]">{it.jenis}</Badge>
                  )}
                  {st && (
                    <Badge variant="outline" className={`text-[9px] ${st.cls}`}>
                      {st.label}
                    </Badge>
                  )}
                  {it.cito && (
                    <Badge variant="outline" className="text-[9px] border-red-500/50 text-red-300 gap-0.5">
                      <Zap className="h-2.5 w-2.5" /> CITO
                    </Badge>
                  )}
                  {it.viewer_url && (it.state === "read" || it.state === "unread") && (
                    <a
                      href={it.viewer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-[10px] text-blue-300 hover:underline shrink-0"
                    >
                      <Image className="h-3 w-3" /> Buka Gambar ↗
                    </a>
                  )}
                </div>
                {it.jaringan && it.jaringan !== it.jenis && (
                  <p className="text-xs font-semibold text-foreground">{it.jaringan}</p>
                )}
                {(it.klinis || it.indikasi) && (
                  <p className="text-[11px] text-muted-foreground">
                    Indikasi: {it.klinis || it.indikasi}
                  </p>
                )}
                {body ? (
                  <p className="text-xs whitespace-pre-wrap leading-relaxed text-foreground">
                    {body}
                  </p>
                ) : (
                  <p className="text-xs italic text-muted-foreground/60">
                    {it.state === "unread"
                      ? "Gambar sudah ada di PACS — belum ada kesan dari radiolog."
                      : it.state === "menunggu"
                      ? "Order dibuat — pemeriksaan belum dikerjakan."
                      : it.state === "batal"
                      ? (it.keterangan || "Order dibatalkan.")
                      : "-"}
                  </p>
                )}
              </div>
            );
          })}
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
