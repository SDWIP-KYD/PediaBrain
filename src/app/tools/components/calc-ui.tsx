"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface CalcCardProps {
  title: string;
  subtitle?: string;
  icon: string;
  color?: string;
  children: ReactNode;
  className?: string;
  resultVisible?: boolean;
}

const colorMap: Record<string, { bg: string; border: string; iconBg: string }> = {
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", iconBg: "bg-purple-500/15 text-purple-400" },
  cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", iconBg: "bg-cyan-500/15 text-cyan-400" },
  green: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", iconBg: "bg-emerald-500/15 text-emerald-400" },
  red: { bg: "bg-red-500/10", border: "border-red-500/20", iconBg: "bg-red-500/15 text-red-400" },
  pink: { bg: "bg-pink-500/10", border: "border-pink-500/20", iconBg: "bg-pink-500/15 text-pink-400" },
  yellow: { bg: "bg-amber-500/10", border: "border-amber-500/20", iconBg: "bg-amber-500/15 text-amber-400" },
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", iconBg: "bg-blue-500/15 text-blue-400" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", iconBg: "bg-orange-500/15 text-orange-400" },
  teal: { bg: "bg-teal-500/10", border: "border-teal-500/20", iconBg: "bg-teal-500/15 text-teal-400" },
  slate: { bg: "bg-slate-500/10", border: "border-slate-500/20", iconBg: "bg-slate-500/15 text-slate-400" },
};

export function CalcCard({ title, subtitle, icon, color = "slate", children, className }: CalcCardProps) {
  const c = colorMap[color] || colorMap.slate;
  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
      <div className={cn("flex items-center gap-3 px-4 py-3 border-b border-border", c.bg)}>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0", c.iconBg)}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{title}</p>
          {subtitle && <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

interface CalcInputProps {
  label: string;
  value: number | string;
  onChange: (v: number | string) => void;
  type?: "number" | "text";
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CalcInput({
  label,
  value,
  onChange,
  type = "number",
  min,
  max,
  step,
  unit,
  placeholder,
  disabled,
  className,
}: CalcInputProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => {
            const v = type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
            onChange(v);
          }}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neon/30 focus:border-neon/50 disabled:opacity-50"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground font-mono">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

interface CalcSelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export function CalcSelect({ label, value, onChange, options, className }: CalcSelectProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neon/30 focus:border-neon/50"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface CalcResultProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

const resultColorMap: Record<string, string> = {
  purple: "bg-purple-500/10 border-purple-500/20",
  cyan: "bg-cyan-500/10 border-cyan-500/20",
  green: "bg-emerald-500/10 border-emerald-500/20",
  red: "bg-red-500/10 border-red-500/20",
  pink: "bg-pink-500/10 border-pink-500/20",
  yellow: "bg-amber-500/10 border-amber-500/20",
  blue: "bg-blue-500/10 border-blue-500/20",
  orange: "bg-orange-500/10 border-orange-500/20",
  teal: "bg-teal-500/10 border-teal-500/20",
  slate: "bg-slate-500/10 border-slate-500/20",
};

export function CalcResult({ children, color = "slate", className }: CalcResultProps) {
  return (
    <div className={cn("rounded-lg border p-3 space-y-2", resultColorMap[color] || resultColorMap.slate, className)}>
      {children}
    </div>
  );
}

interface ResultItemProps {
  label: string;
  value: string | number;
  unit?: string;
  note?: string;
  className?: string;
}

export function ResultItem({ label, value, unit, note, className }: ResultItemProps) {
  return (
    <div className={cn("space-y-0.5", className)}>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold font-mono">
        {value}
        {unit && <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>}
      </p>
      {note && <p className="text-[11px] text-muted-foreground">{note}</p>}
    </div>
  );
}

interface ResultGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3;
  className?: string;
}

export function ResultGrid({ children, cols = 2, className }: ResultGridProps) {
  return (
    <div
      className={cn(
        "grid gap-3",
        cols === 1 && "grid-cols-1",
        cols === 2 && "grid-cols-2",
        cols === 3 && "grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CalcButtonProps {
  onClick: () => void;
  color?: string;
  children: ReactNode;
  className?: string;
}

const btnColorMap: Record<string, string> = {
  purple: "bg-purple-500 hover:bg-purple-600",
  cyan: "bg-cyan-500 hover:bg-cyan-600",
  green: "bg-emerald-500 hover:bg-emerald-600",
  red: "bg-red-500 hover:bg-red-600",
  pink: "bg-pink-500 hover:bg-pink-600",
  yellow: "bg-amber-500 hover:bg-amber-600",
  blue: "bg-blue-500 hover:bg-blue-600",
  orange: "bg-orange-500 hover:bg-orange-600",
  teal: "bg-teal-500 hover:bg-teal-600",
  neon: "bg-neon hover:bg-neon/90",
};

export function CalcButton({ onClick, color = "neon", children, className }: CalcButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors",
        btnColorMap[color] || btnColorMap.neon,
        className
      )}
    >
      {children}
    </button>
  );
}

interface InfoBoxProps {
  children: ReactNode;
  className?: string;
}

export function InfoBox({ children, className }: InfoBoxProps) {
  return (
    <div className={cn("rounded-lg bg-muted/50 border border-border px-3 py-2 text-[11px] text-muted-foreground leading-relaxed", className)}>
      {children}
    </div>
  );
}

interface ResultAlertProps {
  children: ReactNode;
  type?: "info" | "warning" | "danger" | "success";
  className?: string;
}

const alertStyles = {
  info: "bg-blue-500/10 border-blue-500/20 text-blue-300",
  warning: "bg-amber-500/10 border-amber-500/20 text-amber-300",
  danger: "bg-red-500/10 border-red-500/20 text-red-300",
  success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
};

export function ResultAlert({ children, type = "info", className }: ResultAlertProps) {
  return (
    <div className={cn("rounded-lg border px-3 py-2 text-xs leading-relaxed", alertStyles[type], className)}>
      {children}
    </div>
  );
}

interface InlineInputProps {
  label: string;
  value: number | string;
  onChange: (v: number | string) => void;
  type?: "number" | "text";
  unit?: string;
  className?: string;
}

export function InlineInput({ label, value, onChange, type = "number", unit, className }: InlineInputProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label className="text-[10px] text-muted-foreground whitespace-nowrap min-w-[60px]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          const v = type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
          onChange(v);
        }}
        className="flex-1 rounded border border-border bg-muted/50 px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-neon/30"
      />
      {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
    </div>
  );
}
