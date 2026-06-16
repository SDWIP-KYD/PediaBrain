"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import { notes, followUps, stickyNotes, noteVersions, patients, patientVisits, patientLabResults, patientMedications } from "@/lib/db/schema";
import { eq, and, or, ilike, sql, asc, desc } from "drizzle-orm";
import { toArray } from "@/lib/utils";

async function requireAuth() {
  const secret = process.env.SESSION_SECRET;
  const token = (await cookies()).get("session")?.value;

  if (!secret || !token || !verifySessionToken(token, secret).valid) {
    throw new Error("Login diperlukan untuk mengubah data.");
  }
}

function sectionsToArray(sections?: Record<string, string> | null) {
  if (!sections) return null;
  return Object.entries(sections)
    .map(([key, value]) => `${key}: ${value}`.trim())
    .filter(Boolean);
}

export async function createNote(formData: FormData) {
  await requireAuth();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const [inserted] = await db.insert(notes).values({ title, content, tags }).returning();
  if (inserted) {
    await db.insert(noteVersions).values({ noteId: inserted.id, title, content, tags });
  }
  revalidatePath("/notes");
  revalidatePath("/");
}

export async function updateNote(id: string, formData: FormData) {
  await requireAuth();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  await db
    .update(notes)
    .set({ title, content, tags, updatedAt: new Date() })
    .where(eq(notes.id, id));
  await db.insert(noteVersions).values({ noteId: id, title, content, tags });
  revalidatePath("/notes");
  revalidatePath("/");
}

export async function deleteNote(id: string) {
  await requireAuth();
  await db.delete(notes).where(eq(notes.id, id));
  revalidatePath("/notes");
  revalidatePath("/");
}

export async function togglePinNote(id: string) {
  await requireAuth();
  const [note] = await db.select().from(notes).where(eq(notes.id, id));
  if (note) {
    await db.update(notes).set({ isPinned: !note.isPinned }).where(eq(notes.id, id));
  }
  revalidatePath("/notes");
  revalidatePath("/");
}

export async function createFollowUp(formData: FormData) {
  const title = formData.get("title") as string;
  const content = (formData.get("content") as string) || null;
  const dueDate = formData.get("dueDate") as string;
  const recurrence = (formData.get("recurrence") as string) || "none";

  await db.insert(followUps).values({
    title,
    content,
    dueDate,
    status: "PENDING",
    recurrence,
  });
  revalidatePath("/follow-ups");
  revalidatePath("/");
}

export async function updateFollowUpStatus(id: string, status: string) {
  const [fu] = await db.select().from(followUps).where(eq(followUps.id, id));
  await db.update(followUps).set({ status }).where(eq(followUps.id, id));

  if (status === "COMPLETED" && fu && fu.recurrence !== "none") {
    const [year, month, day] = fu.dueDate.split("-").map(Number);
    const current = new Date(year, month - 1, day);
    if (fu.recurrence === "weekly") current.setDate(current.getDate() + 7);
    else if (fu.recurrence === "monthly") current.setMonth(current.getMonth() + 1);
    const nextStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;

    await db.insert(followUps).values({
      title: fu.title,
      content: fu.content,
      dueDate: nextStr,
      status: "PENDING",
      recurrence: fu.recurrence,
    });
  }

  revalidatePath("/follow-ups");
  revalidatePath("/");
}

export async function deleteFollowUp(id: string) {
  await db.delete(followUps).where(eq(followUps.id, id));
  revalidatePath("/follow-ups");
  revalidatePath("/");
}

export async function saveStickyNote(formData: FormData) {
  const content = formData.get("content") as string;
  if (!content?.trim()) return;
  await db.insert(stickyNotes).values({ content: content.trim() });
  revalidatePath("/");
}

export async function createOrUpdateSticky(content: string) {
  if (!content?.trim()) return null;
  const existing = await db.select().from(stickyNotes).orderBy(desc(stickyNotes.updatedAt)).limit(1);
  if (existing.length > 0) {
    await db.update(stickyNotes).set({ content: content.trim(), updatedAt: new Date() }).where(eq(stickyNotes.id, existing[0].id));
    revalidatePath("/");
    return existing[0].id;
  } else {
    const [inserted] = await db.insert(stickyNotes).values({ content: content.trim() }).returning();
    revalidatePath("/");
    return inserted.id;
  }
}

