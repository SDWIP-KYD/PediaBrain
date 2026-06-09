import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read file as base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

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
- testName: the lab parameter name
- result: numeric value only (string)
- unit: the measurement unit
- referenceRange: the normal range shown (or empty string if not visible)
- flag: "high" if above normal, "low" if below normal, "normal" if within range, "unknown" if cannot determine
- Extract EVERY visible parameter
- Do NOT include any text outside the JSON array
- If you cannot read the image, return an empty array []`;

    // === TianyuAI Vision API (GPT-5.4-mini) ===
    const apiKey = process.env.TIANYUAI_API_KEY;
    const apiUrl = process.env.TIANYUAI_BASE_URL || "https://tianyuai.lol/v1";

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "TIANYUAI_API_KEY not configured",
          detail: "Set TIANYUAI_API_KEY in Vercel env vars. Goto: Vercel Dashboard → Settings → Environment Variables",
        },
        { status: 500 }
      );
    }

    const aiRes = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: dataUrl },
              },
              {
                type: "text",
                text: visionPrompt,
              },
            ],
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("Vision API error:", aiRes.status, errText);
      return NextResponse.json(
        {
          error: "Vision API failed",
          detail: `Status ${aiRes.status}: ${errText.slice(0, 200)}`,
        },
        { status: 500 }
      );
    }

    const aiData = await aiRes.json();

    // Parse response
    let extractedData: unknown[] = [];
    try {
      const content =
        aiData.choices?.[0]?.message?.content ||
        aiData.content?.[0]?.text ||
        "";
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse vision response:", e);
    }

    return NextResponse.json({
      success: true,
      visitId: formData.get("visitId"),
      extracted: extractedData,
      message:
        extractedData.length > 0
          ? `${extractedData.length} parameter terdeteksi`
          : "Tidak ada parameter terdeteksi. Silakan input manual.",
    });
  } catch (error) {
    console.error("Lab extract error:", error);
    return NextResponse.json(
      {
        error: "Failed to process image",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
