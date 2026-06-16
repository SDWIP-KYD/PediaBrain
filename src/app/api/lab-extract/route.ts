import { NextRequest, NextResponse } from "next/server";
import { TextDecoder } from "util";

async function callAIVision(
  baseUrl: string,
  apiKey: string,
  model: string,
  prompt: string,
  imageDataUrl: string,
): Promise<string> {
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      temperature: 0.1,
      stream: false,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageDataUrl },
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
    throw new Error(`AI error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("text/event-stream") || contentType.includes("stream")) {
    const decoder = new TextDecoder();
    let full = "";
    const reader = res.body!.getReader();
    const regex = /^data:\s*/;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        const jsonStr = trimmed.replace(regex, "").trim();
        if (jsonStr === "[DONE]" || jsonStr === "") continue;
        try {
          const obj = JSON.parse(jsonStr);
          const delta = obj?.choices?.[0]?.delta?.content;
          if (delta) full += delta;
        } catch {
          // skip unparseable chunks
        }
      }
    }
    return full.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  } else {
    const data = await res.json();
    return (data?.choices?.[0]?.message?.content ?? "")
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .trim();
  }
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

    const apiKey = process.env.TIANYUAI_API_KEY;
    const apiUrl = process.env.TIANYUAI_BASE_URL;
    const model = process.env.TIANYUAI_MODEL || "gpt-5.4-mini";

    if (!apiKey || !apiUrl) {
      return NextResponse.json(
        {
          error: "TIANYUAI_API_KEY or TIANYUAI_BASE_URL not configured",
        },
        { status: 500 }
      );
    }

    const raw = await callAIVision(apiUrl, apiKey, model, visionPrompt, dataUrl);

    // Parse JSON array from response
    let extractedData: unknown[] = [];
    try {
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
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
