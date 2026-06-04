"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, FileText, Trash2 } from "lucide-react";
import {
  saveStickyToNote,
  deleteStickyNote,
  createOrUpdateSticky,
} from "@/app/actions";

export function StickyNotesSection({
  note,
}: {
  note: { id: string; content: string } | null;
}) {
  const [content, setContent] = useState(note?.content ?? "");
  const [currentId, setCurrentId] = useState<string | null>(note?.id ?? null);
  const [status, setStatus] = useState<"saved" | "saving" | "idle">("idle");
  const [pending, setPending] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!content.trim()) {
      setStatus("idle");
      return;
    }
    if (content === (note?.content ?? "")) {
      setStatus("saved");
      return;
    }
    setStatus("saving");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const id = await createOrUpdateSticky(content);
      if (id) setCurrentId(id);
      setStatus("saved");
    }, 1500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [content, note?.content]);

  async function handleSaveToNotes() {
    if (!content.trim()) return;
    setPending(true);
    let id = currentId;
    if (!id) {
      id = await createOrUpdateSticky(content);
      setCurrentId(id);
    }
    if (id) {
      await saveStickyToNote(id);
      setContent("");
      setCurrentId(null);
      setStatus("idle");
    }
    setPending(false);
  }

  async function handleClear() {
    if (currentId) {
      await deleteStickyNote(currentId);
    }
    setContent("");
    setCurrentId(null);
    setStatus("idle");
  }

  const hasContent = content.trim().length > 0;
  const statusText = status === "saving" ? "Menyimpan..." : status === "saved" ? "Tersimpan" : "";

  return (
    <div className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Tulis sesuatu di sini... quick capture, ide, reminder. Akan tersimpan otomatis."
        rows={5}
        className="text-sm resize-none max-h-[200px] overflow-y-auto"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground min-h-[16px]">
          {hasContent ? statusText : ""}
        </span>
        <div className="flex items-center gap-2">
          {hasContent && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClear}
                disabled={pending}
                className="text-xs"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Hapus
              </Button>
              <Button
                size="sm"
                onClick={handleSaveToNotes}
                disabled={pending}
                className="text-xs"
              >
                <FileText className="h-3.5 w-3.5 mr-1" />
                Simpan ke Notes
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
