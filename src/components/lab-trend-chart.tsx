"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LabVisit } from "@/app/lab-lookup/types";
import { extractTrend, lastNDays, parseRange } from "@/lib/lab-utils";

type TrendDef = {
  title: string;
  names: string[]; // param name aliases to match
  unit: string;
  refExample: string; // fallback reference text if not found in data
};

const TRENDS: TrendDef[] = [
  { title: "Hemoglobin", names: ["HGB", "HB", "HEMOGLOBIN"], unit: "g/dL", refExample: "12.0 - 16.0" },
  { title: "Trombosit", names: ["PLT", "TROMBOSIT", "PLATELET"], unit: "/µL", refExample: "150 - 400" },
  { title: "Leukosit", names: ["WBC", "LEUKOSIT"], unit: "/µL", refExample: "4.0 - 10.0" },
];

function MiniTrend({
  def,
  visits,
}: {
  def: TrendDef;
  visits: LabVisit[];
}) {
  const { points, ref } = useMemo(() => {
    const raw = extractTrend(visits, def.names);
    const pts = lastNDays(raw, 14);
    // find a reference range from the actual data if present
    let refStr = def.refExample;
    for (const v of visits) {
      const p = v.params.find((pp) =>
        def.names.some((n) => pp.name.toUpperCase().startsWith(n))
      );
      if (p && parseRange(p.normal)) {
        refStr = p.normal;
        break;
      }
    }
    return { points: pts, ref: parseRange(refStr) };
  }, [visits, def]);

  if (points.length < 2) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            {def.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground/60 italic py-4 text-center">
            Data belum cukup untuk trend
          </p>
        </CardContent>
      </Card>
    );
  }

  const values = points.map((p) => p.value);
  const lo = Math.min(...values, ref?.min ?? Infinity);
  const hi = Math.max(...values, ref?.max ?? -Infinity);
  const pad = (hi - lo) * 0.15 || 1;

  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
          <span>{def.title}</span>
          <span className="font-mono text-foreground">
            {values[values.length - 1]} {def.unit}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={points} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            {ref && (
              <ReferenceArea
                y1={ref.min}
                y2={ref.max}
                fill="rgba(34,197,94,0.08)"
                stroke="none"
              />
            )}
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9 }}
              tickFormatter={(d: string) => d.slice(5)}
              stroke="rgba(255,255,255,0.3)"
            />
            <YAxis
              domain={[lo - pad, hi + pad]}
              tick={{ fontSize: 9 }}
              stroke="rgba(255,255,255,0.3)"
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 11,
              }}
              formatter={(v) => [`${v} ${def.unit}`, def.title]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--color-neon)"
              strokeWidth={2}
              dot={{ r: 2.5 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function LabTrendChart({ visits }: { visits: LabVisit[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {TRENDS.map((def) => (
        <MiniTrend key={def.title} def={def} visits={visits} />
      ))}
    </div>
  );
}
