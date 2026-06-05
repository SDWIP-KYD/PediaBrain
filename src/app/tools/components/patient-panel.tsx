"use client";

import { usePatient, type PatientType } from "../patient-context";
import { cn } from "@/lib/utils";
import { User, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const patientTypeLabels: Record<PatientType, string> = {
  neonate: "Neonatus",
  infant: "Bayi",
  child: "Anak",
  adolescent: "Remaja",
  adult: "Dewasa",
};

const patientTypeOptions: { value: PatientType; label: string; ageRange: string }[] = [
  { value: "neonate", label: "Neonatus", ageRange: "0-28 hari" },
  { value: "infant", label: "Bayi", ageRange: "1 bln - 1 thn" },
  { value: "child", label: "Anak", ageRange: "1-10 thn" },
  { value: "adolescent", label: "Remaja", ageRange: "10-18 thn" },
  { value: "adult", label: "Dewasa", ageRange: ">18 thn" },
];

export function PatientPanel() {
  const p = usePatient();
  const [collapsed, setCollapsed] = useState(false);
  const isNeonate = p.patient.type === "neonate";

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-neon/5 border-b border-border hover:bg-neon/10 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-neon/15 flex items-center justify-center shrink-0">
          <User className="h-4 w-4 text-neon" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold">Data Pasien</p>
          <p className="text-[11px] text-muted-foreground font-mono">
            {p.patient.weightGram}g · {isNeonate ? `GA ${p.patient.gestationalAge}mgg` : `${p.patient.ageYears}th ${p.patient.ageMonths}bl`} · {p.patient.sex === "L" ? "Laki-laki" : "Perempuan"}
            {p.patient.type !== "neonate" && ` · ${p.patient.heightCm}cm`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon/15 text-neon font-medium">
            {patientTypeLabels[p.patient.type]}
          </span>
          {collapsed ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Body */}
      {!collapsed && (
        <div className="p-4 space-y-4">
          {/* Patient Type */}
          <div className="flex gap-1 flex-wrap">
            {patientTypeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => p.setType(opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors border",
                  p.patient.type === opt.value
                    ? "bg-neon/15 border-neon/30 text-neon"
                    : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                )}
              >
                {opt.label}
                <span className="ml-1 opacity-60">{opt.ageRange}</span>
              </button>
            ))}
          </div>

          {/* Fields grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Weight - always shown */}
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                BB {isNeonate ? "(gram)" : "(kg)"}
              </label>
              <input
                type="number"
                value={isNeonate ? p.patient.weightGram : p.weightKg}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0;
                  p.setWeightGram(isNeonate ? v : v * 1000);
                }}
                className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neon/30"
              />
            </div>

            {/* GA - only for neonate */}
            {isNeonate && (
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">GA (mgg)</label>
                <input
                  type="number"
                  value={p.patient.gestationalAge}
                  onChange={(e) => p.setGestationalAge(parseInt(e.target.value) || 30)}
                  min={20}
                  max={44}
                  className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neon/30"
                />
              </div>
            )}

            {/* Age - varies by type */}
            {isNeonate ? (
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Usia (hari)</label>
                <input
                  type="number"
                  value={p.patient.ageDays}
                  onChange={(e) => p.setAgeDays(parseInt(e.target.value) || 0)}
                  min={0}
                  max={365}
                  className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neon/30"
                />
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Usia (thn)</label>
                  <input
                    type="number"
                    value={p.patient.ageYears}
                    onChange={(e) => p.setAgeYears(parseInt(e.target.value) || 0)}
                    min={0}
                    max={100}
                    className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neon/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Usia (bln)</label>
                  <input
                    type="number"
                    value={p.patient.ageMonths}
                    onChange={(e) => p.setAgeMonths(parseInt(e.target.value) || 0)}
                    min={0}
                    max={11}
                    className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neon/30"
                  />
                </div>
              </>
            )}

            {/* Sex */}
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Jenis Kelamin</label>
              <div className="flex gap-1">
                <button
                  onClick={() => p.setSex("L")}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-medium border transition-colors",
                    p.patient.sex === "L"
                      ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
                      : "bg-muted/30 border-border text-muted-foreground"
                  )}
                >
                  Laki-laki
                </button>
                <button
                  onClick={() => p.setSex("P")}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-medium border transition-colors",
                    p.patient.sex === "P"
                      ? "bg-pink-500/15 border-pink-500/30 text-pink-400"
                      : "bg-muted/30 border-border text-muted-foreground"
                  )}
                >
                  Perempuan
                </button>
              </div>
            </div>

            {/* Height - not for neonate */}
            {!isNeonate && (
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">TB (cm)</label>
                <input
                  type="number"
                  value={p.patient.heightCm}
                  onChange={(e) => p.setHeightCm(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neon/30"
                />
              </div>
            )}

            {/* Head circumference - for neonate/infant */}
            {(isNeonate || p.patient.type === "infant") && (
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">LK (cm)</label>
                <input
                  type="number"
                  value={p.patient.headCircumference}
                  onChange={(e) => p.setHeadCircumference(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neon/30"
                />
              </div>
            )}
          </div>

          {/* Derived info */}
          <div className="flex flex-wrap gap-2">
            {isNeonate && (
              <>
                <span className="text-[10px] px-2 py-1 rounded-full bg-muted/50 border border-border font-mono">
                  PMA: {p.pma}
                </span>
                <span className="text-[10px] px-2 py-1 rounded-full bg-muted/50 border border-border font-mono">
                  Kategori: {p.category}
                </span>
              </>
            )}
            <span className="text-[10px] px-2 py-1 rounded-full bg-muted/50 border border-border font-mono">
              BB: {p.weightKg.toFixed(2)} kg
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
