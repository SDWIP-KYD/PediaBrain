"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { updatePatient } from "@/app/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Patient = {
  id: string; name: string; birthDate: string | null; sex: string | null;
  medicalRecordNo: string | null; parentName: string | null; phone: string | null; address: string | null;
};

export function EditPatientDialog({ patient }: { patient: Patient }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [form, setForm] = useState({
    name: patient.name,
    medicalRecordNo: patient.medicalRecordNo || "",
    birthDate: patient.birthDate || "",
    sex: (patient.sex || "") as "" | "L" | "P",
    parentName: patient.parentName || "",
    phone: patient.phone || "",
    address: patient.address || "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    startTransition(async () => {
      await updatePatient(patient.id, {
        name: form.name.trim(),
        medicalRecordNo: form.medicalRecordNo || undefined,
        birthDate: form.birthDate || undefined,
        sex: form.sex || undefined,
        parentName: form.parentName || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
      });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => setOpen(true)}>
        <Pencil className="h-3 w-3" /> Edit
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogTitle>Edit Data Pasien</DialogTitle>
          <DialogDescription>Perbarui informasi pasien.</DialogDescription>
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
                  <button key={s} type="button" onClick={() => setForm({ ...form, sex: s })}
                    className={cn("flex-1 h-9 rounded-md border text-sm font-medium transition-colors",
                      form.sex === s ? "border-neon bg-neon/10 text-neon" : "border-border bg-card hover:bg-accent")}>
                    {s === "L" ? "Laki-laki" : "Perempuan"}
                  </button>
                ))}
              </div>
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

function Field({ label, value, onChange, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-1">
        {label}{required && <span className="text-destructive ml-1">*</span>}
      </label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="h-9" />
    </div>
  );
}
