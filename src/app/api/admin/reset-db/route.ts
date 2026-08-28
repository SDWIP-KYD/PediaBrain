import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import {
  patients,
  patientVisits,
  patientLabResults,
  patientMedications,
  stickyNotes,
  notes,
  noteVersions,
  followUps,
  micromedexDrugs,
  micromedexIndications,
  micromedexDrugInteractions,
  micromedexDoseAdjustments,
} from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // Token check
  const token = request.headers.get("x-admin-token");
  if (token !== "reset-9f3a2b7c-pediabrain-2026-temp") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1) Pre-delete counts
    const before: Record<string, number> = {};
    for (const t of [patients, patientVisits, patientLabResults, patientMedications, stickyNotes, notes, noteVersions]) {
      const r = await db.select({ c: sql<number>`count(*)` }).from(t);
      before[t._.name] = Number(r[0]?.c || 0);
    }

    // 2) Backup (just sample titles + structure, not full data)
    const notesSnapshot = await db.select({ title: notes.title, isPinned: notes.isPinned }).from(notes);

    // 3) TRUNCATE with CASCADE
    await db.execute(sql`
      TRUNCATE TABLE
        "patient_medications",
        "patient_lab_results",
        "patient_visits",
        "patients",
        "sticky_notes"
      CASCADE
    `);

    // 4) Post-delete verification
    const after: Record<string, number> = {};
    for (const t of [
      patients, patientVisits, patientLabResults, patientMedications, stickyNotes,
      notes, noteVersions, followUps,
      micromedexDrugs, micromedexIndications, micromedexDrugInteractions, micromedexDoseAdjustments,
    ]) {
      const r = await db.select({ c: sql<number>`count(*)` }).from(t);
      after[t._.name] = Number(r[0]?.c || 0);
    }

    return NextResponse.json({
      success: true,
      before,
      after,
      notesSurvived: notesSnapshot.length,
      notesTitles: notesSnapshot.map((n) => ({ title: n.title, pinned: n.isPinned })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
