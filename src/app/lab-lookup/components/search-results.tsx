"use client";

import { SearchRow, flagValue } from "@/lib/lab-utils";

/**
 * Flat cross-visit search result table (Hema lookup.html style):
 * Tanggal | Parameter | Hasil | Nilai Normal | Satuan, newest first.
 */
export function SearchResultsTable({
  rows,
  query,
  visitCount,
}: {
  rows: SearchRow[];
  query: string;
  visitCount: number;
}) {
  if (rows.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic py-3">
        ❌ Parameter &quot;{query}&quot; tidak ditemukan di semua {visitCount}{" "}
        kunjungan.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      <div className="rounded-md bg-muted/30 border-l-2 border-neon px-2.5 py-1.5 text-[11px]">
        🔎 <b>{rows.length}</b> hasil untuk &quot;<b>{query}</b>&quot; di{" "}
        {visitCount} kunjungan
      </div>
      <div className="rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/30 text-muted-foreground">
            <tr>
              <th className="text-left p-2 font-medium whitespace-nowrap">Tanggal</th>
              <th className="text-left p-2 font-medium">Parameter</th>
              <th className="text-right p-2 font-medium">Hasil</th>
              <th className="text-right p-2 font-medium">Nilai Normal</th>
              <th className="text-left p-2 font-medium">Satuan</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const flag = flagValue(r.hasil, r.normal);
              return (
                <tr key={i} className="border-t border-border/40">
                  <td className="p-2 font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                    {r.tgl}
                  </td>
                  <td className="p-2">{r.name}</td>
                  <td
                    className={`p-2 text-right font-mono ${
                      flag === "low"
                        ? "text-blue-300"
                        : flag === "high"
                        ? "text-orange-300"
                        : "text-foreground"
                    }`}
                  >
                    {r.hasil}
                    {flag === "low" && " ↓"}
                    {flag === "high" && " ↑"}
                  </td>
                  <td className="p-2 text-right text-[10px] text-muted-foreground">
                    {r.normal}
                  </td>
                  <td className="p-2 text-[10px] text-muted-foreground">{r.satuan}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
