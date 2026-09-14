import { NextRequest, NextResponse } from "next/server";

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ norm: string }> }
) {
  const { norm } = await params;
  const dpjpIndex = parseInt(req.nextUrl.searchParams.get("dpjp") || "", 10);

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
    const sid = await getSirsSid(dpjpIndex);
    if (!sid) {
      return NextResponse.json(
        { ok: false, error: "Gagal autentikasi ke SIRS untuk DPJP ini" },
        { status: 502 }
      );
    }

    const res = await fetch(`${CPPT_URL}?norm=${encodeURIComponent(norm)}`, {
      headers: { Cookie: sid, "User-Agent": "PediaBrain/1.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(25000),
    });

    if (res.status === 401) {
      // Expired server-side — drop cache so the next attempt re-logins
      sidCache.delete(dpjpIndex);
      return NextResponse.json(
        { ok: false, error: "Sesi SIRS berakhir — coba segarkan lagi" },
        { status: 502 }
      );
    }
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `SIRS menolak permintaan (${res.status})` },
        { status: 502 }
      );
    }

    const data = await res.json();

    // Pass through SIRS-native shape:
    // { ok, total, cppt:[{tanggal,kunjungan,penulis,subjektif,objektif,assesment,terapi,planning}] }
    return NextResponse.json({
      ok: !!data.ok,
      total: data.total ?? data.cppt?.length ?? 0,
      cppt: data.cppt || [],
      error: data.error,
    });
  } catch (error) {
    console.error("cppt fetch error:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal terhubung ke SIRS" },
      { status: 502 }
    );
  }
}
