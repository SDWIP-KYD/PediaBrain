"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Pin, Download, Pencil, X, ExternalLink } from "lucide-react";
import { MarkdownContent } from "@/components/markdown-content";
import { toArray } from "@/lib/utils";

interface NoteRow {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  updatedAt: string;
}

export function NotePopup({
  note,
  onEdit,
  onClose,
}: {
  note: NoteRow;
  onEdit?: () => void;
  onClose?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function close() {
    if (onClose) {
      onClose();
      return;
    }
    const next = new URLSearchParams(params.toString());
    next.delete("open");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <Dialog open={true} onOpenChange={(o) => !o && close()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-3xl w-[95vw] max-h-[85vh] p-0 gap-0 flex flex-col"
      >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-2 p-4 border-b border-border bg-card/95 backdrop-blur">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {note.isPinned && <Pin className="h-3.5 w-3.5 text-neon shrink-0" />}
              <DialogTitle className="font-semibold text-base truncate">{note.title}</DialogTitle>
              <div className="hidden sm:flex gap-1 shrink-0">
                {toArray(note.tags).slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => {
                  const blob = new Blob([`# ${note.title}\n\n${note.content}`], { type: "text/markdown" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${note.title.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                title="Download"
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
              {onEdit && (
                <Button size="sm" variant="outline" onClick={onEdit}>
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
              )}
              {!onEdit && (
                <Link href={`/notes?open=${note.id}`} onClick={close}>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    Buka
                  </Button>
                </Link>
              )}
              <DialogClose render={<Button size="icon-sm" variant="ghost"><X className="h-4 w-4" /></Button>} />
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1 min-h-0">
            <MarkdownContent content={note.content} />
          </div>
          <div className="flex justify-center p-2 border-t border-border bg-muted/20">
            <DialogClose render={<Button size="sm" variant="secondary" className="text-xs"><X className="h-3.5 w-3.5 mr-1" />Tutup</Button>} />
          </div>
      </DialogContent>
    </Dialog>
  );
}

export function useNoteFromUrl(notes: NoteRow[]) {
  const params = useSearchParams();
  const openId = params.get("open");
  const [fetchedNote, setFetchedNote] = useState<NoteRow | null>(null);

  // Synchronous lookup — pure computation, no effect needed
  const localNote = useMemo(() => {
    if (!openId) return null;
    return notes.find((n) => n.id === openId) ?? null;
  }, [openId, notes]);

  // Async fallback: fetch individual note when local array hasn't loaded it yet
  // setState only inside async callbacks (.then/.catch), never in effect body
  useEffect(() => {
    if (!openId || localNote || notes.length > 0) return;

    const controller = new AbortController();
    fetch(`/api/notes/${openId}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (!controller.signal.aborted) {
          setFetchedNote(data && data.id ? data : null);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setFetchedNote(null);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  // When openId is cleared, computed result is already null via useMemo
  const note = openId ? (localNote ?? fetchedNote) : null;

  return { note };
}
