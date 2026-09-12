/**
 * Sync pasien RS Akademis — 22 Juni 2026
 * Jalanin: npx tsx scripts/sync-pasien-2026-06-22.ts
 *
 * Pake pattern yang sama kayak src/lib/db.ts biar kompatibel.
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

function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(an|nn|nyny|by)\.?\s+/i, "")
    .trim();
}

function normalizeRm(s: string | null | undefined): string | null {
  if (!s) return null;
  return s.replace(/\D/g, "");
}

function normalizeDpjp(s: string | null | undefined): string | null {
  if (!s) return null;
  return s.trim().replace(/\s+/g, " ");
}

interface PasienInput {
  name: string;
  room: string;
  bed: string | null;
  medicalRecordNo: string;
  birthDate: string;
  diagnosis: string;
  dpjp: string;
}

// ─── DATA PASIEN ────────────────────────────────────────────
const dpjpJusli = "dr. Jusli, M. Kes, Sp.A(K)";
const dpjpSyarif = "Prof. Dr. dr. Syarifuddin Rauf, Sp.A(K)";

const daftarPasien: PasienInput[] = [
  // === DAHLIA — DPJP dr. Jusli ===
  { name: "Ahmad Arav Arrazy",   room: "DAHLIA", bed: "K.1",   medicalRecordNo: "312372", birthDate: "27-10-2022", diagnosis: "Diare akut, intake tidak terjamin",                              dpjp: dpjpJusli },
  { name: "Muhammad Khairum",    room: "DAHLIA", bed: "K.3",   medicalRecordNo: "312309", birthDate: "09-09-2022", diagnosis: "Faringitis akut, gizi buruk",                                        dpjp: dpjpJusli },
  { name: "Mahadiva Adistya",    room: "DAHLIA", bed: "K.5",   medicalRecordNo: "305857", birthDate: "01-09-2013", diagnosis: "Faringitis akut, diare akut, gitelmen sindrom",                          dpjp: dpjpJusli },
  { name: "Nurul Auliah",        room: "DAHLIA", bed: "K.6",   medicalRecordNo: "309935", birthDate: "07-01-2021", diagnosis: "Faringitis akut, intake tidak terjamin",                                dpjp: dpjpJusli },
  { name: "Muhammad Yusuf",      room: "DAHLIA", bed: "K.7",   medicalRecordNo: "312337", birthDate: "21-10-2011", diagnosis: "Faringitis akut, diare akut, dehidrasi sedang, morbili",                dpjp: dpjpJusli },
  { name: "Muh. Aqil Althaf",    room: "DAHLIA", bed: "K.8",   medicalRecordNo: "312344", birthDate: "17-09-2016", diagnosis: "Acute kidney injury KDIGO III",                                         dpjp: dpjpJusli },
  { name: "Lukman Dafa Hidayat", room: "DAHLIA", bed: "K.8",   medicalRecordNo: "259118", birthDate: "11-11-2017", diagnosis: "Faringitis akut, epilepsi on treatment",                                dpjp: dpjpJusli },
  { name: "Muh. Gibran Alfarizi",room: "DAHLIA", bed: "K.11",  medicalRecordNo: "302476", birthDate: "08-07-2022", diagnosis: "Vomitting post trauma",                                                   dpjp: dpjpJusli },

  // === DAHLIA — DPJP Prof. Syarifuddin ===
  { name: "Al Darren Shankara",  room: "DAHLIA", bed: "K.4",   medicalRecordNo: "307402", birthDate: "19-02-2023", diagnosis: "Faringitis akut, intake tidak terjamin",                                dpjp: dpjpSyarif },
  { name: "El Mahdi Aqil",       room: "DAHLIA", bed: "K.11",  medicalRecordNo: "312319", birthDate: "13-04-2021", diagnosis: "Faringitis akut, intake tidak terjamin",                                dpjp: dpjpSyarif },
  { name: "Muh. Alif",           room: "DAHLIA", bed: "K.11",  medicalRecordNo: "312282", birthDate: "10-10-2025", diagnosis: "Community Acquired Pneumonia, Demam tifoid, Diare akut, Dehidrasi sedang", dpjp: dpjpSyarif },
  { name: "Mutmainnah",          room: "DAHLIA", bed: "K.11",  medicalRecordNo: "306799", birthDate: "29-03-2017", diagnosis: "Demam tifoid, Faringitis akut, Intake tidak terjamin",                   dpjp: dpjpSyarif },
  { name: "Muhammad Farid",      room: "DAHLIA", bed: "K.12",  medicalRecordNo: "312355", birthDate: "05-03-2024", diagnosis: "Diare akut, dehidrasi sedang",                                          dpjp: dpjpSyarif },

  // === MELATI — DPJP dr. Jusli ===
  { name: "Marwah Azzahra",      room: "MELATI", bed: "K.5",   medicalRecordNo: "312000", birthDate: "23-06-2014", diagnosis: "Demam tifoid, faringitis akut",                                          dpjp: dpjpJusli },
  { name: "Indri Ramadhani",     room: "MELATI", bed: "K.5",   medicalRecordNo: "286293", birthDate: "20-08-2009", diagnosis: "Faringitis akut",                                                         dpjp: dpjpJusli },
  { name: "Alvaro Gavlier",      room: "MELATI", bed: "K.15",  medicalRecordNo: "299400", birthDate: "04-03-2013", diagnosis: "Diare akut, faringitis akut, sindrom nefrotik relaps jarang",            dpjp: dpjpJusli },
  { name: "Arsyila Fatika",      room: "MELATI", bed: "K.19",  medicalRecordNo: "308968", birthDate: "10-05-2024", diagnosis: "Faringitis akut, diare akut, intake tidak terjamin",                     dpjp: dpjpJusli },
  { name: "Muhammad Syarif Zaidan",room: "MELATI", bed: "K.19",medicalRecordNo: "312341", birthDate: "23-03-2026", diagnosis: "Diare akut, dehidrasi sedang",                                          dpjp: dpjpJusli },
  { name: "St. Rahma",           room: "MELATI", bed: "K.24",  medicalRecordNo: "272752", birthDate: "04-02-2021", diagnosis: "Community Acquired Pneumonia",                                            dpjp: dpjpJusli },

  // === MELATI — DPJP Prof. Syarifuddin ===
  { name: "Andi Athmar",         room: "MELATI", bed: "K.9",   medicalRecordNo: "303135", birthDate: "17-05-2023", diagnosis: "Faringitis akut, diare akut",                                            dpjp: dpjpSyarif },
  { name: "Abizar",              room: "MELATI", bed: "K.9",   medicalRecordNo: "312357", birthDate: "29-04-2025", diagnosis: "Community Acquired Pneumonia, diare akut",                                dpjp: dpjpSyarif },
];

// ─── SYNC LOGIC ─────────────────────────────────────────────
function parseDate(d: string): string {
  const parts = d.split("-");
  if (parts.length !== 3) return d;
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

interface Change {
  type: "created" | "updated" | "discharged" | "unchanged";
  name: string;
  detail: string;
}

async function main() {
  console.log("🔍 Fetching existing rawat_inap patients from DB...\n");
  const existing = await db
    .select({
      id: patients.id,
      name: patients.name,
      medicalRecordNo: patients.medicalRecordNo,
      room: patients.room,
      bed: patients.bed,
      notes: patients.notes,
      dpjp: patients.dpjp,
      status: patients.status,
    })
    .from(patients)
    .where(eq(patients.status, "rawat_inap"));

  const existingByName = new Map<string, typeof existing[0]>();
  const existingByRm = new Map<string, typeof existing[0]>();
  for (const p of existing) {
    existingByName.set(normalizeName(p.name), p);
    if (p.medicalRecordNo) existingByRm.set(normalizeRm(p.medicalRecordNo), p);
  }

  const matchedIds = new Set<string>();
  const changes: Change[] = [];

  for (const pasien of daftarPasien) {
    const nameNorm = normalizeName(pasien.name);
    const rmNorm = normalizeRm(pasien.medicalRecordNo);
    const found = existingByRm.get(rmNorm!) ?? existingByName.get(nameNorm);

    if (found) {
      matchedIds.add(found.id);
      const updates: Record<string, string | null | Date> = {};

      if (found.room !== pasien.room) updates.room = pasien.room;
      if ((found.bed ?? null) !== pasien.bed) updates.bed = pasien.bed;
      if (normalizeDpjp(found.dpjp) !== normalizeDpjp(pasien.dpjp)) updates.dpjp = pasien.dpjp;

      // Always update notes with latest diagnosis
      const diagnosisNote = `📋 ${pasien.diagnosis}`;
      updates.notes = diagnosisNote;

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date();
        await db.update(patients).set(updates).where(eq(patients.id, found.id));
        changes.push({
          type: "updated",
          name: pasien.name,
          detail: `RM ${pasien.medicalRecordNo} → ${pasien.room} ${pasien.bed} | ${pasien.dpjp.split(",")[0]}`,
        });
      } else {
        changes.push({
          type: "unchanged",
          name: pasien.name,
          detail: "Data sudah sesuai",
        });
      }
    } else {
      const [_inserted] = await db.insert(patients).values({
        name: pasien.name.trim(),
        medicalRecordNo: pasien.medicalRecordNo,
        birthDate: parseDate(pasien.birthDate),
        room: pasien.room,
        bed: pasien.bed,
        status: "rawat_inap",
        dpjp: pasien.dpjp.trim(),
        notes: `📋 ${pasien.diagnosis}`,
      }).returning();
      changes.push({
        type: "created",
        name: pasien.name,
        detail: `RM ${pasien.medicalRecordNo} → ${pasien.room} ${pasien.bed} | ${pasien.dpjp.split(",")[0]}`,
      });
    }
  }

  // Discharge patients no longer in list
  for (const p of existing) {
    if (!matchedIds.has(p.id)) {
      await db.update(patients).set({
        status: "pulang",
        room: null,
        bed: null,
        updatedAt: new Date(),
      }).where(eq(patients.id, p.id));
      changes.push({
        type: "discharged",
        name: p.name,
        detail: `${p.room} ${p.bed} → pulang`,
      });
    }
  }

  // ─── LAPORAN ──────────────────────────────────────────────
  const created = changes.filter((c) => c.type === "created");
  const updated = changes.filter((c) => c.type === "updated");
  const discharged = changes.filter((c) => c.type === "discharged");
  const unchanged = changes.filter((c) => c.type === "unchanged");

  console.log("╔══════════════════════════════════════════╗");
  console.log("║   SYNC PASIEN RS AKADEMIS — 22/06/2026  ║");
  console.log("╚══════════════════════════════════════════╝\n");

  console.log(`✅ Created  : ${created.length} pasien baru`);
  for (const c of created) console.log(`   ✦ ${c.name} — ${c.detail}`);

  if (updated.length > 0) {
    console.log(`\n🔄 Updated  : ${updated.length} pasien`);
    for (const c of updated) console.log(`   · ${c.name} — ${c.detail}`);
  }

  if (unchanged.length > 0) {
    console.log(`\n⏸️  Unchanged: ${unchanged.length} pasien (data sudah sesuai)`);
  }

  if (discharged.length > 0) {
    console.log(`\n⏏️  Discharged : ${discharged.length} pasien`);
    for (const c of discharged) console.log(`   · ${c.name} — ${c.detail}`);
  }

  console.log(`\n📊 Ringkasan Kamar:`);
  console.log(`   DAHLIA  : ${daftarPasien.filter((p) => p.room === "DAHLIA").length} pasien`);
  console.log(`   MELATI  : ${daftarPasien.filter((p) => p.room === "MELATI").length} pasien`);
  console.log(`   ANGGREK : 0 (kosong)`);
  console.log(`   SERUNI  : 0 (kosong)`);
  console.log(`   PICU    : 0 (kosong)`);
  console.log(`   ─────────────────────`);
  console.log(`   TOTAL   : ${daftarPasien.length} pasien`);

  await pool.end();
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