export async function updateStickyNote(id: string, content: string) {
  await db.update(stickyNotes).set({ content, updatedAt: new Date() }).where(eq(stickyNotes.id, id));
  revalidatePath("/");
}

export async function deleteStickyNote(id: string) {
  await db.delete(stickyNotes).where(eq(stickyNotes.id, id));
  revalidatePath("/");
}

export async function saveStickyToNote(id: string) {
  const [sticky] = await db.select().from(stickyNotes).where(eq(stickyNotes.id, id));
  if (!sticky) return;
  const lines = sticky.content.split("\n");
  const title = lines[0].replace(/^#+\s*/, "").slice(0, 255) || "Sticky Note";
  await db.insert(notes).values({ title, content: sticky.content, tags: ["sticky"] });
  await db.delete(stickyNotes).where(eq(stickyNotes.id, id));
  revalidatePath("/");
  revalidatePath("/notes");
}

export async function globalSearch(query: string) {
  if (!query?.trim()) return { notes: [], followUps: [], patients: [] };
  const q = `%${query}%`;

  const [noteResults, fuResults, patientResults, diagnosisResults] = await Promise.all([
    db
      .select({ id: notes.id, title: notes.title, tags: notes.tags, content: notes.content, isPinned: notes.isPinned })
      .from(notes)
      .where(or(ilike(notes.title, q), ilike(notes.content, q), sql`${notes.tags}::text ILIKE ${q}`))
      .orderBy(sql`CASE WHEN title ILIKE ${q} THEN 0 WHEN ${notes.tags}::text ILIKE ${q} THEN 1 ELSE 2 END, updated_at DESC`)
      .limit(10),
    db
      .select({ id: followUps.id, title: followUps.title, content: followUps.content, dueDate: followUps.dueDate, status: followUps.status })
      .from(followUps)
      .where(or(ilike(followUps.title, q), ilike(followUps.content, q)))
      .orderBy(asc(followUps.dueDate))
      .limit(5),
    db
      .select({
        id: patients.id, name: patients.name, medicalRecordNo: patients.medicalRecordNo,
        birthDate: patients.birthDate, sex: patients.sex, diagnosis: sql<string | null>`(
          SELECT ${patientVisits.diagnosisPrimary} FROM ${patientVisits}
          WHERE ${patientVisits.patientId} = ${patients.id}
          AND ${patientVisits.diagnosisPrimary} IS NOT NULL
          ORDER BY ${patientVisits.visitDate} DESC LIMIT 1
        )`,
      })
      .from(patients)
      .where(or(ilike(patients.name, q), ilike(patients.medicalRecordNo, q), ilike(patients.parentName, q)))
      .orderBy(desc(patients.updatedAt))
      .limit(5),
    // Search by diagnosis
    db
      .select({
        id: patients.id, name: patients.name, medicalRecordNo: patients.medicalRecordNo,
        birthDate: patients.birthDate, sex: patients.sex,
        diagnosis: patientVisits.diagnosisPrimary,
      })
      .from(patientVisits)
      .innerJoin(patients, eq(patientVisits.patientId, patients.id))
      .where(or(
        ilike(patientVisits.diagnosisPrimary, q),
        ilike(patientVisits.diagnosisSecondary, q),
      ))
      .orderBy(desc(patientVisits.visitDate))
      .limit(5),
  ]);

  // Merge diagnosis-only results with patient results (dedupe by id)
  const seenIds = new Set(patientResults.map((p) => p.id));
  const mergedPatients = [
    ...patientResults,
    ...diagnosisResults.filter((d) => !seenIds.has(d.id)),
  ];

  return {
    notes: noteResults.map((n) => ({ ...n, tags: toArray(n.tags) })),
    followUps: fuResults,
    patients: mergedPatients,
  };
}

export async function autosaveNote(
  id: string,
  data: { title: string; content: string; tags: string[] }
) {
  await requireAuth();
  await db
    .update(notes)
    .set({ title: data.title, content: data.content, tags: data.tags, updatedAt: new Date() })
    .where(eq(notes.id, id));
}

export async function saveNoteVersion(
  noteId: string,
  data: { title: string; content: string; tags: string[] }
) {
  await requireAuth();
  await db.insert(noteVersions).values({
    noteId,
    title: data.title,
    content: data.content,
    tags: data.tags,
  });
}

export async function getNoteVersions(noteId: string) {
  return await db
    .select()
    .from(noteVersions)
    .where(eq(noteVersions.noteId, noteId))
    .orderBy(desc(noteVersions.createdAt))
    .limit(20);
}

export async function restoreNoteVersion(versionId: string) {
  await requireAuth();
  const [version] = await db.select().from(noteVersions).where(eq(noteVersions.id, versionId));
  if (!version) return;
  await db
    .update(notes)
    .set({ title: version.title, content: version.content, tags: version.tags, updatedAt: new Date() })
    .where(eq(notes.id, version.noteId));
  revalidatePath("/notes");
  revalidatePath("/");
}

export async function updateFollowUp(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const content = (formData.get("content") as string) || null;
  const dueDate = formData.get("dueDate") as string;
  const recurrence = (formData.get("recurrence") as string) || "none";
  const status = (formData.get("status") as string) || "PENDING";

  await db
    .update(followUps)
    .set({ title, content, dueDate, recurrence, status })
    .where(eq(followUps.id, id));
  revalidatePath("/follow-ups");
  revalidatePath("/");
}

export async function createPatient(data: {
  medicalRecordNo?: string;
  name: string;
  birthDate?: string;
  sex?: string;
  parentName?: string;
  phone?: string;
  address?: string;
  room?: string;
  bed?: string;
}) {
  const [inserted] = await db.insert(patients).values({
    medicalRecordNo: data.medicalRecordNo || null,
    name: data.name,
    birthDate: data.birthDate || null,
    sex: data.sex || null,
    parentName: data.parentName || null,
    phone: data.phone || null,
    address: data.address || null,
    room: data.room || null,
    bed: data.bed || null,
  }).returning();
  revalidatePath("/pasien");
  return inserted;
}

export async function updatePatient(id: string, data: {
  medicalRecordNo?: string;
  name?: string;
  birthDate?: string;
  sex?: string;
  parentName?: string;
  phone?: string;
  address?: string;
  room?: string;
  bed?: string;
}) {
  await db.update(patients).set({
    medicalRecordNo: data.medicalRecordNo || null,
    name: data.name,
    birthDate: data.birthDate || null,
    sex: data.sex || null,
    parentName: data.parentName || null,
    phone: data.phone || null,
    address: data.address || null,
    room: data.room ?? undefined,
    bed: data.bed ?? undefined,
    updatedAt: new Date(),
  }).where(eq(patients.id, id));
  revalidatePath("/pasien");
  revalidatePath(`/pasien/${id}`);
}

export async function deletePatient(id: string) {
  await db.delete(patients).where(eq(patients.id, id));
  revalidatePath("/pasien");
}

export async function createVisit(data: {
  patientId: string;
  visitDate: string;
  chiefComplaint?: string;
  anamnesis?: string;
  physicalExam?: string;
  weightKg?: string;
  heightCm?: string;
  headCircumferenceCm?: string;
  diagnosisPrimary?: string;
  diagnosisSecondary?: string;
  therapy?: string;
  notes?: string;
  sections?: Record<string, string>;
  labs?: { testName: string; result?: string; unit?: string; referenceRange?: string; flag?: string }[];
  medications?: { drugName: string; dose?: string; frequency?: string; duration?: string; route?: string; notes?: string }[];
}) {
  const [visit] = await db.insert(patientVisits).values({
    patientId: data.patientId,
    visitDate: data.visitDate,
    chiefComplaint: data.chiefComplaint || null,
    anamnesis: data.anamnesis || null,
    physicalExam: data.physicalExam || null,
    weightKg: data.weightKg || null,
    heightCm: data.heightCm || null,
    headCircumferenceCm: data.headCircumferenceCm || null,
    diagnosisPrimary: data.diagnosisPrimary || null,
    diagnosisSecondary: data.diagnosisSecondary || null,
    therapy: data.therapy || null,
    notes: data.notes || null,
    sections: sectionsToArray(data.sections),
  }).returning();

  if (visit && data.labs && data.labs.length > 0) {
    await db.insert(patientLabResults).values(
      data.labs.map((l) => ({
        visitId: visit.id,
        testName: l.testName,
        result: l.result || null,
        unit: l.unit || null,
        referenceRange: l.referenceRange || null,
        flag: l.flag || null,
      }))
    );
  }

  if (visit && data.medications && data.medications.length > 0) {
    await db.insert(patientMedications).values(
      data.medications.map((m) => ({
        visitId: visit.id,
        drugName: m.drugName,
        dose: m.dose || null,
        frequency: m.frequency || null,
        duration: m.duration || null,
        route: m.route || null,
        notes: m.notes || null,
      }))
    );
  }

  revalidatePath(`/pasien/${data.patientId}`);
  revalidatePath("/pasien");
  return visit;
}

export async function updateVisit(id: string, data: {
  visitDate?: string;
  chiefComplaint?: string;
  anamnesis?: string;
  physicalExam?: string;
  weightKg?: string;
  heightCm?: string;
  headCircumferenceCm?: string;
  diagnosisPrimary?: string;
  diagnosisSecondary?: string;
  therapy?: string;
  notes?: string;
  sections?: Record<string, string>;
}) {
  await db.update(patientVisits).set({
    visitDate: data.visitDate,
    chiefComplaint: data.chiefComplaint || null,
    anamnesis: data.anamnesis || null,
    physicalExam: data.physicalExam || null,
    weightKg: data.weightKg || null,
    heightCm: data.heightCm || null,
    headCircumferenceCm: data.headCircumferenceCm || null,
    diagnosisPrimary: data.diagnosisPrimary || null,
    diagnosisSecondary: data.diagnosisSecondary || null,
    therapy: data.therapy || null,
    notes: data.notes || null,
    sections: sectionsToArray(data.sections),
    updatedAt: new Date(),
  }).where(eq(patientVisits.id, id));
  revalidatePath("/pasien");
}

export async function deleteVisit(id: string, patientId: string) {
  await db.delete(patientVisits).where(eq(patientVisits.id, id));
  revalidatePath(`/pasien/${patientId}`);
}

export async function autosaveFollowUp(
  id: string,
  data: { title: string; content: string | null; dueDate: string; status: string; recurrence: string }
) {
  await db
    .update(followUps)
    .set({
      title: data.title,
      content: data.content,
      dueDate: data.dueDate,
      status: data.status,
      recurrence: data.recurrence,
      createdAt: new Date(),
    })
    .where(eq(followUps.id, id));
}

export async function movePatientToRoom(id: string, room: string | null) {
  await db.update(patients).set({ room, updatedAt: new Date() }).where(eq(patients.id, id));
  revalidatePath("/pasien");
}

export async function getPatientsByRoom() {
  const rows = await db
    .select({
      id: patients.id,
      name: patients.name,
      medicalRecordNo: patients.medicalRecordNo,
      bed: patients.bed,
      room: patients.room,
      birthDate: patients.birthDate,
      sex: patients.sex,
      status: patients.status,
      notes: patients.notes,
      dpjp: patients.dpjp,
      diagnosis: sql<string | null>`(
        SELECT ${patientVisits.diagnosisPrimary}
        FROM ${patientVisits}
        WHERE ${patientVisits.patientId} = ${patients.id}
        ORDER BY ${patientVisits.visitDate} DESC
        LIMIT 1
      )`,
    })
    .from(patients)
    .where(eq(patients.status, "rawat_inap"))
    .orderBy(patients.room, patients.bed);

  return rows;
}

export async function updatePatientNotes(id: string, notes: string | null) {
  await db.update(patients).set({ notes, updatedAt: new Date() }).where(eq(patients.id, id));
  revalidatePath("/pasien/kanban");
}

export async function dischargePatient(id: string) {
  await db.update(patients).set({ status: "pulang", room: null, bed: null, updatedAt: new Date() }).where(eq(patients.id, id));
  revalidatePath("/pasien/kanban");
  revalidatePath("/pasien");
}

export async function admitPatient(id: string) {
  await db.update(patients).set({ status: "rawat_inap", updatedAt: new Date() }).where(eq(patients.id, id));
  revalidatePath("/pasien/kanban");
  revalidatePath("/pasien");
}

export type BulkSyncChange = {
  type: "created" | "moved" | "updated" | "discharged";
  patientName: string;
  patientId?: string;
  fromRoom?: string | null;
  toRoom?: string | null;
  fromBed?: string | null;
  toBed?: string | null;
  changes?: string[];
};

export type BulkSyncResult = {
  changes: BulkSyncChange[];
  summary: {
    created: number;
    moved: number;
    updated: number;
    discharged: number;
    total: number;
  };
};

export type BulkSyncInput = {
  patients: {
    name: string;
    room: string;
    bed: string | null;
    medicalRecordNo?: string | null;
    birthDate?: string | null;
    diagnosis?: string | null;
    notes?: string | null;
    dpjp?: string | null;
    status?: "rawat_inap" | "pulang";
  }[];
};

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim().replace(/^(an|nn|nyny|by)\.?\s+/i, "").trim();
}

