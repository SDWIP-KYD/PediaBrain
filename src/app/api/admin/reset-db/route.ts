import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TEMP_TOKEN = "reset-9f3a2b7c-pediabrain-2026-temp";

// tables to DELETE (RS lama)
const DELETE_TABLES = [
  "patient_medications",
  "patient_lab_results",
  "patient_visits",
  "patients",
  "sticky_notes",
];

// tables to KEEP + verify after
const KEEP_TABLES = [
  "notes",
  "note_versions",
  "follow_ups",
  "micromedex_drugs",
  "micromedex_indications",
  "micromedex_drug_interactions",
  "micromedex_dose_adjustments",
];

async function countTable(name: string): Promise<number> {
  const r = await db.execute(sql`SELECT count(*)::int AS c FROM ${sql.identifier(name)}`);
  // drizzle execute returns rows array
  const rows = (r as any).rows ?? (Array.isArray(r) ? r : []);
  return Number(rows[0]?.c ?? 0);
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-admin-token");
  if (token !== TEMP_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1) BEFORE counts
    const before: Record<string, number> = {};
    for (const t of [...DELETE_TABLES, ...KEEP_TABLES]) {
      before[t] = await countTable(t);
    }

    // 2) Backup notes (title + pinned only)
    const notesSnap = await db.execute(
      sql`SELECT title, is_pinned FROM notes ORDER BY created_at`
    );
    const notesRows = (notesSnap as any).rows ?? [];
    const notesTitles = notesRows.map((n: any) => ({
      title: n.title,
      pinned: n.is_pinned,
    }));

    // 3) TRUNCATE delete tables (CASCADE)
    await db.execute(sql`
      TRUNCATE TABLE ${sql.identifier("patient_medications")},
                     ${sql.identifier("patient_lab_results")},
                     ${sql.identifier("patient_visits")},
                     ${sql.identifier("patients")},
                     ${sql.identifier("sticky_notes")}
      CASCADE
    `);

    // 4) AFTER counts
    const after: Record<string, number> = {};
    for (const t of [...DELETE_TABLES, ...KEEP_TABLES]) {
      after[t] = await countTable(t);
    }

    return NextResponse.json({
      success: true,
      before,
      after,
      notesSurvived: notesTitles.length,
      notesTitles,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error", stack: e?.stack?.split("\n").slice(0, 3) },
      { status: 500 }
    );
  }
}
