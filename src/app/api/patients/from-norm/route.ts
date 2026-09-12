import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { patients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const HEMA_DEMOGRAFI_URL = 'https://hema.ark-kay.my.id/api/demografi';

type DemografiResponse = {
  success: boolean;
  norm?: string;
  name?: string;
  birthDate?: string | null;
  sex?: string | null;
  phone?: string | null;
  address?: string | null;
  dpjp?: string | null;
  error?: string;
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
    const body = await req.json().catch(() => null);
    const norm = body?.norm;

    if (!norm || !/^\d{3,8}$/.test(norm)) {
      return NextResponse.json(
        { success: false, error: 'NORM (3-8 digit) wajib diisi' },
        { status: 400 }
      );
    }

    // Fetch demografi from Hema VPS
    let demografi: DemografiResponse;
    try {
      const hemaRes = await fetch(`${HEMA_DEMOGRAFI_URL}/${norm}`, {
        method: 'GET',
        headers: { 'User-Agent': 'PediaBrain/1.0' },
        cache: 'no-store',
        signal: AbortSignal.timeout(20000),
      });

      if (!hemaRes.ok) {
        return NextResponse.json(
          {
            success: false,
            error: `Gagal mengambil demografi dari SIMRS (${hemaRes.status})`,
          },
          { status: 502 }
        );
      }

      demografi = (await hemaRes.json()) as DemografiResponse;
    } catch (error) {
      console.error('demografi fetch error:', error);
      return NextResponse.json(
        { success: false, error: 'Gagal terhubung ke server Hema' },
        { status: 502 }
      );
    }

    if (!demografi.success || !demografi.name) {
      return NextResponse.json(
        { success: false, error: 'Pasien tidak ditemukan di SIMRS' },
        { status: 404 }
      );
    }

    // Upsert: check if patient with this medical_record_no already exists
    const existing = await db
      .select({
        id: patients.id,
        room: patients.room,
        bed: patients.bed,
      })
      .from(patients)
      .where(eq(patients.medicalRecordNo, norm))
      .limit(1);

    const name = normalizeName(demografi.name);

    let patient;
    if (existing.length > 0) {
      // Update demografi fields, preserve room/bed/status
      const [updated] = await db
        .update(patients)
        .set({
          name,
          birthDate: demografi.birthDate || null,
          sex: demografi.sex || null,
          phone: demografi.phone || null,
          address: demografi.address || null,
          updatedAt: new Date(),
        })
        .where(eq(patients.id, existing[0].id))
        .returning();

      patient = updated;
      revalidatePath('/pasien');
      revalidatePath(`/pasien/${patient.id}`);
    } else {
      // Insert new
      const [inserted] = await db
        .insert(patients)
        .values({
          medicalRecordNo: norm,
          name,
          birthDate: demografi.birthDate || null,
          sex: demografi.sex || null,
          phone: demografi.phone || null,
          address: demografi.address || null,
          room: null,
          bed: null,
          status: 'rawat_inap',
        })
        .returning();

      patient = inserted;
      revalidatePath('/pasien');
    }

    return NextResponse.json({ success: true, patient });
  } catch (error) {
    console.error('from-norm error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
