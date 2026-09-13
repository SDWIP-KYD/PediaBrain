import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { patients, patientVisits, patientLabResults } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

type LabParam = {
  name: string;
  hasil: string;
  normal: string;
  satuan: string;
};

type HemaVisit = {
  tgl: string;
  params: LabParam[];
};

type HemaResponse = {
  success: boolean;
  norm?: string;
  name?: string;
  visits?: HemaVisit[];
  special?: Record<string, unknown>;
  is_partial?: boolean;
  error?: string;
};

type PostBody = {
  norm: string;
  labData?: HemaResponse;
};

function normalizeName(name: string): string {
  return name
    .trim()
    .replace(/^(an|ny|nyny|by)\.?\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as PostBody | null;
    const norm = body?.norm;
    const labData = body?.labData;

    if (!norm || !/^\d{3,8}$/.test(norm)) {
      return NextResponse.json(
        { success: false, error: 'NORM (3-8 digit) wajib diisi' },
        { status: 400 }
      );
    }

    // Derive name from labData (from hema-lookup card) — no separate demografi fetch needed
    const rawName = labData?.name || '';
    if (!rawName) {
      return NextResponse.json(
        { success: false, error: 'Nama pasien tidak tersedia dari data lab yang dikirim' },
        { status: 404 }
      );
    }

    const name = normalizeName(rawName);

    // Upsert patient identity
    const existing = await db
      .select({
        id: patients.id,
        room: patients.room,
        bed: patients.bed,
      })
      .from(patients)
      .where(eq(patients.medicalRecordNo, norm))
      .limit(1);

    let patient;
    if (existing.length > 0) {
      const [updated] = await db
        .update(patients)
        .set({
          name,
          updatedAt: new Date(),
        })
        .where(eq(patients.id, existing[0].id))
        .returning();
      patient = updated;
    } else {
      const [inserted] = await db
        .insert(patients)
        .values({
          medicalRecordNo: norm,
          name,
          room: null,
          bed: null,
          status: 'rawat_inap',
        })
        .returning();
      patient = inserted;
    }

    // Persist lab visits + results if provided
    let savedVisits = 0;
    if (labData?.visits && labData.success) {
      for (const visit of labData.visits) {
        if (!visit.tgl) continue;

        // Upsert visit by (patientId, visitDate)
        const existingVisit = await db
          .select({ id: patientVisits.id })
          .from(patientVisits)
          .where(
            and(
              eq(patientVisits.patientId, patient.id),
              eq(patientVisits.visitDate, visit.tgl)
            )
          )
          .limit(1);

        let visitId: string;
        if (existingVisit.length > 0) {
          visitId = existingVisit[0].id;
          await db
            .update(patientVisits)
            .set({
              updatedAt: new Date(),
              notes: `Lab hasil SIMRS — diperbarui ${new Date().toISOString().slice(0, 10)}`,
            })
            .where(eq(patientVisits.id, visitId));
        } else {
          const [inserted] = await db
            .insert(patientVisits)
            .values({
              patientId: patient.id,
              visitDate: visit.tgl,
              notes: `Lab hasil SIMRS — diambil ${new Date().toISOString().slice(0, 10)}`,
            })
            .returning();
          visitId = inserted.id;
        }

        // Upsert lab results by (visitId, testName)
        for (const param of visit.params) {
          if (!param.name || !param.hasil) continue;
          const existingResult = await db
            .select({ id: patientLabResults.id })
            .from(patientLabResults)
            .where(
              and(
                eq(patientLabResults.visitId, visitId),
                eq(patientLabResults.testName, param.name)
              )
            )
            .limit(1);

          const resultData = {
            visitId,
            testName: param.name,
            result: param.hasil,
            unit: param.satuan || null,
            referenceRange: param.normal || null,
            flag: null,
          };

          if (existingResult.length > 0) {
            await db
              .update(patientLabResults)
              .set(resultData)
              .where(eq(patientLabResults.id, existingResult[0].id));
          } else {
            await db.insert(patientLabResults).values(resultData);
          }
        }

        savedVisits++;
      }
    }

    revalidatePath('/pasien');
    revalidatePath(`/pasien/${patient.id}`);

    return NextResponse.json({
      success: true,
      patient,
      savedVisits,
    });
  } catch (error) {
    console.error('from-norm error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
