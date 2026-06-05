"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CalendarCheck,
  Menu,
  X,
  Users,
  Sparkles,
  Calculator,
  Brain,
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

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex-1 flex items-center justify-center relative">
      {/* Mobile menu button - left side */}
      <button
        className="sm:hidden p-1.5 rounded-md hover:bg-accent absolute left-0"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Brand on mobile (centered) */}
      <Link
        href="/"
        className="sm:hidden flex items-center gap-1.5 font-bold text-sm"
      >
        <Brain className="h-4 w-4 text-neon" />
        <span>PediaBrain</span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden sm:flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile dropdown - positioned relative to navbar parent */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 sm:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <nav className="absolute top-full left-0 right-0 sm:hidden z-40 mt-1 mx-2 rounded-lg border border-border bg-card shadow-2xl py-2 space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors mx-1 rounded-md",
                    isActive
                      ? "bg-neon/10 text-neon font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive && "text-neon")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </>
      )}
    </div>
  );
}
