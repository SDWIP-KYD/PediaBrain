import { PatientKanban } from "./patient-kanban";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function PatientKanbanPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/pasien"
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Board Pasien Rawat Inap
            </h1>
            <p className="text-sm text-muted-foreground">
              Drag kartu pasien untuk pindah ruangan
            </p>
          </div>
        </div>
      </div>

      <PatientKanban />
    </div>
  );
}
