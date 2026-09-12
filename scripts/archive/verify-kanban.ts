/**
 * Verify pasien di kanban — liat distribusi per kamar & DPJP
 * Jalanin: npx tsx scripts/verify-kanban.ts
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const db = drizzle(pool, { schema });
const { patients } = schema;

async function main() {
  const all = await db
    .select({
      name: patients.name,
      room: patients.room,
      bed: patients.bed,
      medicalRecordNo: patients.medicalRecordNo,
      dpjp: patients.dpjp,
      notes: patients.notes,
      status: patients.status,
    })
    .from(patients)
    .where(eq(patients.status, "rawat_inap"))
    .orderBy(patients.room, patients.bed);

  console.log(`\n📋 KANBAN RS AKADEMIS — 22/06/2026\n`);

  const rooms = new Map<string, typeof all>();
  for (const p of all) {
    const r = p.room || "UNKNOWN";
    if (!rooms.has(r)) rooms.set(r, []);
    rooms.get(r)!.push(p);
  }

  for (const [room, patients] of [...rooms.entries()].sort()) {
    console.log(`━ ${room} ─────────────────────`);
    console.log(`   Total: ${patients.length} pasien\n`);

    // Group by DPJP
    const byDpjp = new Map<string, typeof patients>();
    for (const p of patients) {
      const d = p.dpjp || "—";
      if (!byDpjp.has(d)) byDpjp.set(d, []);
      byDpjp.get(d)!.push(p);
    }

    for (const [dpjp, ps] of byDpjp) {
      console.log(`   DPJP: ${dpjp}`);
      for (const p of ps) {
        const dg = p.notes?.replace(/^📋 /, "") || "—";
        console.log(`     ${p.bed || "—"} | ${p.name} (RM ${p.medicalRecordNo || "—"})`);
        console.log(`           ${dg}`);
      }
      console.log();
    }
  }

  console.log(`📊 TOTAL: ${all.length} pasien`);
  console.log(`   DAHLIA: ${(rooms.get("DAHLIA") || []).length}`);
  console.log(`   MELATI: ${(rooms.get("MELATI") || []).length}`);
  console.log(`   ANGGREK: ${(rooms.get("ANGGREK") || []).length}`);
  console.log(`   SERUNI: ${(rooms.get("SERUNI") || []).length}`);
  console.log(`   PICU: ${(rooms.get("PICU") || []).length}`);

  await pool.end();
}

main().catch(console.error);
