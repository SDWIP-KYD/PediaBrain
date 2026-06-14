"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Keyboard } from "lucide-react";

const SHORTCUTS = [
  { key: "k", label: "Board Pasien", href: "/pasien", modifier: "alt" },
  { key: "n", label: "Tambah Notes", href: "/notes", modifier: "alt" },
  { key: "j", label: "Jadwal DPJP", href: "/jadwal-dpjp", modifier: "alt" },
  { key: "f", label: "Follow-up", href: "/follow-ups", modifier: "alt" },
  { key: "t", label: "AI Toolbox", href: "/ai-toolbox", modifier: "alt" },
  { key: "d", label: "Dashboard", href: "/", modifier: "alt" },
] as const;

function readSeenFlag(): boolean {
  if (typeof window === "undefined") return true;
  return !!localStorage.getItem("pedibrain_shortcuts_seen");
}

export function KeyboardShortcuts() {
  const router = useRouter();
  // Lazy initializer avoids setState-in-effect warning
  const [showHint, setShowHint] = useState<boolean>(() => !readSeenFlag());

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!e.altKey) return;
      const key = e.key.toLowerCase();
      const shortcut = SHORTCUTS.find((s) => s.key === key);
      if (!shortcut) return;
      e.preventDefault();
      e.stopPropagation();
      router.push(shortcut.href);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  useEffect(() => {
    if (!showHint) return;
    const t = setTimeout(() => {
      setShowHint(false);
      try { localStorage.setItem("pedibrain_shortcuts_seen", "true"); } catch {}
    }, 8000);
    return () => clearTimeout(t);
  }, [showHint]);

  return (
    <>
      {showHint && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 sm:bottom-6 sm:left-auto sm:translate-x-0 sm:right-6">
          <div className="rounded-xl border border-border bg-card/95 backdrop-blur shadow-xl p-3 text-xs max-w-[280px]">
            <div className="flex items-center gap-1.5 mb-2">
              <Keyboard className="h-3 w-3 text-muted-foreground" />
              <span className="font-semibold">Keyboard Shortcuts</span>
            </div>
            <div className="space-y-1">
              {SHORTCUTS.map((s) => (
                <div key={s.key} className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{s.label}</span>
                  <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">
                    <span className="text-muted-foreground">Alt</span>
                    <span>+</span>
                    <span className="uppercase font-bold">{s.key}</span>
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
