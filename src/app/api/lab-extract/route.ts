import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { patientLabResults } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// POST: Upload image → extract lab data via AI vision → save to DB
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
    const visionPrompt = `You are a medical lab result extractor. Analyze this lab result image and extract ALL visible lab parameters.

Return ONLY a valid JSON array, no other text:
[{"testName":"Hemoglobin","result":"10.5","unit":"g/dL","referenceRange":"12.0-16.0","flag":"low"}]

Rules:
- testName: Hemoglobin, Leukosit, Trombosit, Hematokrit, MCV, MCH, MCHC, LED, Ureum, Kreatinin, SGOT, SGPT, Bilirubin Total, Bilirubin Direk, Bilirubin Indirek, Albumin, Na, K, Cl, Ca, Glukosa, CRP, Procalcitonin, Laktat, pH, pCO2, pO2, HCO3, BE, WBC, RBC, PLT, TP, APTT, INR, Ferritin, Transferrin, TIBC, B12, Folat, TSH, T3, T4, Anti-TPO, HbA1c, Uric Acid, Amylase, Lipase, D-Dimer, Fibrinogen, Interleukin-6, Procalcitonin, Blood Culture, Urine Culture, Sputum Culture, Widal, IgM, IgG, NS1, Dengue IgG/IgM, HBsAg, Anti-HCV, HIV, VDRL, Mantoux, GeneXpert, AFB, KOH, Calcium Ionized, Magnesium, Phosphate, CK-MB, Troponin, BNP, NT-proBNP, AST, ALT, GGT, ALP, LDH, Cholesterol, Triglyceride, LDL, HDL
- result: numeric value (string)
- unit: measurement unit
- referenceRange: normal range if visible, else ""
- flag: "high" | "low" | "normal" | "critical_high" | "critical_low" | "unknown"

Extract EVERY visible parameter. ONLY return the JSON array, nothing else.`;

    let extractedData: unknown[] = [];

    // Call vision API
    try {
      const apiUrl =
        process.env.AI_API_URL || "https://api.minimax.io/anthropic";
      const apiKey = process.env.AI_API_KEY;

      if (apiKey) {
        const visionRes = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
          body: JSON.stringify({
            model: process.env.AI_MODEL || "MiniMax-Text-01",
            max_tokens: 4000,
            messages: [
              {
                role: "user",
                content: [
                  { type: "image_url", image_url: { url: dataUrl } },
                  { type: "text", text: visionPrompt },
                ],
              },
            ],
          }),
        });

        if (visionRes.ok) {
          const visionData = await visionRes.json();
          const content =
            visionData.content?.[0]?.text ||
            visionData.choices?.[0]?.message?.content ||
            "";
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            extractedData = JSON.parse(jsonMatch[0]);
          }
        }
      }
    } catch (e) {
      console.error("Vision API error:", e);
    }

    // Save extracted labs to DB if we have data
    if (extractedData.length > 0 && visitId) {
      for (const item of extractedData as Array<Record<string, string>>) {
        try {
          await db.insert(patientLabResults).values({
            visitId,
            testName: item.testName || "Unknown",
            result: item.result || "",
            unit: item.unit || "",
            referenceRange: item.referenceRange || null,
            flag:
              item.flag === "high" ||
              item.flag === "low" ||
              item.flag === "critical_high" ||
              item.flag === "critical_low"
                ? item.flag
                : item.flag === "normal"
                  ? "normal"
                  : null,
          });
        } catch (dbErr) {
          console.error("Failed to save lab result:", dbErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
      visitId,
      extracted: extractedData,
      saved: extractedData.length,
      message:
        extractedData.length > 0
          ? `${extractedData.length} parameter terdeteksi & tersimpan`
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
  try {
    const { searchParams } = new URL(req.url);
    const visitId = searchParams.get("visitId");

    if (!visitId) {
      return NextResponse.json(
        { error: "visitId required" },
        { status: 400 }
      );
    }

    const results = await db
      .select()
      .from(patientLabResults)
      .where(eq(patientLabResults.visitId, visitId))
      .orderBy(patientLabResults.createdAt);

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Get lab results error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lab results" },
      { status: 500 }
    );
  }
}
