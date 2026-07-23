"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Brain,
  UserPlus,
  Sparkles,
  CalendarClock,
  Activity,
  LogOut,
  Stethoscope,
  ClipboardList,
  CalendarDays,
  Beaker,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const quickLinks = [
  { href: "/lab", label: "Lab Browser", icon: Beaker },
  { href: "/pasien", label: "Tambah Pasien", icon: UserPlus },
  { href: "/soap", label: "SOAP Creator", icon: ClipboardList },
  { href: "/jadwal-dpjp", label: "Jadwal DPJP", icon: CalendarDays },
  { href: "/ai-toolbox", label: "AI ToolBox", icon: Sparkles },
  { href: "/follow-ups", label: "Follow-up", icon: CalendarClock },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, inpatient: 0, today: 0 });

  useEffect(() => {
    let cancelled = false;
    async function loadStats() {
      try {
        const res = await fetch("/api/stats");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setStats(data);
      } catch {}
    }
    loadStats();
    const interval = setInterval(loadStats, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [pathname]);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <button
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-card border border-border hover:bg-accent lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? (
          <PanelLeftClose className="h-4 w-4" />
        ) : (
          <PanelLeftOpen className="h-4 w-4" />
        )}
      </button>

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-card border-r border-border transition-all duration-200 flex flex-col",
          collapsed ? "w-16" : "w-56",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-3 border-b border-border h-12">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2 font-bold text-sm tracking-tight">
              <Brain className="h-4 w-4 text-neon" />
              <span>PediaBrain</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="mx-auto">
              <Brain className="h-4 w-4 text-neon" />
            </Link>
          )}
          <button
            className="hidden lg:flex p-1 rounded hover:bg-accent"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <PanelLeftClose className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Quick stats */}
        <div className={cn("p-3 border-b border-border", collapsed && "px-2")}>
          {!collapsed ? (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Quick Stats
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  href="/pasien"
                  className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-1.5 hover:bg-emerald-500/15 transition-colors"
                >
                  <p className="text-lg font-bold text-emerald-300 leading-none">{stats.inpatient}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Rawat Inap</p>
                </Link>
                <Link
                  href="/pasien"
                  className="rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-1.5 hover:bg-blue-500/15 transition-colors"
                >
                  <p className="text-lg font-bold text-blue-300 leading-none">{stats.total}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">Total Pasien</p>
                </Link>
              </div>
              {stats.today > 0 && (
                <div className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-1.5">
                  <p className="text-[10px] text-amber-200 flex items-center gap-1">
                    <Activity className="h-2.5 w-2.5" />
                    {stats.today} aktivitas hari ini
                  </p>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/pasien"
              className="flex flex-col items-center justify-center gap-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 py-1.5 hover:bg-emerald-500/15"
              title={`${stats.inpatient} rawat inap`}
            >
              <p className="text-sm font-bold text-emerald-300 leading-none">{stats.inpatient}</p>
              <Stethoscope className="h-2.5 w-2.5 text-emerald-400/60" />
            </Link>
          )}
        </div>

        {/* Quick links */}
        <nav className="flex-1 p-2 space-y-0.5">
          {!collapsed && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2.5 pt-1 pb-0.5">
              Shortcut
            </p>
          )}
          {quickLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-neon/10 text-neon font-medium border border-neon/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-neon")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border">
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className={cn(
              "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-all",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          <p className={cn(
            "text-[10px] text-muted-foreground/50 text-center mt-1",
            collapsed && "hidden"
          )}>
            v1.0
          </p>
        </div>
      </aside>
    </>
  );
}
