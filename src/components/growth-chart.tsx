"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { getDataset } from "@/lib/growth-charts/who-data";
import { valueAtZ } from "@/lib/growth-charts/who-utils";
import { computeReport, type GrowthReport, type ZScoreResult } from "@/lib/growth-charts/interpreter";
import type { ChartIndicator } from "@/lib/growth-charts/who-data";

interface Measurement {
  visitId: string;
  visitDate: string;
  ageMonths: number;
  weightKg: string | null;
  heightCm: string | null;
  headCircumferenceCm: string | null;
}

interface Props {
  patientSex: "L" | "P" | null;
  birthDate: string | null;
  measurements: Measurement[];
}

const Z_LINES = [-3, -2, -1, 0, 1, 2, 3];
const Z_CONFIG: Record<number, { label: string; color: string; dash: string }> = {
  [-3]: { label: "-3 SD", color: "#ef4444", dash: "3 3" },
  [-2]: { label: "-2 SD", color: "#f59e0b", dash: "3 3" },
  [-1]: { label: "-1 SD", color: "#eab308", dash: "3 3" },
  [0]: { label: "Median", color: "#22c55e", dash: "" },
  [1]: { label: "+1 SD", color: "#eab308", dash: "3 3" },
  [2]: { label: "+2 SD", color: "#f59e0b", dash: "3 3" },
  [3]: { label: "+3 SD", color: "#ef4444", dash: "3 3" },
};

function zColor(z: number): string {
  if (z > 3) return "#ef4444";
  if (z > 2) return "#f59e0b";
  if (z >= -2) return "#22c55e";
  if (z >= -3) return "#f59e0b";
  return "#ef4444";
}

