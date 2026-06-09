import { NextRequest, NextResponse } from "next/server";

// Direct AI vision API call — no internal HTTP to avoid auth middleware issues
async function callVisionAPI(imageBase64: string, prompt: string): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL || "https://api.minimax.io/anthropic";

  if (!apiKey) {
    throw new Error("AI_API_KEY not configured in Vercel env vars");
  }

  // Try models in order: VL-01 (vision), M3 (multimodal), M2.7 (multimodal)
  const models = ["MiniMax-VL-01", "MiniMax-M3", "minimax-m3"];
  let lastError = "";

  for (const model of models) {
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          model,
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: imageBase64 },
                },
                {
                  type: "text",
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        lastError = `${model}: ${res.status} - ${errText.slice(0, 100)}`;
        console.error("Vision API failed:", lastError);
        continue; // Try next model
      }

      const data = await res.json();
      const content =
        data.content?.[0]?.text ||
        data.choices?.[0]?.message?.content ||
        "";

      if (content) return content;
    } catch (e) {
      lastError = `${model}: ${e instanceof Error ? e.message : "unknown"}`;
      console.error("Vision API error:", lastError);
    }
  }

  throw new Error(`All vision models failed. Last error: ${lastError}`);
}

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

    // Call vision API with fallback models
    const content = await callVisionAPI(dataUrl, visionPrompt);

    // Parse response
    let extractedData: unknown[] = [];
    try {
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
