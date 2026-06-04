"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { notes, followUps, stickyNotes, noteVersions, patients, patientVisits, patientLabResults, patientMedications } from "@/lib/db/schema";
import { eq, and, or, ilike, sql, asc, desc } from "drizzle-orm";

export async function createNote(formData: FormData) {
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
  await db.delete(notes).where(eq(notes.id, id));
  revalidatePath("/notes");
  revalidatePath("/");
}

export async function togglePinNote(id: string) {
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

  const [noteResults, fuResults, patientResults] = await Promise.all([
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
      .select({ id: patients.id, name: patients.name, medicalRecordNo: patients.medicalRecordNo, birthDate: patients.birthDate, sex: patients.sex })
      .from(patients)
      .where(or(ilike(patients.name, q), ilike(patients.medicalRecordNo, q), ilike(patients.parentName, q)))
      .orderBy(desc(patients.updatedAt))
      .limit(5),
  ]);

  return {
    notes: noteResults.map((n) => ({ ...n, tags: n.tags as string[] })),
    followUps: fuResults,
    patients: patientResults,
  };
}

export async function autosaveNote(
  id: string,
  data: { title: string; content: string; tags: string[] }
) {
  await db
    .update(notes)
    .set({ title: data.title, content: data.content, tags: data.tags, updatedAt: new Date() })
    .where(eq(notes.id, id));
}

export async function saveNoteVersion(
  noteId: string,
  data: { title: string; content: string; tags: string[] }
) {
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
}) {
  const [inserted] = await db.insert(patients).values({
    medicalRecordNo: data.medicalRecordNo || null,
    name: data.name,
    birthDate: data.birthDate || null,
    sex: data.sex || null,
    parentName: data.parentName || null,
    phone: data.phone || null,
    address: data.address || null,
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
}) {
  await db.update(patients).set({
    medicalRecordNo: data.medicalRecordNo || null,
    name: data.name,
    birthDate: data.birthDate || null,
    sex: data.sex || null,
    parentName: data.parentName || null,
    phone: data.phone || null,
    address: data.address || null,
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
    diagnosisPrimary: data.diagnosisPrimary || null,
    diagnosisSecondary: data.diagnosisSecondary || null,
    therapy: data.therapy || null,
    notes: data.notes || null,
    sections: data.sections || null,
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
  diagnosisPrimary?: string;
  diagnosisSecondary?: string;
  therapy?: string;
  notes?: string;
}) {
  await db.update(patientVisits).set({
    visitDate: data.visitDate,
    chiefComplaint: data.chiefComplaint || null,
    anamnesis: data.anamnesis || null,
    physicalExam: data.physicalExam || null,
    diagnosisPrimary: data.diagnosisPrimary || null,
    diagnosisSecondary: data.diagnosisSecondary || null,
    therapy: data.therapy || null,
    notes: data.notes || null,
    updatedAt: new Date(),
  }).where(eq(patientVisits.id, id));
  revalidatePath("/pasien");
}

export async function deleteVisit(id: string, patientId: string) {
  await db.delete(patientVisits).where(eq(patientVisits.id, id));
  revalidatePath(`/pasien/${patientId}`);
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
    sections: data.visit.sections || null,
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
