"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createPatient } from "@/app/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const ROOMS = ["DAHLIA", "ANGGREK", "MELATI", "SERUNI"];

export function CreatePatientDialogWrapper({ iconOnly }: { iconOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    medicalRecordNo: "",
    birthDate: "",
    sex: "" as "" | "L" | "P",
    parentName: "",
    phone: "",
    address: "",
    room: "",
    bed: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    startTransition(async () => {
      const result = await createPatient({
        name: form.name.trim(),
        medicalRecordNo: form.medicalRecordNo || undefined,
        birthDate: form.birthDate || undefined,
        sex: form.sex || undefined,
        parentName: form.parentName || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        room: form.room || undefined,
        bed: form.bed || undefined,
      });
      setOpen(false);
      if (result?.id) router.push(`/pasien/${result.id}`);
    });
  }

  return (
    <>
      {iconOnly ? (
        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setOpen(true)} title="Tambah pasien">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Pasien Baru
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogTitle>Pasien Baru</DialogTitle>
          <DialogDescription>Lengkapi data pasien. Bisa diedit nanti.</DialogDescription>
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <Field label="Nama Pasien" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="No. RM" value={form.medicalRecordNo} onChange={(v) => setForm({ ...form, medicalRecordNo: v })} />
              <Field label="Tgl Lahir" type="date" value={form.birthDate} onChange={(v) => setForm({ ...form, birthDate: v })} />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-1">Jenis Kelamin</label>
              <div className="flex gap-2">
                {(["L", "P"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, sex: s })}
                    className={cn(
                      "flex-1 h-9 rounded-md border text-sm font-medium transition-colors",
                      form.sex === s
                        ? "border-neon bg-neon/10 text-neon"
                        : "border-border bg-card hover:bg-accent"
                    )}
                  >
                    {s === "L" ? "Laki-laki" : "Perempuan"}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-1">Ruang</label>
                <select
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm"
                >
                  <option value="">—</option>
                  {ROOMS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <Field label="No. Bed" value={form.bed} onChange={(v) => setForm({ ...form, bed: v })} placeholder="cth: K.01.1" />
            </div>
            <Field label="Nama Orang Tua" value={form.parentName} onChange={(v) => setForm({ ...form, parentName: v })} />
            <Field label="No. Telp" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="Alamat" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />

            <div className="flex justify-end gap-2 pt-2">
              <DialogClose render={<Button type="button" variant="outline">Batal</Button>} />
              <Button type="submit" disabled={pending || !form.name.trim()}>
                {pending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-1">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="h-9"
      />
    </div>
  );
}
