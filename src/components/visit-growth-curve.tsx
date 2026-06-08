"use client";

import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getDataset } from "@/lib/growth-charts/who-data";
import { valueAtZ } from "@/lib/growth-charts/who-utils";
import type { ChartIndicator } from "@/lib/growth-charts/who-data";

const Z_LINES = [-3, -2, -1, 0, 1, 2, 3];
const Z_CONFIG: Record<number, { label: string; color: string }> = {
  [-3]: { label: "-3SD", color: "#ef4444" },
  [-2]: { label: "-2SD", color: "#f59e0b" },
  [-1]: { label: "-1SD", color: "#eab308" },
  [0]: { label: "Median", color: "#22c55e" },
  [1]: { label: "+1SD", color: "#eab308" },
  [2]: { label: "+2SD", color: "#f59e0b" },
  [3]: { label: "+3SD", color: "#ef4444" },
};

function singlePatientValue(
  indicator: ChartIndicator,
  weight: string | null,
  height: string | null,
  head: string | null,
): number | null {
  if (indicator === "weight-for-age") return weight ? parseFloat(weight) : null;
  if (indicator === "height-for-age") return height ? parseFloat(height) : null;
  return head ? parseFloat(head) : null;
}

interface Props {
  sex: "L" | "P";
  weightKg: string | null;
  heightCm: string | null;
  headCircumferenceCm: string | null;
  ageMonths: number;
}

export function VisitGrowthCurve({ sex, weightKg, heightCm, headCircumferenceCm, ageMonths }: Props) {
  const [indicator, setIndicator] = useState<ChartIndicator>("weight-for-age");

  const dataset = useMemo(() => getDataset(indicator, sex), [indicator, sex]);

  const patientVal = singlePatientValue(indicator, weightKg, heightCm, headCircumferenceCm);

  // Compute reference curves
  const zSeries = useMemo(() => {
    return Z_LINES.map((z) => ({
      z,
      data: dataset.map(([month, L, M, S]) => ({
        month,
        value: parseFloat(valueAtZ(L, M, S, z).toFixed(2)),
      })),
    }));
  }, [dataset]);

  // Chart data: only show window ±6 months around patient age
  const windowMin = Math.max(0, ageMonths - 6);
  const windowMax = ageMonths + 6;

  const chartData = useMemo(() => {
    return dataset
      .filter(([month]) => month >= windowMin && month <= windowMax && month % 1 === 0)
      .map(([month]) => {
        const m = month;
        const point: Record<string, number | null> = { month: m };
        Z_LINES.forEach((z) => {
          point[`z${z}`] = zSeries.find((s) => s.z === z)!.data.find((d) => d.month === m)?.value ?? null;
        });
        return point;
      });
  }, [dataset, zSeries, windowMin, windowMax]);

  // Add patient point
  const patientData = chartData.map((d) => ({
    ...d,
    patient: d.month !== null && Math.abs(d.month - ageMonths) <= 0.5 ? patientVal : null,
  }));

  // Find which dataset points to show for the patient dot
  const hasPatientData = patientVal !== null && ageMonths >= 0 && ageMonths <= 60;

  const yLabel = indicator === "weight-for-age" ? "BB (kg)"
    : indicator === "height-for-age" ? "TB (cm)"
    : "LK (cm)";

  if (!hasPatientData) return null;

  return (
    <div className="mt-2 pt-2 border-t border-border/50">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Kurva Pertumbuhan (WHO)</span>
        <div className="flex gap-1">
          {(["weight-for-age", "height-for-age", "head-circumference-for-age"] as ChartIndicator[]).map((ind) => (
            <button
              key={ind}
              onClick={() => setIndicator(ind)}
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                indicator === ind
                  ? "bg-neon/20 text-neon font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {ind === "weight-for-age" ? "BB/U" : ind === "height-for-age" ? "TB/U" : "LK/U"}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={patientData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" strokeWidth={0.5} />
            <XAxis
              dataKey="month"
              domain={[windowMin, windowMax]}
              tick={{ fill: "#888", fontSize: 9 }}
              ticks={Array.from({ length: windowMax - windowMin + 1 }, (_: unknown, i: number) => windowMin + i).filter((m) => m % 3 === 0 || m === ageMonths)}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "#888", fontSize: 9 }}
              width={30}
            />
            <Tooltip
              contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 6, fontSize: 11 }}
              labelFormatter={(label) => `Usia ${label} bln`}
            />
            {Z_LINES.map((z) => (
              <Line
                key={z}
                type="monotone"
                dataKey={`z${z}`}
                stroke={Z_CONFIG[z].color}
                strokeDasharray={z === 0 ? undefined : "3 3"}
                strokeWidth={z === 0 ? 1.5 : 0.8}
                dot={false}
                name={Z_CONFIG[z].label}
                isAnimationActive={false}
              />
            ))}
            <Line
              type="monotone"
              dataKey="patient"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={{ r: 4, fill: "#a78bfa", stroke: "#1f2937", strokeWidth: 1.5 }}
              activeDot={{ r: 6, fill: "#a78bfa", stroke: "#fff", strokeWidth: 1.5 }}
              name={`${patientVal} ${yLabel.split(" ")[1]?.replace(/[()]/g, "") || ""}`}
              isAnimationActive={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
