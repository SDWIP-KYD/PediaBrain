"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Undo2, Redo2, History, Eye, Save, Pencil } from "lucide-react";
import { createNote, updateNote, autosaveNote, saveNoteVersion, getNoteVersions, restoreNoteVersion } from "@/app/actions";
import { MarkdownContent } from "@/components/markdown-content";

interface NoteData {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

interface Version {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export function NoteDialog({
  open,
  onOpenChange,
  note,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: NoteData | null;
}) {
  const [tab, setTab] = useState<"write" | "preview" | "history">("write");
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [tags, setTags] = useState(note?.tags?.join(", ") ?? "");
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [pending, setPending] = useState(false);

  const [undoStack, setUndoStack] = useState<{ title: string; content: string; tags: string }[]>([]);
  const [redoStack, setRedoStack] = useState<{ title: string; content: string; tags: string }[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);

  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSaved = useRef<{ title: string; content: string; tags: string }>({
    title: note?.title ?? "",
    content: note?.content ?? "",
    tags: note?.tags?.join(", ") ?? "",
  });

  useEffect(() => {
    if (open && note?.id) {
      getNoteVersions(note.id).then((v) => {
        setVersions(v.map((x) => ({ ...x, tags: x.tags as string[], createdAt: x.createdAt.toISOString() })));
      });
    }
  }, [open, note?.id]);

  useEffect(() => {
    if (!open) {
      setTab("write");
      setTitle(note?.title ?? "");
      setContent(note?.content ?? "");
      setTags(note?.tags?.join(", ") ?? "");
      setUndoStack([]);
      setRedoStack([]);
      setAutosaveStatus("idle");
      lastSaved.current = {
        title: note?.title ?? "",
        content: note?.content ?? "",
        tags: note?.tags?.join(", ") ?? "",
      };
    }
  }, [open, note]);

  const current = { title, content, tags };
  const isChanged = title !== lastSaved.current.title || content !== lastSaved.current.content || tags !== lastSaved.current.tags;

  const pushUndo = useCallback((prev: { title: string; content: string; tags: string }) => {
    setUndoStack((s) => [...s, prev].slice(-50));
    setRedoStack([]);
  }, []);

  function handleTitleChange(v: string) {
    pushUndo({ title, content, tags });
    setTitle(v);
  }
  function handleContentChange(v: string) {
    pushUndo({ title, content, tags });
    setContent(v);
  }
  function handleTagsChange(v: string) {
    pushUndo({ title, content, tags });
    setTags(v);
  }

  function handleUndo() {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((s) => [...s, { title, content, tags }]);
    setUndoStack((s) => s.slice(0, -1));
    setTitle(prev.title);
    setContent(prev.content);
    setTags(prev.tags);
  }

  function handleRedo() {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((s) => [...s, { title, content, tags }]);
    setRedoStack((s) => s.slice(0, -1));
    setTitle(next.title);
    setContent(next.content);
    setTags(next.tags);
  }

  useEffect(() => {
    if (!open || !note?.id || !isChanged) return;
    setAutosaveStatus("saving");
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      const tagsArr = tags.split(",").map((t) => t.trim()).filter(Boolean);
      await autosaveNote(note.id, { title, content, tags: tagsArr });
      lastSaved.current = { title, content, tags };
      setAutosaveStatus("saved");
    }, 10000);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [title, content, tags, open, note?.id, isChanged]);

  async function handleSave() {
    if (!title.trim() || !content.trim()) return;
    setPending(true);
    try {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      const fd = new FormData();
      fd.set("title", title);
      fd.set("content", content);
      fd.set("tags", tags);
      if (note) {
        await updateNote(note.id, fd);
      } else {
        await createNote(fd);
      }
      lastSaved.current = { title, content, tags };
      setAutosaveStatus("saved");
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  }

  async function handleRestoreVersion(versionId: string) {
    await restoreNoteVersion(versionId);
    if (note) {
      const [v] = versions.filter((x) => x.id === versionId);
      if (v) {
        setTitle(v.title);
        setContent(v.content);
        setTags(v.tags.join(", "));
        lastSaved.current = { title: v.title, content: v.content, tags: v.tags.join(", ") };
      }
    }
    setTab("write");
  }

  function handleOpenChange(v: boolean) {
    onOpenChange(v);
  }

  const autosaveText = autosaveStatus === "saving" ? "Menyimpan..." : autosaveStatus === "saved" ? "Tersimpan otomatis" : "";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{note ? "Edit Catatan" : "Catatan Baru"}</DialogTitle>
          <DialogDescription>
            {note
              ? "Edit catatan — autosave aktif, undo/redo tersedia"
              : "Buat catatan baru"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1 pb-1">
          <Button
            type="button"
            size="xs"
            variant={tab === "write" ? "default" : "outline"}
            onClick={() => setTab("write")}
          >
            <Pencil className="h-3 w-3 mr-1" />
            Write
          </Button>
          <Button
            type="button"
            size="xs"
            variant={tab === "preview" ? "default" : "outline"}
            onClick={() => setTab("preview")}
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
          {note && (
            <Button
              type="button"
              size="xs"
              variant={tab === "history" ? "default" : "outline"}
              onClick={() => setTab("history")}
            >
              <History className="h-3 w-3 mr-1" />
              History
            </Button>
          )}
          <div className="flex-1" />
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {tab === "write" && (
          <div className="space-y-4 overflow-y-auto flex-1 min-h-0 pr-1">
            <div className="space-y-2">
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Contoh: Protokol Tatalaksana DBD"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Konten (Markdown)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Tulis catatan dalam format Markdown..."
                rows={12}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (pisah dengan koma)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="farmakologi, dosis, DBD"
              />
            </div>
          </div>
        )}

        {tab === "preview" && (
          <div className="border rounded-lg p-3 min-h-[200px] max-h-[400px] overflow-y-auto bg-card">
            {content ? (
              <>
                <h1 className="text-lg font-bold mb-2">{title || "(Tanpa judul)"}</h1>
                <MarkdownContent content={content} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada konten</p>
            )}
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-2 overflow-y-auto flex-1 min-h-0">
            {versions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada versi sebelumnya</p>
            ) : (
              versions.map((v, i) => (
                <div key={v.id} className="rounded-lg border p-3 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(v.createdAt).toLocaleString("id-ID")} {i === 0 && <span className="text-neon">(terbaru)</span>}
                    </span>
                    <Button size="xs" variant="outline" onClick={() => handleRestoreVersion(v.id)}>
                      Restore
                    </Button>
                  </div>
                  <p className="font-medium text-xs">{v.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{v.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t sticky bottom-0 bg-popover">
          <span className="text-xs text-muted-foreground min-h-[16px]">
            {tab === "write" && note && autosaveText}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Tutup
            </Button>
            {tab === "write" && (
              <Button type="button" onClick={handleSave} disabled={pending || !title.trim() || !content.trim()}>
                <Save className="h-3.5 w-3.5 mr-1" />
                {pending ? "..." : "Simpan"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
