import { PatientKanban } from "./patient-kanban";
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function PatientKanbanPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Board Pasien Rawat Inap
          </h1>
          <p className="text-sm text-muted-foreground">
            Drag kartu pasien untuk pindah ruangan
          </p>
        </div>
        <Link
          href="/pasien"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          Tambah Pasien
        </Link>
      </div>

      <PatientKanban />
    </div>
  );
}
