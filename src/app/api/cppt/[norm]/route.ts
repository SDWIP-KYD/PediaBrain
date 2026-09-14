import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const HEMA_CPPT_URL = "https://hema.ark-kay.my.id/api/cppt";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ norm: string }> }
) {
  const { norm } = await params;

  if (!norm || !/^\d{3,8}$/.test(norm)) {
    return NextResponse.json(
      { success: false, error: "NORM (3-8 digit) wajib diisi" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${HEMA_CPPT_URL}/${norm}`, {
      method: "GET",
      headers: { "User-Agent": "PediaBrain/1.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json(
          { success: false, error: "Endpoint CPPT belum tersedia di server" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: `Gagal mengambil CPPT (${res.status})` },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("cppt fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal terhubung ke server Hema" },
      { status: 502 }
    );
  }
}