function normalizeRm(s: string | null | undefined): string | null {
  if (!s) return null;
  return s.replace(/\D/g, "");
}

function normalizeDpjp(s: string | null | undefined): string | null {
  if (!s) return null;
  return s.trim().replace(/\s+/g, " ");
}

export async function bulkSyncPatients(input: BulkSyncInput): Promise<BulkSyncResult> {
  const changes: BulkSyncChange[] = [];

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
    if (p.medicalRecordNo) existingByRm.set(p.medicalRecordNo, p);
  }

  const matched = new Set<string>();
  const inputNamesNorm = new Set<string>();

  for (const inp of input.patients) {
    const nameNorm = normalizeName(inp.name);
    const rmNorm = normalizeRm(inp.medicalRecordNo);
    inputNamesNorm.add(nameNorm);

    let found = rmNorm ? existingByRm.get(rmNorm) : null;
    if (!found) found = existingByName.get(nameNorm);
    if (found) matched.add(found.id);

    if (!found) {
      const [inserted] = await db.insert(patients).values({
        name: inp.name.trim(),
        medicalRecordNo: inp.medicalRecordNo || null,
        birthDate: inp.birthDate || null,
        room: inp.room,
        bed: inp.bed || null,
        status: "rawat_inap",
        notes: inp.notes || null,
        dpjp: normalizeDpjp(inp.dpjp),
      }).returning();
      changes.push({
        type: "created",
        patientName: inp.name.trim(),
        patientId: inserted?.id,
        toRoom: inp.room,
        toBed: inp.bed,
      });
    } else {
      const updated: string[] = [];
      const updateData: Partial<typeof patients.$inferInsert> = { updatedAt: new Date() };

      if (found.room !== inp.room) {
        updated.push(`Ruangan: ${found.room || "-"} → ${inp.room}`);
        updateData.room = inp.room;
      }
      if ((found.bed || null) !== (inp.bed || null)) {
        updated.push(`Bed: ${found.bed || "-"} → ${inp.bed || "-"}`);
        updateData.bed = inp.bed || null;
      }
      if (inp.notes && found.notes !== inp.notes) {
        updated.push(`Catatan diperbarui`);
        updateData.notes = inp.notes;
      }
      if (inp.medicalRecordNo && normalizeRm(found.medicalRecordNo) !== rmNorm) {
        updateData.medicalRecordNo = inp.medicalRecordNo;
      }
      const inpDpjp = normalizeDpjp(inp.dpjp);
      if (inpDpjp && normalizeDpjp(found.dpjp) !== inpDpjp) {
        updated.push(`DPJP: ${found.dpjp || "-"} → ${inpDpjp}`);
        updateData.dpjp = inpDpjp;
      }

      if (Object.keys(updateData).length > 1) {
        await db.update(patients).set(updateData).where(eq(patients.id, found.id));
        if (found.room !== inp.room || (found.bed || null) !== (inp.bed || null)) {
          changes.push({
            type: "moved",
            patientName: inp.name.trim(),
            patientId: found.id,
            fromRoom: found.room,
            toRoom: inp.room,
            fromBed: found.bed,
            toBed: inp.bed,
            changes: updated,
          });
        } else {
          changes.push({
            type: "updated",
            patientName: inp.name.trim(),
            patientId: found.id,
            changes: updated,
          });
        }
      }
    }
  }

  for (const p of existing) {
    if (!matched.has(p.id)) {
      const nameNorm = normalizeName(p.name);
      const rmNorm = normalizeRm(p.medicalRecordNo);
      const isInInput = inputNamesNorm.has(nameNorm) || (rmNorm && Array.from(inputNamesNorm).some(n => n === nameNorm));
      if (!isInInput) {
        await db.update(patients).set({
          status: "pulang",
          room: null,
          bed: null,
          updatedAt: new Date(),
        }).where(eq(patients.id, p.id));
        changes.push({
          type: "discharged",
          patientName: p.name,
          patientId: p.id,
          fromRoom: p.room,
          toRoom: null,
          fromBed: p.bed,
          toBed: null,
        });
      }
    }
  }

  revalidatePath("/pasien/kanban");
  revalidatePath("/pasien");

  return {
    changes,
    summary: {
      created: changes.filter((c) => c.type === "created").length,
      moved: changes.filter((c) => c.type === "moved").length,
      updated: changes.filter((c) => c.type === "updated").length,
      discharged: changes.filter((c) => c.type === "discharged").length,
      total: changes.length,
    },
  };
}

