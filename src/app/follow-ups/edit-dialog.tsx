"use client";

import { useState, useEffect } from "react";
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
import { updateFollowUp, deleteFollowUp } from "@/app/actions";

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

  if (!item) return null;

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      if (item) {
        await updateFollowUp(item.id, formData);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Follow-up</DialogTitle>
          <DialogDescription>Ubah detail follow-up</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Judul</Label>
            <Input
              id="edit-title"
              name="title"
              defaultValue={item.title}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-content">Isi (opsional)</Label>
            <Textarea
              id="edit-content"
              name="content"
              defaultValue={item.content ?? ""}
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
                defaultValue={item.dueDate}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                name="status"
                defaultValue={item.status}
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
              defaultValue={item.recurrence}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="none">Tidak berulang</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>
          </div>
          <DialogFooter className="flex justify-between">
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={pending}>
              Hapus
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
