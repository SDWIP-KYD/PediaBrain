"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CalendarCheck,
  Users,
  Sparkles,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/pasien", label: "Pasien", icon: Users },
  { href: "/follow-ups", label: "Follow-up", icon: CalendarCheck },
  { href: "/ai-toolbox", label: "AI", icon: Sparkles },
  { href: "/tools", label: "Tools", icon: Calculator },
];

export function HeaderNav() {
  const pathname = usePathname();
  return (
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
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border flex items-center justify-around px-1 py-1 safe-area-pb">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] transition-colors min-w-[48px]",
              isActive ? "text-neon" : "text-muted-foreground"
            )}
          >
            <item.icon className={cn("h-5 w-5", isActive && "text-neon")} />
            <span className={cn(isActive && "font-medium")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
