import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { patients, patientVisits, patientLabResults } from "@/lib/db/schema";
import { eq, desc, asc, sql, ilike, and, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const room = searchParams.get("room")?.trim() || "";
  const patientId = searchParams.get("patientId")?.trim() || "";

  try {
    // Fetch patients (optionally filtered)
    const conditions = [];
    if (q) {
      conditions.push(
        or(
          ilike(patients.name, `%${q}%`),
          ilike(patients.medicalRecordNo, `%${q}%`)
        )
      );
    }
    if (room) {
      conditions.push(eq(patients.room, room));
    }
    if (patientId) {
      conditions.push(eq(patients.id, patientId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const patientList = await db
      .select({
        id: patients.id,
        name: patients.name,
        medicalRecordNo: patients.medicalRecordNo,
        room: patients.room,
        bed: patients.bed,
        sex: patients.sex,
        birthDate: patients.birthDate,
        dpjp: patients.dpjp,
      })
      .from(patients)
      .where(whereClause)
      .orderBy(desc(patients.updatedAt))
      .limit(100);

    // Get latest visit + lab results for each patient
    const result = [];
    for (const p of patientList) {
      const visits = await db
        .select()
        .from(patientVisits)
        .where(eq(patientVisits.patientId, p.id))
        .orderBy(desc(patientVisits.visitDate))
        .limit(5);

      const visitIds = visits.map((v) => v.id);

      const labs = visitIds.length
        ? await db
            .select()
            .from(patientLabResults)
            .where(
              sql`${patientLabResults.visitId} IN (${sql.join(
                visitIds.map((id) => sql`${id}`),
                sql`, `
              )})`
            )
            .orderBy(asc(patientLabResults.createdAt))
        : [];

      // Group labs by visitId
      const labsByVisit: Record<string, typeof labs> = {};
      for (const l of labs) {
        if (!labsByVisit[l.visitId]) labsByVisit[l.visitId] = [];
        labsByVisit[l.visitId].push(l);
      }

      result.push({
        ...p,
        visits: visits.map((v) => ({
          id: v.id,
          visitDate: v.visitDate,
          diagnosisPrimary: v.diagnosisPrimary,
          diagnosisSecondary: v.diagnosisSecondary,
        })),
        labsByVisit,
      });
    }

    // Get unique rooms for filter
    const rooms = await db
      .select({ room: patients.room })
      .from(patients)
      .where(sql`${patients.room} IS NOT NULL AND ${patients.room} != ''`)
      .groupBy(patients.room)
      .orderBy(patients.room);

    return NextResponse.json({
      patients: result,
      rooms: rooms.map((r) => r.room),
    });
  } catch (error) {
    console.error("Lab browser error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data" },
      { status: 500 }
    );
  }
}