export async function bulkEditPatients(input: BulkSyncInput): Promise<BulkSyncResult> {
  const changes: BulkSyncChange[] = [];

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
    if (p.medicalRecordNo) existingByRm.set(p.medicalRecordNo, p);
  }

  for (const inp of input.patients) {
    const nameNorm = normalizeName(inp.name);
    const rmNorm = normalizeRm(inp.medicalRecordNo);

    let found = rmNorm ? existingByRm.get(rmNorm) : null;
    if (!found) found = existingByName.get(nameNorm);

    if (inp.status === "pulang") {
      if (found) {
        await db.update(patients).set({
          status: "pulang",
          room: null,
          bed: null,
          updatedAt: new Date(),
        }).where(eq(patients.id, found.id));
        changes.push({
          type: "discharged",
          patientName: found.name,
          patientId: found.id,
          fromRoom: found.room,
          fromBed: found.bed,
        });
      }
      continue;
    }

    if (!found) {
      const [inserted] = await db.insert(patients).values({
        name: inp.name.trim(),
        medicalRecordNo: inp.medicalRecordNo || null,
        birthDate: inp.birthDate || null,
        room: inp.room,
        bed: inp.bed || null,
        status: "rawat_inap",
        notes: inp.notes || null,
        dpjp: normalizeDpjp(inp.dpjp),
      }).returning();
      changes.push({
        type: "created",
        patientName: inp.name.trim(),
        patientId: inserted?.id,
        toRoom: inp.room,
        toBed: inp.bed,
      });
    } else {
      const updated: string[] = [];
      const updateData: Partial<typeof patients.$inferInsert> = { updatedAt: new Date() };

      if (found.room !== inp.room) {
        updated.push(`Ruangan: ${found.room || "-"} → ${inp.room}`);
        updateData.room = inp.room;
      }
      if ((found.bed || null) !== (inp.bed || null)) {
        updated.push(`Bed: ${found.bed || "-"} → ${inp.bed || "-"}`);
        updateData.bed = inp.bed || null;
      }
      if (inp.notes && found.notes !== inp.notes) {
        updated.push(`Catatan diperbarui`);
        updateData.notes = inp.notes;
      }
      if (inp.medicalRecordNo && normalizeRm(found.medicalRecordNo) !== rmNorm) {
        updateData.medicalRecordNo = inp.medicalRecordNo;
      }
      const inpDpjp = normalizeDpjp(inp.dpjp);
      if (inpDpjp && normalizeDpjp(found.dpjp) !== inpDpjp) {
        updated.push(`DPJP: ${found.dpjp || "-"} → ${inpDpjp}`);
        updateData.dpjp = inpDpjp;
      }

      if (Object.keys(updateData).length > 1) {
        await db.update(patients).set(updateData).where(eq(patients.id, found.id));
        if (found.room !== inp.room || (found.bed || null) !== (inp.bed || null)) {
          changes.push({
            type: "moved",
            patientName: inp.name.trim(),
            patientId: found.id,
            fromRoom: found.room,
            toRoom: inp.room,
            fromBed: found.bed,
            toBed: inp.bed,
            changes: updated,
          });
        } else {
          changes.push({
            type: "updated",
            patientName: inp.name.trim(),
            patientId: found.id,
            changes: updated,
          });
        }
      }
    }
  }

  revalidatePath("/pasien/kanban");
  revalidatePath("/pasien");

  return {
    changes,
    summary: {
      created: changes.filter((c) => c.type === "created").length,
      moved: changes.filter((c) => c.type === "moved").length,
      updated: changes.filter((c) => c.type === "updated").length,
      discharged: changes.filter((c) => c.type === "discharged").length,
      total: changes.length,
    },
  };
}

