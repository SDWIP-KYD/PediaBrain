"use client";

import { useState } from "react";
import Link from "next/link";
import { Pin, ExternalLink, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { NotePopup } from "@/components/note-popup";
import { DashboardMarkdown } from "./dashboard-markdown";

interface NoteRow {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  updatedAt: string;
}

export function DashboardPinned({ pinned }: { pinned: NoteRow[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openNote = pinned.find((n) => n.id === openId) ?? null;
  if (pinned.length === 0) return null;
  return (
    <>
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium flex items-center gap-2">
            <Pin className="h-3.5 w-3.5 text-neon" />
            Pinned Notes
          </h2>
          <Link href="/notes" className="text-xs text-muted-foreground hover:text-foreground">
            Lihat semua →
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {pinned.map((note) => (
            <button
              key={note.id}
              onClick={() => setOpenId(note.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-accent hover:border-neon/30 transition-all text-sm"
            >
              <Pin className="h-3 w-3 text-neon shrink-0" />
              <span className="truncate max-w-[200px]">{note.title}</span>
            </button>
          ))}
        </div>
      </div>
      {openNote && <NotePopup note={openNote} onClose={() => setOpenId(null)} />}
    </>
  );
}

export function DashboardNotesClient({
  recent,
}: {
  recent: NoteRow[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openNote = recent.find((n) => n.id === openId) ?? null;

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Catatan Terbaru
          </h2>
          <Link href="/notes" className="text-xs text-muted-foreground hover:text-foreground">
            Lihat semua →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">Belum ada catatan</p>
            <Link href="/notes" className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3" })}>
              Buat Catatan
            </Link>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recent.map((note) => {
              const words = note.content.split(/\s+/).slice(0, 100).join(" ");
              const hasMore = note.content.split(/\s+/).length > 100;
              return (
                <div
                  key={note.id}
                  className="rounded-lg border border-neon/20 bg-neon/5 p-3 relative group hover:border-neon/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm flex items-center gap-1.5 min-w-0">
                      {note.isPinned && <Pin className="h-3 w-3 text-neon shrink-0" />}
                      <span className="truncate">{note.title}</span>
                    </h3>
                    <button
                      onClick={() => setOpenId(note.id)}
                      className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-neon/20 text-neon hover:bg-neon hover:text-background transition-colors"
                      title="Buka catatan"
                    >
                      Buka
                      <ExternalLink className="h-2.5 w-2.5" />
                    </button>
                  </div>
                  <div className="flex gap-1 mb-1.5 flex-wrap">
                    {(note.tags as string[]).slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <button
                    onClick={() => setOpenId(note.id)}
                    className="block text-left text-xs text-muted-foreground w-full"
                  >
                    <DashboardMarkdown content={words} />
                    {hasMore && <span className="text-[10px]">...</span>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {openNote && <NotePopup note={openNote} onClose={() => setOpenId(null)} />}
    </>
  );
}
