"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateVisit } from "@/app/actions";
import { useRouter } from "next/navigation";

type Visit = {
  id: string; patientId: string; visitDate: string;
  chiefComplaint: string | null; anamnesis: string | null; physicalExam: string | null;
  weightKg: string | null; heightCm: string | null; headCircumferenceCm: string | null;
  diagnosisPrimary: string | null; diagnosisSecondary: string | null;
  therapy: string | null; notes: string | null;
  sections: Record<string, string> | null;
};

export function EditVisitDialog({ visit, compact }: { visit: Visit; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const sections = visit.sections as Record<string, string> | null;
  const [form, setForm] = useState({
    visitDate: visit.visitDate,
    weightKg: visit.weightKg || "",
    heightCm: visit.heightCm || "",
    headCircumferenceCm: visit.headCircumferenceCm || "",
    diagnosisPrimary: visit.diagnosisPrimary || "",
    diagnosisSecondary: visit.diagnosisSecondary || "",
    anamnesis: sections?.subjektif || visit.anamnesis || "",
    physicalExam: sections?.objektif || visit.physicalExam || "",
    therapy: sections?.terapi || visit.therapy || "",
    notes: visit.notes || "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const sections: Record<string, string> = {};
      if (form.anamnesis) sections.subjektif = form.anamnesis;
      if (form.physicalExam) sections.objektif = form.physicalExam;
      if (form.therapy) sections.terapi = form.therapy;
      if (form.diagnosisPrimary || form.diagnosisSecondary) {
        sections.diagnosa = [form.diagnosisPrimary, form.diagnosisSecondary].filter(Boolean).join("\n");
      }
      if (form.notes) sections.identitas = form.notes;
      await updateVisit(visit.id, {
        visitDate: form.visitDate,
        weightKg: form.weightKg || undefined,
        heightCm: form.heightCm || undefined,
        headCircumferenceCm: form.headCircumferenceCm || undefined,
        diagnosisPrimary: form.diagnosisPrimary || undefined,
        diagnosisSecondary: form.diagnosisSecondary || undefined,
        anamnesis: form.anamnesis || undefined,
        physicalExam: form.physicalExam || undefined,
        therapy: form.therapy || undefined,
        notes: form.notes || undefined,
        sections: Object.keys(sections).length > 0 ? sections : undefined,
      });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(true)} title="Edit kunjungan">
        <Pencil className="h-3 w-3 text-muted-foreground" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Edit Kunjungan — {visit.visitDate}</DialogTitle>
          <DialogDescription>Perbarui data kunjungan pasien.</DialogDescription>
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <Field label="Tanggal" type="date" value={form.visitDate} onChange={(v) => setForm({ ...form, visitDate: v })} required />
            <div className="grid grid-cols-3 gap-3">
              <Field label="BB (kg)" type="number" step="0.1" value={form.weightKg} onChange={(v) => setForm({ ...form, weightKg: v })} />
              <Field label="TB (cm)" type="number" step="0.1" value={form.heightCm} onChange={(v) => setForm({ ...form, heightCm: v })} />
              <Field label="LK (cm)" type="number" step="0.1" value={form.headCircumferenceCm} onChange={(v) => setForm({ ...form, headCircumferenceCm: v })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Diagnosis Utama" value={form.diagnosisPrimary} onChange={(v) => setForm({ ...form, diagnosisPrimary: v })} />
              <Field label="Diagnosis Sekunder" value={form.diagnosisSecondary} onChange={(v) => setForm({ ...form, diagnosisSecondary: v })} />
            </div>
            <TextareaField label="Subjektif / Anamnesis" value={form.anamnesis} onChange={(v) => setForm({ ...form, anamnesis: v })} rows={3} />
            <TextareaField label="Objektif / Pemeriksaan Fisik" value={form.physicalExam} onChange={(v) => setForm({ ...form, physicalExam: v })} rows={3} />
            <TextareaField label="Terapi" value={form.therapy} onChange={(v) => setForm({ ...form, therapy: v })} rows={3} />
            <TextareaField label="Catatan" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} rows={2} />
            <div className="flex justify-end gap-2 pt-2">
              <DialogClose render={<Button type="button" variant="outline">Batal</Button>} />
              <Button type="submit" disabled={pending}>{pending ? "Menyimpan..." : "Simpan"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, value, onChange, type = "text", step, required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; step?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">
        {label}{required && <span className="text-destructive ml-1">*</span>}
      </label>
      <Input type={type} step={step} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="h-9" />
    </div>
  );
}

function TextareaField({ label, value, onChange, rows = 2 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">{label}</label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="text-sm" />
    </div>
  );
}
