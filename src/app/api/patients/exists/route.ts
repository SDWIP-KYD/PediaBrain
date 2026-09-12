import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function parseNorms(raw: string): string[] {
  return raw
    .split(/[;,/\n\r\s]+/)
    .map((s) => s.trim())
    .filter((s) => /^\d{3,8}$/.test(s));
}

export async function GET(req: NextRequest) {
  const normsParam = req.nextUrl.searchParams.get('norms');
  if (!normsParam?.trim()) {
    return NextResponse.json({ exists: [] });
  }

  const norms = parseNorms(normsParam);
  if (norms.length === 0) {
    return NextResponse.json({ exists: [] });
  }

  try {
    const rows = await db
      .select({ mr: patients.medicalRecordNo, id: patients.id })
      .from(patients)
      .where(inArray(patients.medicalRecordNo, norms));

    return NextResponse.json({
      exists: rows.map((r) => ({ norm: r.mr, id: r.id })),
    });
  } catch (error) {
    console.error('exists check error:', error);
    return NextResponse.json(
      { exists: [], error: 'Database query failed' },
      { status: 500 }
    );
  }
}