export async function undoBulkSync(patientIds: string[]): Promise<{ restored: number }> {
  let restored = 0;
  for (const id of patientIds) {
    const [p] = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
    if (p && p.status === "pulang") {
      await db.update(patients).set({
        status: "rawat_inap",
        updatedAt: new Date(),
      }).where(eq(patients.id, id));
      restored++;
    }
  }
  revalidatePath("/pasien/kanban");
  revalidatePath("/pasien");
  return { restored };
}

export async function findPatientByName(name: string) {
  return await db.select().from(patients).where(ilike(patients.name, `%${name}%`)).limit(5);
}

export async function createPatientWithVisit(data: {
  patient: {
    medicalRecordNo?: string;
    name: string;
    birthDate?: string;
    sex?: string;
    parentName?: string;
    phone?: string;
  };
  visit: {
    visitDate: string;
    chiefComplaint?: string;
    anamnesis?: string;
    physicalExam?: string;
    diagnosisPrimary?: string;
    diagnosisSecondary?: string;
    therapy?: string;
    notes?: string;
    sections?: Record<string, string>;
  };
  labs?: { testName: string; result?: string; unit?: string; referenceRange?: string; flag?: string }[];
  medications?: { drugName: string; dose?: string; frequency?: string; duration?: string; route?: string; notes?: string }[];
}) {
  const [patient] = await db.insert(patients).values({
    medicalRecordNo: data.patient.medicalRecordNo || null,
    name: data.patient.name,
    birthDate: data.patient.birthDate || null,
    sex: data.patient.sex || null,
    parentName: data.patient.parentName || null,
    phone: data.patient.phone || null,
  }).returning();

  if (!patient) throw new Error("Gagal membuat pasien");

  const [visit] = await db.insert(patientVisits).values({
    patientId: patient.id,
    visitDate: data.visit.visitDate,
    chiefComplaint: data.visit.chiefComplaint || null,
    anamnesis: data.visit.anamnesis || null,
    physicalExam: data.visit.physicalExam || null,
    diagnosisPrimary: data.visit.diagnosisPrimary || null,
    diagnosisSecondary: data.visit.diagnosisSecondary || null,
    therapy: data.visit.therapy || null,
    notes: data.visit.notes || null,
    sections: sectionsToArray(data.visit.sections),
  }).returning();

  if (visit && data.labs && data.labs.length > 0) {
    await db.insert(patientLabResults).values(
      data.labs.map((l) => ({
        visitId: visit.id,
        testName: l.testName,
        result: l.result || null,
        unit: l.unit || null,
        referenceRange: l.referenceRange || null,
        flag: l.flag || null,
      }))
    );
  }

  if (visit && data.medications && data.medications.length > 0) {
    await db.insert(patientMedications).values(
      data.medications.map((m) => ({
        visitId: visit.id,
        drugName: m.drugName,
        dose: m.dose || null,
        frequency: m.frequency || null,
        duration: m.duration || null,
        route: m.route || null,
        notes: m.notes || null,
      }))
    );
  }

  revalidatePath("/pasien");
  revalidatePath(`/pasien/${patient.id}`);
  return { patient, visit };
}
