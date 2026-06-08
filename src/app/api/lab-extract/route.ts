import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { patientLabResults } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// POST: Upload image → extract lab data via AI vision
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const visitId = formData.get("visitId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read file as base64 for vision API
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Extract lab data via AI vision
    const visionPrompt = `You are a medical lab result extractor. Analyze this lab result image and extract ALL lab parameters.

Return ONLY a valid JSON array in this exact format:
[
  {
    "testName": "Hemoglobin",
    "result": "10.5",
    "unit": "g/dL",
    "referenceRange": "12.0-16.0",
    "flag": "low"
  }
]

Rules:
- testName: the lab parameter name (e.g., Hemoglobin, Leukosit, Trombosit, Hematokrit, MCV, MCH, MCHC, LED, Ureum, Kreatinin, SGOT, SGPT, Bilirubin Total, Bilirubin Direk, Bilirubin Indirek, Albumin, Na, K, Cl, Ca, Glukosa, CRP, Procalcitonin, Laktat, pH, pCO2, pO2, HCO3, BE, WBC, RBC, PLT, etc.)
- result: numeric value only (string)
- unit: the measurement unit
- referenceRange: the normal range shown (or empty string if not visible)
- flag: "high" if above normal, "low" if below normal, "normal" if within range, "unknown" if cannot determine

Extract EVERY visible parameter. Do NOT include any text outside the JSON array.`;

    let extractedData: unknown[] = [];

    // Call vision API
    try {
      const visionRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ""}/api/vision-extract`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataUrl, prompt: visionPrompt }),
        }
      );

      if (visionRes.ok) {
        const visionData = await visionRes.json();
        if (visionData.results) {
          extractedData = visionData.results;
        }
      }
    } catch (e) {
      console.error("Vision API error:", e);
    }

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
      visitId,
      extracted: extractedData,
      message:
        extractedData.length > 0
          ? `${extractedData.length} parameter terdeteksi`
          : "Tidak ada parameter terdeteksi. Silakan input manual.",
    });
  } catch (error) {
    console.error("Lab extract error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}

// GET: Fetch lab results for a visit
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const visitId = searchParams.get("visitId");

  if (!visitId) {
    return NextResponse.json({ error: "visitId required" }, { status: 400 });
  }

  const results = await db
    .select()
    .from(patientLabResults)
    .where(eq(patientLabResults.visitId, visitId))
    .orderBy(patientLabResults.createdAt);

  return NextResponse.json({ results });
}
