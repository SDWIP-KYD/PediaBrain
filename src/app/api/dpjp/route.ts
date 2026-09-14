import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

const SIRS_ACCOUNTS_URL = "https://sirs.kay.web.id/api/accounts";

// Public list of DPJP accounts (labels only) — proxied so the client
// stays same-origin and SIRS remains the single source of truth.
export async function GET() {
  try {
    const res = await fetch(SIRS_ACCOUNTS_URL, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `SIRS menolak (${res.status})` },
        { status: 502 }
      );
    }
    const data = await res.json();
    return NextResponse.json({
      ok: !!data.ok,
      accounts: Array.isArray(data.accounts) ? data.accounts : [],
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Gagal terhubung ke SIRS" },
      { status: 502 }
    );
  }
}
