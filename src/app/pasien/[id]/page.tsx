import { db } from "@/lib/db";
import { patients, patientVisits, patientLabResults, patientMedications } from "@/lib/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PatientDetailClient } from "./patient-detail-client";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [patient] = await db.select().from(patients).where(eq(patients.id, id));
  if (!patient) notFound();

  const visits = await db
    .select()
    .from(patientVisits)
    .where(eq(patientVisits.patientId, id))
    .orderBy(desc(patientVisits.visitDate));

  const allLabResults = visits.length
    ? await db.select().from(patientLabResults).orderBy(asc(patientLabResults.createdAt))
    : [];
  const allMedications = visits.length
    ? await db.select().from(patientMedications).orderBy(asc(patientMedications.createdAt))
    : [];

  const labsByVisit = new Map<string, typeof allLabResults>();
  for (const l of allLabResults) {
    if (!labsByVisit.has(l.visitId)) labsByVisit.set(l.visitId, []);
    labsByVisit.get(l.visitId)!.push(l);
  }

  const medsByVisit = new Map<string, typeof allMedications>();
  for (const m of allMedications) {
    if (!medsByVisit.has(m.visitId)) medsByVisit.set(m.visitId, []);
    medsByVisit.get(m.visitId)!.push(m);
  }

  const serializedVisits = visits.map((v) => ({
    ...v,
    sections: (v.sections as Record<string, string> | null) ?? null,
  }));

  return (
    <PatientDetailClient
      patient={patient}
      visits={serializedVisits}
      labsByVisit={Object.fromEntries(labsByVisit)}
      medsByVisit={Object.fromEntries(medsByVisit)}
    />
  );
}
