import { db } from "@/lib/db";
import { patients, patientVisits } from "@/lib/db/schema";
import { desc, eq, sql, isNotNull, and } from "drizzle-orm";
import { PatientKanban } from "./patient-kanban";
import { Plus } from "lucide-react";
import Link from "next/link";

const ROOMS = ["DAHLIA", "ANGGREK", "MELATI", "SERUNI"] as const;

export const dynamic = "force-dynamic";

export default async function PatientKanbanPage() {
  let list: {
    id: string;
    name: string;
    medicalRecordNo: string | null;
    bed: string | null;
    room: string | null;
    birthDate: string | null;
    sex: string | null;
    diagnosis: string | null;
  }[] = [];
  let dbError: string | null = null;

  try {
    const rows = await db
      .select({
        id: patients.id,
        name: patients.name,
        medicalRecordNo: patients.medicalRecordNo,
        bed: patients.bed,
        room: patients.room,
        birthDate: patients.birthDate,
        sex: patients.sex,
        diagnosis: sql<string | null>`(
          SELECT ${patientVisits.diagnosisPrimary}
          FROM ${patientVisits}
          WHERE ${patientVisits.patientId} = ${patients.id}
          ORDER BY ${patientVisits.visitDate} DESC
          LIMIT 1
        )`,
      })
      .from(patients)
      .where(isNotNull(patients.room))
      .orderBy(patients.room, patients.bed);

    list = rows;
  } catch (error) {
    dbError = error instanceof Error ? error.message : "Gagal memuat data pasien";
  }

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

      {dbError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{dbError}</p>
        </div>
      ) : (
        <PatientKanban rooms={[...ROOMS]} patients={list} />
      )}
    </div>
  );
}
