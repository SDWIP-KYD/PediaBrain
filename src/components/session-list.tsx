"use client";

import { useState } from "react";
import { Plus, Trash2, MessageCircle, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Session } from "@/lib/use-sessions";

export function SessionList({
  sessions,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  color,
}: {
  sessions: Session[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  color?: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  function startRename(s: Session) {
    setEditingId(s.id);
    setEditValue(s.title);
  }

  function confirmRename() {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
  }

  return (
    <div className="w-full lg:w-48 shrink-0 space-y-1">
      <Button size="sm" variant="outline" className="w-full h-9 text-xs gap-1.5" onClick={onNew}>
        <Plus className="h-3.5 w-3.5" /> Sesi Baru
      </Button>
      <div className="max-h-[200px] lg:max-h-[calc(100vh-280px)] overflow-y-auto space-y-0.5">
        {sessions.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">Belum ada sesi</p>
        )}
        {sessions.map((s) => {
          const isActive = s.id === activeId;
          const isEditing = s.id === editingId;
          return (
            <div
              key={s.id}
              onClick={() => !isEditing && onSelect(s.id)}
              className={cn(
                "group flex items-center gap-1.5 px-2 py-2 rounded-md text-xs cursor-pointer transition-colors min-h-[40px]",
                isActive ? "bg-neon/10 text-neon border border-neon/20" : "text-muted-foreground hover:bg-accent border border-transparent"
              )}
            >
              <MessageCircle className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-neon" : "")} />
              {isEditing ? (
                <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") confirmRename(); if (e.key === "Escape") setEditingId(null); }}
                    className="flex-1 min-w-0 h-7 px-1.5 text-xs rounded border border-border bg-background focus:outline-none"
                    autoFocus
                  />
                  <button onClick={confirmRename} className="text-green-400 p-1"><Check className="h-3.5 w-3.5" /></button>
                  <button onClick={() => setEditingId(null)} className="text-muted-foreground p-1"><X className="h-3.5 w-3.5" /></button>
                </div>
              ) : (
                <>
                  <span className="flex-1 truncate min-w-0">{s.title}</span>
                  <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); startRename(s); }}
                      className="text-muted-foreground hover:text-foreground p-1"
                      title="Rename"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (confirm("Hapus sesi ini?")) onDelete(s.id); }}
                      className="text-muted-foreground hover:text-destructive p-1"
                      title="Hapus"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