export function GrowthChartCard({ patientSex, birthDate, measurements }: Props) {
  const [chartIndicator, setChartIndicator] = useState<ChartIndicator>("weight-for-age");

  const sex = patientSex === "L" ? "L" : "P";
  const dataset = useMemo(() => getDataset(chartIndicator, sex), [chartIndicator, sex]);

  // Get most recent measurement with weight AND height
  const latestMeas = useMemo(() => {
    // Most recent visit that has weight
    return [...measurements].sort((a, b) => b.ageMonths - a.ageMonths).find(m => m.weightKg || m.heightCm) || null;
  }, [measurements]);

  // Compute full growth report
  const report = useMemo((): GrowthReport | null => {
    if (!latestMeas || !birthDate) return null;
    return computeReport(
      latestMeas.weightKg ? parseFloat(latestMeas.weightKg) : null,
      latestMeas.heightCm ? parseFloat(latestMeas.heightCm) : null,
      null, // head circ (not used in interpretation)
      birthDate,
      latestMeas.visitDate,
      sex,
    );
  }, [latestMeas, birthDate, sex]);

  const zSeries = useMemo(() => {
    return Z_LINES.map((z) => {
      const data = dataset.map(([month, L, M, S]) => ({
        month,
        value: parseFloat(valueAtZ(L, M, S, z).toFixed(2)),
      }));
      return { z, data };
    });
  }, [dataset]);

  const patientPoints = useMemo(() => {
    return measurements
      .filter((m) => {
        const val = chartIndicator === "weight-for-age" ? m.weightKg
          : chartIndicator === "height-for-age" ? m.heightCm
          : chartIndicator === "head-circumference-for-age" ? m.headCircumferenceCm
          : null;
        return val !== null && val !== "" && m.ageMonths >= 0;
      })
      .map((m) => {
        const val = chartIndicator === "weight-for-age" ? m.weightKg!
          : chartIndicator === "height-for-age" ? m.heightCm!
          : m.headCircumferenceCm!;
        return {
          month: m.ageMonths,
          value: parseFloat(parseFloat(val).toFixed(2)),
          date: m.visitDate,
        };
      })
      .sort((a, b) => a.month - b.month);
  }, [measurements, chartIndicator]);

  const axisDomain = useMemo(() => {
    const allValues = zSeries.flatMap((s) => s.data.map((d) => d.value));
    patientPoints.forEach((p) => allValues.push(p.value));
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const padding = (max - min) * 0.1;
    return [Math.max(0, min - padding), max + padding];
  }, [zSeries, patientPoints]);

  const chartData = useMemo(() => {
    const months = dataset.map(([m]) => m);
    return months.map((month, i) => {
      const point: Record<string, number | null> = { month };
      Z_LINES.forEach((z) => {
        point[`z${z}`] = zSeries.find((s) => s.z === z)!.data[i].value;
      });
      return point;
    });
  }, [dataset, zSeries]);

  const yLabel = chartIndicator === "weight-for-age" ? "BB (kg)"
    : chartIndicator === "height-for-age" ? "TB (cm)"
    : "LK (cm)";

  const unit = chartIndicator === "weight-for-age" ? "kg" : "cm";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Kurva Pertumbuhan {report?.reference || "WHO"}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{sex === "L" ? "♂ Laki-laki" : "♀ Perempuan"}</Badge>
            {report && <Badge variant="secondary" className="text-xs">{report.ageText}</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Interpretation Report */}
        {report && renderGrowthReport(report)}

        {/* Chart Tabs */}
        <Tabs value={chartIndicator} onValueChange={(v) => setChartIndicator(v as ChartIndicator)} className="mb-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="weight-for-age" className="text-xs">BB/U</TabsTrigger>
            <TabsTrigger value="height-for-age" className="text-xs">TB/U</TabsTrigger>
            <TabsTrigger value="head-circumference-for-age" className="text-xs">LK/U</TabsTrigger>
          </TabsList>
        </Tabs>

        {patientPoints.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Belum ada data antropometri. Masukkan BB/TB/LK saat menambahkan kunjungan.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Latest measurement badge */}
            <div className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
              <div className="text-xs">
                <span className="text-muted-foreground">Pengukuran terbaru:</span>
                <span className="font-bold ml-1">
                  {patientPoints[patientPoints.length - 1]?.value} {unit}
                </span>
                <span className="text-muted-foreground ml-2">
                  (usia {patientPoints[patientPoints.length - 1]?.month} bln)
                </span>
              </div>
            </div>

            {/* Chart */}
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="month"
                    label={{ value: "Usia (bulan)", position: "bottom", style: { fill: "#888", fontSize: 11 } }}
                    tick={{ fill: "#888", fontSize: 10 }}
                  />
                  <YAxis
                    domain={axisDomain}
                    label={{ value: yLabel, angle: -90, position: "insideLeft", style: { fill: "#888", fontSize: 11 } }}
                    tick={{ fill: "#888", fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }}
                    labelFormatter={(label) => `Usia ${label} bulan`}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />

                  {Z_LINES.map((z) => (
                    <Line
                      key={z}
                      type="monotone"
                      dataKey={`z${z}`}
                      stroke={Z_CONFIG[z].color}
                      strokeDasharray={Z_CONFIG[z].dash || undefined}
                      strokeWidth={z === 0 ? 2 : 1}
                      dot={false}
                      name={Z_CONFIG[z].label}
                      isAnimationActive={false}
                    />
                  ))}

                  {/* Patient data as scatter points cannot be overlaid easily on lines in recharts in composable way */}
                  {/* We'll use plain line chart with dots */}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Measurement history */}
            {patientPoints.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <p className="font-semibold mb-1">Riwayat Pengukuran:</p>
                <div className="space-y-1">
                  {[...patientPoints].reverse().map((p, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-gray-800 py-0.5">
                      <span>{p.date}</span>
                      <span className="font-mono">{p.value} {unit}</span>
                      <span className="font-mono text-[10px]">@{p.month} bln</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Full growth interpretation report ────────────────────────

function renderGrowthReport(report: GrowthReport) {
  const renders: React.ReactNode[] = [];

  renders.push(
    <div key="header" className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
      <Badge variant={report.reference === "WHO" ? "default" : "secondary"} className="text-xs">
        Referensi: {report.reference} {report.reference === "WHO" ? "(0-5 thn)" : "(≥5 thn)"}
      </Badge>
      {report.bmi && <Badge variant="outline" className="text-xs">BMI: {report.bmi}</Badge>}
    </div>
  );

  if (report.bb_u) renders.push(renderRow("BB/U", "Berat Badan / Usia", report.bb_u));
  if (report.tb_u) renders.push(renderRow("TB/U", "Tinggi Badan / Usia", report.tb_u));
  if (report.bb_tb) renders.push(renderRow("BB/TB", "Berat Badan / Tinggi Badan", report.bb_tb));
  if (report.imt_u) renders.push(renderRow("IMT/U", "Indeks Massa Tubuh / Usia", report.imt_u));

  // Obesity confirmation note
  if (report.bmiNote) {
    renders.push(
      <div key="note" className="mt-2 text-xs bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2 leading-relaxed">
        {report.bmiNote}
      </div>
    );
  }

  return (
    <div className="mb-4 bg-gray-900/50 rounded-lg p-3 text-xs space-y-1">
      {renders}
    </div>
  );
}

function renderRow(label: string, desc: string, result: ZScoreResult) {
  const color = result.z !== null ? zColor(result.z) : "#888";
  return (
    <div key={label} className="flex items-start gap-2 py-1 border-b border-gray-800/50 last:border-0">
      <span className="font-bold text-[11px] w-12 shrink-0 text-neon">{label}</span>
      <span className="text-muted-foreground hidden sm:inline w-36 shrink-0">{desc}:</span>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {result.z !== null && (
            <Badge className="text-[10px] h-5" style={{ backgroundColor: color, color: "#000" }}>
              Z = {result.z > 0 ? "+" : ""}{result.z}
            </Badge>
          )}
          <span className="font-medium" style={{ color }}>{result.c}</span>
        </div>
        <p className="text-muted-foreground mt-0.5">{result.i}</p>
      </div>
    </div>
  );
}
