"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createVisit } from "@/app/actions";

interface LabRow { testName: string; result: string; unit: string; referenceRange: string; flag: string }
interface MedRow { drugName: string; dose: string; frequency: string; duration: string; route: string }

export function AddVisitDialogWrapper({ patientId, compact }: { patientId: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    visitDate: new Date().toISOString().split("T")[0],
    chiefComplaint: "",
    anamnesis: "",
    physicalExam: "",
    weightKg: "",
    heightCm: "",
    headCircumferenceCm: "",
    diagnosisPrimary: "",
    diagnosisSecondary: "",
    therapy: "",
    notes: "",
  });
  const [labs, setLabs] = useState<LabRow[]>([{ testName: "", result: "", unit: "", referenceRange: "", flag: "" }]);
  const [meds, setMeds] = useState<MedRow[]>([{ drugName: "", dose: "", frequency: "", duration: "", route: "" }]);

  function reset() {
    setForm({
      visitDate: new Date().toISOString().split("T")[0],
      chiefComplaint: "",
      anamnesis: "",
      physicalExam: "",
      weightKg: "",
      heightCm: "",
      headCircumferenceCm: "",
      diagnosisPrimary: "",
      diagnosisSecondary: "",
      therapy: "",
      notes: "",
    });
    setLabs([{ testName: "", result: "", unit: "", referenceRange: "", flag: "" }]);
    setMeds([{ drugName: "", dose: "", frequency: "", duration: "", route: "" }]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.visitDate) return;
    startTransition(async () => {
      await createVisit({
        patientId,
        visitDate: form.visitDate,
        chiefComplaint: form.chiefComplaint || undefined,
        anamnesis: form.anamnesis || undefined,
        physicalExam: form.physicalExam || undefined,
        weightKg: form.weightKg || undefined,
        heightCm: form.heightCm || undefined,
        headCircumferenceCm: form.headCircumferenceCm || undefined,
        diagnosisPrimary: form.diagnosisPrimary || undefined,
        diagnosisSecondary: form.diagnosisSecondary || undefined,
        therapy: form.therapy || undefined,
        notes: form.notes || undefined,
        labs: labs.filter((l) => l.testName.trim()).map((l) => ({
          testName: l.testName,
          result: l.result || undefined,
          unit: l.unit || undefined,
          referenceRange: l.referenceRange || undefined,
          flag: l.flag || undefined,
        })),
        medications: meds.filter((m) => m.drugName.trim()).map((m) => ({
          drugName: m.drugName,
          dose: m.dose || undefined,
          frequency: m.frequency || undefined,
          duration: m.duration || undefined,
          route: m.route || undefined,
        })),
      });
      reset();
      setOpen(false);
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size={compact ? "sm" : "default"} variant={compact ? "outline" : "default"}>
        <Plus className="h-4 w-4 mr-1" />
        {compact ? "Visit" : "Tambah Kunjungan"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle>Tambah Kunjungan</DialogTitle>
          <DialogDescription>Catat kunjungan pasien, lab, dan obat.</DialogDescription>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <Field label="Tanggal" type="date" value={form.visitDate} onChange={(v) => setForm({ ...form, visitDate: v })} required />
            <TextareaField label="Keluhan Utama" value={form.chiefComplaint} onChange={(v) => setForm({ ...form, chiefComplaint: v })} />
            <TextareaField label="Anamnesis" value={form.anamnesis} onChange={(v) => setForm({ ...form, anamnesis: v })} />
            <TextareaField label="Pemeriksaan Fisik" value={form.physicalExam} onChange={(v) => setForm({ ...form, physicalExam: v })} />
            <div className="grid grid-cols-3 gap-3">
              <Field label="BB (kg)" type="number" step="0.1" value={form.weightKg} onChange={(v) => setForm({ ...form, weightKg: v })} />
              <Field label="TB (cm)" type="number" step="0.1" value={form.heightCm} onChange={(v) => setForm({ ...form, heightCm: v })} />
              <Field label="LK (cm)" type="number" step="0.1" value={form.headCircumferenceCm} onChange={(v) => setForm({ ...form, headCircumferenceCm: v })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Diagnosis Utama" value={form.diagnosisPrimary} onChange={(v) => setForm({ ...form, diagnosisPrimary: v })} />
              <Field label="Diagnosis Sekunder" value={form.diagnosisSecondary} onChange={(v) => setForm({ ...form, diagnosisSecondary: v })} />
            </div>
            <TextareaField label="Terapi" value={form.therapy} onChange={(v) => setForm({ ...form, therapy: v })} rows={3} />
            <TextareaField label="Catatan" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hasil Lab</p>
                <Button type="button" size="sm" variant="outline" onClick={() => setLabs([...labs, { testName: "", result: "", unit: "", referenceRange: "", flag: "" }])}>
                  <Plus className="h-3 w-3" /> Tambah
                </Button>
              </div>
              <div className="space-y-2">
                {labs.map((l, i) => (
                  <div key={i} className="grid grid-cols-12 gap-1.5">
                    <Input className="col-span-4 h-8 text-xs" placeholder="Pemeriksaan" value={l.testName} onChange={(e) => { const nl = [...labs]; nl[i] = { ...l, testName: e.target.value }; setLabs(nl); }} />
                    <Input className="col-span-3 h-8 text-xs" placeholder="Hasil" value={l.result} onChange={(e) => { const nl = [...labs]; nl[i] = { ...l, result: e.target.value }; setLabs(nl); }} />
                    <Input className="col-span-2 h-8 text-xs" placeholder="Unit" value={l.unit} onChange={(e) => { const nl = [...labs]; nl[i] = { ...l, unit: e.target.value }; setLabs(nl); }} />
                    <Input className="col-span-2 h-8 text-xs" placeholder="Normal" value={l.referenceRange} onChange={(e) => { const nl = [...labs]; nl[i] = { ...l, referenceRange: e.target.value }; setLabs(nl); }} />
                    <Input className="col-span-1 h-8 text-xs" placeholder="⚑" value={l.flag} onChange={(e) => { const nl = [...labs]; nl[i] = { ...l, flag: e.target.value }; setLabs(nl); }} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resep Obat</p>
                <Button type="button" size="sm" variant="outline" onClick={() => setMeds([...meds, { drugName: "", dose: "", frequency: "", duration: "", route: "" }])}>
                  <Plus className="h-3 w-3" /> Tambah
                </Button>
              </div>
              <div className="space-y-2">
                {meds.map((m, i) => (
                  <div key={i} className="grid grid-cols-12 gap-1.5">
                    <Input className="col-span-4 h-8 text-xs" placeholder="Nama Obat" value={m.drugName} onChange={(e) => { const nm = [...meds]; nm[i] = { ...m, drugName: e.target.value }; setMeds(nm); }} />
                    <Input className="col-span-2 h-8 text-xs" placeholder="Dosis" value={m.dose} onChange={(e) => { const nm = [...meds]; nm[i] = { ...m, dose: e.target.value }; setMeds(nm); }} />
                    <Input className="col-span-2 h-8 text-xs" placeholder="Freq" value={m.frequency} onChange={(e) => { const nm = [...meds]; nm[i] = { ...m, frequency: e.target.value }; setMeds(nm); }} />
                    <Input className="col-span-2 h-8 text-xs" placeholder="Durasi" value={m.duration} onChange={(e) => { const nm = [...meds]; nm[i] = { ...m, duration: e.target.value }; setMeds(nm); }} />
                    <Input className="col-span-2 h-8 text-xs" placeholder="Rute" value={m.route} onChange={(e) => { const nm = [...meds]; nm[i] = { ...m, route: e.target.value }; setMeds(nm); }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <DialogClose render={<Button type="button" variant="outline">Batal</Button>} />
              <Button type="submit" disabled={pending}>
                {pending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, value, onChange, type = "text", step, required = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; step?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-1">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <Input type={type} step={step} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="h-9" />
    </div>
  );
}

function TextareaField({ label, value, onChange, rows = 2 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="text-[11px] text-muted-foreground uppercase tracking-wider block mb-1">{label}</label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="text-sm" />
    </div>
  );
}
