import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { patients, patientCpptNotes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const SIRS_BASE = "https://sirs.kay.web.id";

export const LOGIN_URL = `${SIRS_BASE}/api/login`;
export const CPPT_URL = `${SIRS_BASE}/api/cppt`;

// In-memory cache of SIRS session cookies per DPJP index (per serverless instance).
// SIRS session TTL is 8h; refresh earlier to be safe.
const SESSION_TTL_MS = 6 * 60 * 60 * 1000;
const sidCache = new Map<number, { sid: string; expires: number }>();

async function getSirsSid(accountIndex: number): Promise<string | null> {
  const cached = sidCache.get(accountIndex);
  if (cached && cached.expires > Date.now()) return cached.sid;

  try {
    const res = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "select", account_index: accountIndex }),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;

    // undici exposes getSetCookie(); fall back to splitting the joined header
    const raw: string[] =
      typeof res.headers.getSetCookie === "function"
        ? res.headers.getSetCookie()
        : (res.headers.get("set-cookie") || "").split(/,(?=\s*sid=)/);
    const sidCookie = raw.find((c) => c.trim().startsWith("sid="));
    if (!sidCookie) return null;

    const sid = sidCookie.trim().split(";")[0]; // "sid=<uuid>"
    sidCache.set(accountIndex, { sid, expires: Date.now() + SESSION_TTL_MS });
    return sid;
  } catch {
    return null;
  }
}

type CpptNote = {
  tanggal: string;
  kunjungan: string;
  penulis: string;
  subjektif: string;
  objektif: string;
  assesment: string;
  terapi: string;
  planning: string;
};

async function fetchFromSirs(norm: string, dpjpIndex: number) {
  const sid = await getSirsSid(dpjpIndex);
  if (!sid) {
    return { ok: false as const, error: "Gagal autentikasi ke SIRS untuk DPJP ini" };
  }
  const res = await fetch(`${CPPT_URL}?norm=${encodeURIComponent(norm)}`, {
    headers: { Cookie: sid, "User-Agent": "PediaBrain/1.0" },
    cache: "no-store",
    signal: AbortSignal.timeout(25000),
  });
  if (res.status === 401) {
    sidCache.delete(dpjpIndex);
    return { ok: false as const, error: "Sesi SIRS berakhir — coba segarkan lagi" };
  }
  if (!res.ok) {
    return { ok: false as const, error: `SIRS menolak permintaan (${res.status})` };
  }
  const data = await res.json();
  if (!data.ok) {
    return { ok: false as const, error: data.error || "SIRS menolak permintaan" };
  }
  return { ok: true as const, cppt: (data.cppt || []) as CpptNote[] };
}

async function saveToDb(patientId: string, cppt: CpptNote[]) {
  await db.delete(patientCpptNotes).where(eq(patientCpptNotes.patientId, patientId));
  if (cppt.length > 0) {
    await db.insert(patientCpptNotes).values(
      cppt.map((c) => ({
        patientId,
        kunjungan: c.kunjungan || null,
        tanggal: c.tanggal || null,
        penulis: c.penulis || null,
        subjektif: c.subjektif || null,
        objektif: c.objektif || null,
        assesment: c.assesment || null,
        terapi: c.terapi || null,
        planning: c.planning || null,
      }))
    );
  }
}

function rowToNote(r: typeof patientCpptNotes.$inferSelect): CpptNote {
  return {
    tanggal: r.tanggal ?? "",
    kunjungan: r.kunjungan ?? "",
    penulis: r.penulis ?? "",
    subjektif: r.subjektif ?? "",
    objektif: r.objektif ?? "",
    assesment: r.assesment ?? "",
    terapi: r.terapi ?? "",
    planning: r.planning ?? "",
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ norm: string }> }
) {
  const { norm } = await params;
  const dpjpIndex = parseInt(req.nextUrl.searchParams.get("dpjp") || "", 10);
  const refresh = req.nextUrl.searchParams.get("refresh") === "1";

  if (!norm || !/^\d{3,8}$/.test(norm)) {
    return NextResponse.json(
      { ok: false, error: "NORM (3-8 digit) wajib diisi" },
      { status: 400 }
    );
  }
  if (Number.isNaN(dpjpIndex) || dpjpIndex < 0 || dpjpIndex > 99) {
    return NextResponse.json(
      { ok: false, error: "Pilih DPJP terlebih dahulu" },
      { status: 400 }
    );
  }

  try {
    const [patient] = await db
      .select({ id: patients.id })
      .from(patients)
      .where(eq(patients.medicalRecordNo, norm))
      .limit(1);

    // 1) Serve from Neon cache when available and not forcing refresh
    if (patient && !refresh) {
      const rows = await db
        .select()
        .from(patientCpptNotes)
        .where(eq(patientCpptNotes.patientId, patient.id))
        .orderBy(desc(patientCpptNotes.tanggal));
      if (rows.length > 0) {
        return NextResponse.json({
          ok: true,
          total: rows.length,
          cppt: rows.map(rowToNote),
          source: "db",
          cachedAt: rows[0].updatedAt.toISOString(),
        });
      }
    }

    // 2) Fetch live from SIRS and persist
    const live = await fetchFromSirs(norm, dpjpIndex);
    if (!live.ok) {
      if (patient) {
        const rows = await db
          .select()
          .from(patientCpptNotes)
          .where(eq(patientCpptNotes.patientId, patient.id))
          .orderBy(desc(patientCpptNotes.tanggal));
        if (rows.length > 0) {
          return NextResponse.json({
            ok: true,
            total: rows.length,
            cppt: rows.map(rowToNote),
            source: "db",
            stale: true,
            staleError: live.error,
          });
        }
      }
      return NextResponse.json({ ok: false, error: live.error }, { status: 502 });
    }

    if (patient && live.cppt.length > 0) {
      await saveToDb(patient.id, live.cppt);
    }

    return NextResponse.json({
      ok: true,
      total: live.cppt.length,
      cppt: live.cppt,
      source: "sirs",
    });
  } catch (error) {
    console.error("cppt fetch error:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal terhubung ke SIRS" },
      { status: 502 }
    );
  }
}
