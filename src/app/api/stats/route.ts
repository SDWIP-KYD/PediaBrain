import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { patients, patientVisits } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [totalRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(patients);

    const [inpatientRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(patients)
      .where(eq(patients.status, "rawat_inap"));

    const [todayRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(patientVisits)
      .where(sql`${patientVisits.visitDate} = ${today}`);

    return NextResponse.json({
      total: Number(totalRow?.count ?? 0),
      inpatient: Number(inpatientRow?.count ?? 0),
      today: Number(todayRow?.count ?? 0),
    });
  } catch {
    return NextResponse.json({ total: 0, inpatient: 0, today: 0 });
  }
}
