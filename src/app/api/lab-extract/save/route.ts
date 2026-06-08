import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { patientLabResults } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { visitId, results } = await req.json();

    if (!visitId || !results || !Array.isArray(results)) {
      return NextResponse.json({ error: "visitId and results required" }, { status: 400 });
    }

    // Insert all lab results
    const inserted = await Promise.all(
      results
        .filter((r: { testName: string; result: string }) => r.testName && r.result)
        .map((r: { testName: string; result: string; unit?: string; referenceRange?: string; flag?: string }) =>
          db
            .insert(patientLabResults)
            .values({
              visitId,
              testName: r.testName,
              result: r.result,
              unit: r.unit || null,
              referenceRange: r.referenceRange || null,
              flag: r.flag || "normal",
            })
            .returning()
        )
    );

    return NextResponse.json({
      success: true,
      count: inserted.length,
    });
  } catch (error) {
    console.error("Save lab results error:", error);
    return NextResponse.json(
      { error: "Failed to save lab results" },
      { status: 500 }
    );
  }
}
