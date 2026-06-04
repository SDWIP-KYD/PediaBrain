"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, FileText, CalendarCheck, X } from "lucide-react";
import { createNote, createFollowUp } from "@/app/actions";

export function QuickCapture() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"choose" | "note" | "followup">("choose");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleCreateNote(formData: FormData) {
    setPending(true);
    try {
      await createNote(formData);
      setOpen(false);
      setMode("choose");
    } finally {
      setPending(false);
    }
  }

  async function handleCreateFollowUp(formData: FormData) {
    setPending(true);
    try {
      await createFollowUp(formData);
      setOpen(false);
      setMode("choose");
    } finally {
      setPending(false);
    }
  }

  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (!v) setMode("choose");
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 h-12 w-12 rounded-full bg-neon text-background shadow-lg shadow-neon/20 hover:shadow-neon/40 hover:scale-105 transition-all flex items-center justify-center"
      >
        <Plus className="h-5 w-5" />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          {mode === "choose" && (
            <>
              <DialogHeader>
                <DialogTitle>Quick Capture</DialogTitle>
                <DialogDescription>Buat catatan atau follow-up baru</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setMode("note")}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent hover:border-neon/30 transition-all"
                >
                  <FileText className="h-6 w-6 text-neon" />
                  <span className="text-sm font-medium">Catatan</span>
                </button>
                <button
                  onClick={() => setMode("followup")}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent hover:border-neon/30 transition-all"
                >
                  <CalendarCheck className="h-6 w-6 text-neon" />
                  <span className="text-sm font-medium">Follow-up</span>
                </button>
              </div>
            </>
          )}

          {mode === "note" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <button onClick={() => setMode("choose")} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                  <DialogTitle>Catatan Baru</DialogTitle>
                </div>
              </DialogHeader>
              <form action={handleCreateNote} className="space-y-4 overflow-y-auto flex-1 min-h-0">
                <div className="space-y-2">
                  <Label htmlFor="qc-title">Judul</Label>
                  <Input id="qc-title" name="title" placeholder="Judul catatan" required autoFocus />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qc-content">Konten</Label>
                  <Textarea id="qc-content" name="content" placeholder="Tulis catatan..." rows={6} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qc-tags">Tags</Label>
                  <Input id="qc-tags" name="tags" placeholder="tag1, tag2" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setMode("choose")}>Batal</Button>
                  <Button type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan"}</Button>
                </div>
              </form>
            </>
          )}

          {mode === "followup" && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <button onClick={() => setMode("choose")} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                  <DialogTitle>Follow-up Baru</DialogTitle>
                </div>
              </DialogHeader>
              <form action={handleCreateFollowUp} className="space-y-4 overflow-y-auto flex-1 min-h-0">
                <div className="space-y-2">
                  <Label htmlFor="qc-title">Judul</Label>
                  <Input id="qc-title" name="title" placeholder="Cek darah rutin" required autoFocus />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qc-content">Isi (opsional)</Label>
                  <Textarea id="qc-content" name="content" placeholder="Detail tindak lanjut..." rows={2} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qc-date">Tanggal</Label>
                  <Input id="qc-date" name="dueDate" type="date" defaultValue={today} required />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setMode("choose")}>Batal</Button>
                  <Button type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan"}</Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
