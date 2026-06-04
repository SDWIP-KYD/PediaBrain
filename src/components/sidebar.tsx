"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CalendarCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Brain,
  Calculator,
  Users,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/pasien", label: "Pasien", icon: Users },
  { href: "/follow-ups", label: "Follow-up", icon: CalendarCheck },
  { href: "/ai-toolbox", label: "AI ToolBox", icon: Sparkles },
  { href: "/tools", label: "Tools", icon: Calculator },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map((item) => {
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
          <p className={cn(
            "text-[10px] text-muted-foreground/50 text-center",
            collapsed && "hidden"
          )}>
            v1.0
          </p>
        </div>
      </aside>
    </>
  );
}
