"use client";

import { useState } from "react";
import type { SectionBlock } from "../division-data";

function BlockRenderer({ blocks }: { blocks: SectionBlock[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        if (b.sub) {
          return (
            <p key={i} className="text-[11px] font-bold text-neon uppercase tracking-wider mt-3 first:mt-0">
              {b.sub}
            </p>
          );
        }
        if (b.p) {
          return <p key={i} className="text-sm text-foreground">{b.p}</p>;
        }
        if (b.note) {
          return <p key={i} className="text-xs text-muted-foreground italic">{b.note}</p>;
        }
        if (b.formula) {
          return (
            <div key={i} className="bg-muted/50 border border-border border-l-3 border-l-neon rounded-lg px-3 py-2 text-sm font-mono text-foreground">
              {b.formula}
            </div>
          );
        }
        if (b.warn) {
          return (
            <div key={i} className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-amber-300 leading-relaxed relative pl-8">
              <span className="absolute left-3 top-2">⚠</span>
              {b.warn}
            </div>
          );
        }
        if (b.list) {
          return (
            <ul key={i} className="space-y-1 pl-1">
              {b.list.map((item, j) => (
                <li key={j} className="relative pl-4 text-sm text-foreground before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-neon/50">
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        if (b.table) {
          return (
            <div key={i} className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs min-w-[300px]">
                <thead>
                  <tr className="bg-navy text-white">
                    {b.table.head.map((h, k) => (
                      <th key={k} className="text-left px-3 py-2 font-semibold whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.table.rows.map((r, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? "bg-muted/30" : "bg-card"}>
                      {r.map((c, ci) => (
                        <td key={ci} className={`px-3 py-2 border-t border-border ${ci === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

export function SectionAccordion({ title, blocks, defaultOpen = false }: { title: string; blocks: SectionBlock[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-neon shrink-0" />
        <span className={`text-sm font-semibold flex-1 ${open ? "text-neon" : "text-foreground"}`}>
          {title}
        </span>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <BlockRenderer blocks={blocks} />
        </div>
      )}
    </div>
  );
}

export { BlockRenderer };
