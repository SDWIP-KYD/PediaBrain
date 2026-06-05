"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateFollowUp, deleteFollowUp, autosaveFollowUp } from "@/app/actions";

interface FollowUpData {
  id: string;
  title: string;
  content: string | null;
  dueDate: string;
  status: string;
  recurrence: string;
}

export function EditFollowUpDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FollowUpData | null;
}) {
  const [pending, setPending] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [title, setTitle] = useState(item?.title ?? "");
  const [content, setContent] = useState(item?.content ?? "");
  const [dueDate, setDueDate] = useState(item?.dueDate ?? "");
  const [status, setStatus] = useState(item?.status ?? "PENDING");
  const [recurrence, setRecurrence] = useState(item?.recurrence ?? "none");
  const lastSaved = useRef<{ title: string; content: string; dueDate: string; status: string; recurrence: string } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setContent(item.content ?? "");
      setDueDate(item.dueDate);
      setStatus(item.status);
      setRecurrence(item.recurrence);
      lastSaved.current = {
        title: item.title,
        content: item.content ?? "",
        dueDate: item.dueDate,
        status: item.status,
        recurrence: item.recurrence,
      };
      setAutosaveStatus("idle");
    }
  }, [item?.id]);

  if (!item) return null;

  const current = { title, content, dueDate, status, recurrence };
  const isChanged = !lastSaved.current ||
    title !== lastSaved.current.title ||
    content !== lastSaved.current.content ||
    dueDate !== lastSaved.current.dueDate ||
    status !== lastSaved.current.status ||
    recurrence !== lastSaved.current.recurrence;

  useEffect(() => {
    if (!open || !item?.id || !isChanged || !lastSaved.current) return;
    setAutosaveStatus("saving");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      await autosaveFollowUp(item.id, {
        title,
        content: content || null,
        dueDate,
        status,
        recurrence,
      });
      lastSaved.current = { title, content, dueDate, status, recurrence };
      setAutosaveStatus("saved");
    }, 10000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [title, content, dueDate, status, recurrence, open, item?.id, isChanged]);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (item) {
        await updateFollowUp(item.id, formData);
        lastSaved.current = {
          title: formData.get("title") as string,
          content: (formData.get("content") as string) || "",
          dueDate: formData.get("dueDate") as string,
          status: (formData.get("status") as string) || "PENDING",
          recurrence: (formData.get("recurrence") as string) || "none",
        };
        setAutosaveStatus("saved");
        onOpenChange(false);
      }
    } finally {
      setPending(false);
    }
  }

  async function handleDelete() {
    if (!item) return;
    if (!confirm(`Hapus follow-up "${item.title}"?`)) return;
    setPending(true);
    try {
      await deleteFollowUp(item.id);
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  }

  const autosaveText = autosaveStatus === "saving" ? "Menyimpan otomatis..." : autosaveStatus === "saved" ? "Tersimpan otomatis" : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Follow-up</DialogTitle>
          <DialogDescription>Ubah detail follow-up — autosave setiap 10 detik</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Judul</Label>
            <Input
              id="edit-title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-content">Isi (opsional)</Label>
            <Textarea
              id="edit-content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">Tanggal</Label>
              <Input
                id="edit-dueDate"
                name="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Selesai</option>
                <option value="CANCELLED">Dibatalkan</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-recurrence">Berulang</Label>
            <select
              id="edit-recurrence"
              name="recurrence"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="none">Tidak berulang</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>
          </div>
        </form>
        <DialogFooter className="flex justify-between border-t pt-3">
          <div className="flex items-center gap-2">
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={pending} size="sm">
              Hapus
            </Button>
            <span className="text-[10px] text-muted-foreground min-h-[14px]">
              {autosaveText}
            </span>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="sm">
              Batal
            </Button>
            <Button type="button" onClick={() => {
              const fd = new FormData();
              fd.set("title", title);
              fd.set("content", content);
              fd.set("dueDate", dueDate);
              fd.set("status", status);
              fd.set("recurrence", recurrence);
              handleSubmit(fd);
            }} disabled={pending} size="sm">
              {pending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
