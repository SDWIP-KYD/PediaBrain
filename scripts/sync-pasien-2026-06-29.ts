/**
 * Sync pasien RS Akademis — 29 Juni 2026
 * Jalanin: npx tsx scripts/sync-pasien-2026-06-29.ts
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
  console.log("🔍 Fetching existing rawat_inap patients...\n");
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

  const dpjpJusli = "dr. Jusli, M. Kes, Sp.A(K)";
  const dpjpSyarif = "Prof. Dr. dr. Syarifuddin Rauf, Sp.A(K)";
  const dpjpAizah = "dr. Aizah Sitti Lawang, Sp.A(K)";

  const daftarPasien: PasienInput[] = [
    // ═══ DAHLIA — DPJP dr. Jusli ═══
    { name: "Ana Sri Lestari",       room: "DAHLIA", bed: "K.8",  medicalRecordNo: "312390", birthDate: "24-03-2012", diagnosis: "Appendicitis Akut, dyspepsia, faringitis akut, peningkatan enzim transaminase", dpjp: dpjpJusli },
    { name: "A. Muh. Kahfi",         room: "DAHLIA", bed: "K.5",  medicalRecordNo: "312570", birthDate: "26-11-2016", diagnosis: "Diare",                                                                  dpjp: dpjpJusli },
    { name: "Raisa Aprilia Pertiwi", room: "DAHLIA", bed: "K.7",  medicalRecordNo: "208271", birthDate: "04-04-2013", diagnosis: "Dyspepsia, hematokezia, melena",                                        dpjp: dpjpJusli },
    { name: "Muh. Musyakir Adnan",   room: "DAHLIA", bed: "K.8",  medicalRecordNo: "285138", birthDate: "12-07-2022", diagnosis: "Obs. Febris",                                                           dpjp: dpjpJusli },
    { name: "Kahisah Safwana",       room: "DAHLIA", bed: "K.12", medicalRecordNo: "312568", birthDate: "03-08-2022", diagnosis: "Dyspneu",                                                                dpjp: dpjpJusli },

    // ═══ DAHLIA — DPJP Prof. Syarifuddin ═══
    { name: "Aidan Pradipta",        room: "DAHLIA", bed: "K.1",  medicalRecordNo: "312572", birthDate: "25-05-2022", diagnosis: "Diare",                                                                  dpjp: dpjpSyarif },
    { name: "Muh. Alfatih Arfa",     room: "DAHLIA", bed: "K.3",  medicalRecordNo: "312463", birthDate: "29-12-2025", diagnosis: "Faringitis akut, diare akut, obs febris",                              dpjp: dpjpSyarif },
    { name: "Muh. Rayyan",           room: "DAHLIA", bed: "K.4",  medicalRecordNo: "312531", birthDate: "10-03-2023", diagnosis: "Dyspneu",                                                                dpjp: dpjpSyarif },
    { name: "Isnaini",               room: "DAHLIA", bed: "K.6",  medicalRecordNo: "312547", birthDate: "04-05-2009", diagnosis: "Dyspepsia",                                                              dpjp: dpjpSyarif },

    // ═══ PICU — dr. Aizah ═══
    { name: "Nael Rafino",           room: "PICU",   bed: null,   medicalRecordNo: "312160", birthDate: "29-11-2025", diagnosis: "ARDS, CAP, PJB Asianotik, Stunting, Gizi Buruk tipe marasmus",         dpjp: dpjpAizah },

    // ═══ ANGGREK — DPJP dr. Jusli ═══
    { name: "Nurul Kamila",          room: "ANGGREK", bed: "K.14",medicalRecordNo: "299528", birthDate: "22-10-2010", diagnosis: "Dyspepsia",                                                             dpjp: dpjpJusli },
    { name: "St Nur Azizah",         room: "ANGGREK", bed: "K.14",medicalRecordNo: "312478", birthDate: "19-02-2012", diagnosis: "Vertigo, kolik abdomen, dyspepsia",                                    dpjp: dpjpJusli },
    { name: "Nurannam Zakhira",      room: "ANGGREK", bed: "K.7", medicalRecordNo: "275191", birthDate: "19-01-2021", diagnosis: "Diare akut, intake tidak terjamin",                                   dpjp: dpjpJusli },
    { name: "Faqih",                 room: "ANGGREK", bed: "K.9", medicalRecordNo: "253049", birthDate: "28-10-2016", diagnosis: "—",                                                                     dpjp: dpjpJusli },

    // ═══ ANGGREK — DPJP Prof. Syarifuddin ═══
    { name: "St Aira Sahratul",      room: "ANGGREK", bed: "K.3", medicalRecordNo: "312538", birthDate: "17-08-2008", diagnosis: "GEA",                                                                  dpjp: dpjpSyarif },
    { name: "Alfina",                room: "ANGGREK", bed: "K.3", medicalRecordNo: "312588", birthDate: "28-05-2011", diagnosis: "Kolik abdomen, dispesia, hemoroid interna grade, intake tidak terjamin", dpjp: dpjpSyarif },

    // ═══ MELATI — DPJP dr. Jusli ═══
    { name: "Muhammad Aulian",       room: "MELATI", bed: "K.1",  medicalRecordNo: "259084", birthDate: "15-02-2019", diagnosis: "Thyfoid fever, faringitis akut",                                      dpjp: dpjpJusli },
    { name: "Faiqah",                room: "MELATI", bed: "K.5",  medicalRecordNo: "312520", birthDate: "25-09-2024", diagnosis: "Faringitis akut, diare akut, intake tidak terjamin",                   dpjp: dpjpJusli },
    { name: "Alvaro Galvier",        room: "MELATI", bed: "K.8",  medicalRecordNo: "299400", birthDate: "04-03-2013", diagnosis: "Diare akut, faringitis akut, sindrom nefrotik relaps jarang",         dpjp: dpjpJusli },
    { name: "Muh Fauzan",            room: "MELATI", bed: "K.19", medicalRecordNo: "312508", birthDate: "04-11-2021", diagnosis: "Sindrom nefrotik relaps jarang",                                        dpjp: dpjpJusli },

    // ═══ MELATI — DPJP Prof. Syarifuddin ═══
    { name: "Faridah",               room: "MELATI", bed: "K.1",  medicalRecordNo: "290388", birthDate: "03-11-2014", diagnosis: "Thyfoid fever, faringitis akut, intake tidak terjamin",                 dpjp: dpjpSyarif },
    { name: "Muhammad Rasyad",       room: "MELATI", bed: "K.15", medicalRecordNo: "290990", birthDate: "26-07-2021", diagnosis: "Diare akut, intake tidak terjamin",                                    dpjp: dpjpSyarif },
    { name: "Azzahra",               room: "MELATI", bed: "K.19", medicalRecordNo: "312519", birthDate: "15-06-2017", diagnosis: "Faringitis akut, vomiting, intake tidak terjamin",                     dpjp: dpjpSyarif },
    { name: "Samsabila",             room: "MELATI", bed: "K.5",  medicalRecordNo: "312583", birthDate: "29-10-2009", diagnosis: "Faringitis Akut, Dispepsia, Intake Tidak Terjamin",                    dpjp: dpjpSyarif },

    // ═══ SERUNI — DPJP dr. Jusli ═══
    { name: "Alisha Almira",         room: "SERUNI", bed: "K.1",  medicalRecordNo: "245758", birthDate: "15-01-2014", diagnosis: "Faringitis Akut, Morbili",                                             dpjp: dpjpJusli },
  ];

  for (const pasien of daftarPasien) {
    const nameNorm = normalizeName(pasien.name);
    const rmNorm = normalizeRm(pasien.medicalRecordNo);
    const found = existingByRm.get(rmNorm!) ?? existingByName.get(nameNorm);

    if (found) {
      matchedIds.add(found.id);
      const updates: Record<string, string | null | Date> = {};

      if (found.room !== pasien.room) updates.room = pasien.room;
      if ((found.bed ?? null) !== pasien.bed) updates.bed = pasien.bed;
      if (normalizeDpjp(found.dpjp) !== normalizeDpjp(pasien.dpjp)) updates.dpjp = pasien.dpjp || null;

      const diagnosisNote = `📋 ${pasien.diagnosis}`;
      updates.notes = diagnosisNote;

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date();
        await db.update(patients).set(updates).where(eq(patients.id, found.id));
        changes.push({ type: "updated", name: pasien.name, detail: `RM ${pasien.medicalRecordNo} → ${pasien.room} ${pasien.bed || "-"} | ${pasien.dpjp.split(",")[0]}` });
      } else {
        changes.push({ type: "unchanged", name: pasien.name, detail: "Data sudah sesuai" });
      }
    } else {
      const [_inserted] = await db.insert(patients).values({
        name: pasien.name.trim(),
        medicalRecordNo: pasien.medicalRecordNo,
        birthDate: parseDate(pasien.birthDate),
        room: pasien.room,
        bed: pasien.bed,
        status: "rawat_inap",
        dpjp: pasien.dpjp.trim() || null,
        notes: `📋 ${pasien.diagnosis}`,
      }).returning();
      changes.push({ type: "created", name: pasien.name, detail: `RM ${pasien.medicalRecordNo} → ${pasien.room} ${pasien.bed || "-"} | ${pasien.dpjp.split(",")[0]}` });
    }
  }

  // Discharge pasien yang tidak ada di list baru
  for (const p of existing) {
    if (!matchedIds.has(p.id)) {
      await db.update(patients).set({
        status: "pulang", room: null, bed: null, updatedAt: new Date(),
      }).where(eq(patients.id, p.id));
      changes.push({ type: "discharged", name: p.name, detail: `${p.room} ${p.bed} → pulang` });
    }
  }

  // ─── LAPORAN ──────────────────────────────────────────
  const created = changes.filter((c) => c.type === "created");
  const updated = changes.filter((c) => c.type === "updated");
  const discharged = changes.filter((c) => c.type === "discharged");
  const unchanged = changes.filter((c) => c.type === "unchanged");

  console.log("╔══════════════════════════════════════════╗");
  console.log("║   SYNC PASIEN RS AKADEMIS — 29/06/2026  ║");
  console.log("╚══════════════════════════════════════════╝\n");

  console.log(`✅ Created    : ${created.length} pasien baru`);
  for (const c of created) console.log(`   ✦ ${c.name} — ${c.detail}`);

  if (updated.length > 0) {
    console.log(`\n🔄 Updated    : ${updated.length} pasien`);
    for (const c of updated) console.log(`   · ${c.name} — ${c.detail}`);
  }

  if (unchanged.length > 0) {
    console.log(`\n⏸️  Unchanged  : ${unchanged.length} pasien`);
  }

  if (discharged.length > 0) {
    console.log(`\n⏏️  Discharged : ${discharged.length} pasien`);
    for (const c of discharged) console.log(`   · ${c.name} — ${c.detail}`);
  }

  console.log(`\n📊 Ringkasan Kamar:`);
  for (const room of ["DAHLIA", "PICU", "ANGGREK", "MELATI", "SERUNI"]) {
    const count = daftarPasien.filter((p) => p.room === room).length;
    console.log(`   ${room.padEnd(9)}: ${count} pasien`);
  }
  console.log(`   ─────────────────────`);
  console.log(`   TOTAL   : ${daftarPasien.length} pasien`);

  await pool.end();
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
