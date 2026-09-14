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

    // Normalize: SIRS returns {ok, cppt:[]}, Hema VPS returns {success, visits:[]}
    const rawVisits = data.visits || data.cppt || [];
    const success = data.success ?? data.ok ?? false;

    // Map SIRS fields to PediaBrain CpptSection schema:
    //   penulis → dpjp, terapi+planning → plan
    const visits = rawVisits.map((v: Record<string, unknown>) => ({
      tanggal: (v.tanggal || v.TANGGAL || "") as string,
      kunjungan: (v.kunjungan || v.KUNJUNGAN || "") as string,
      dpjp: (v.dpjp || v.penulis || v.PENULIS || "") as string,
      subjektif: (v.subjektif || v.SUBYEKTIF || "") as string,
      objektif: (v.objektif || v.OBYEKTIF || "") as string,
      assesment: (v.assesment || v.ASSESMENT || "") as string,
      plan: (
        String(v.terapi || "") + (v.planning ? "\n\n" + String(v.planning) : "") ||
        (v.plan || v.PLAN || "")
      ) as string,
      vital: v.vital,
    }));

    return NextResponse.json({
      success: !!success,
      error: data.error,
      norm: norm,
      name: data.name,
      visits: visits,
    });
  } catch (error) {
    console.error("cppt fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal terhubung ke server Hema" },
      { status: 502 }
    );
  }
}
