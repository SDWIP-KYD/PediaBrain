import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image, prompt } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiUrl = process.env.AI_BASE_URL;
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey || !apiUrl) {
      return NextResponse.json(
        { error: "AI API key or base URL not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "gemincombo",
        max_tokens: 4000,
        stream: true,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: image },
              },
              {
                type: "text",
                text: prompt || "Extract all lab parameters from this image. Return JSON array.",
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Vision API error:", errText);
      return NextResponse.json(
        { error: "Vision API failed" },
        { status: 500 }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    let rawContent = "";
    if (contentType.includes("text/event-stream") || contentType.includes("stream")) {
      const { TextDecoder } = await import("util");
      const decoder = new TextDecoder();
      let full = "";
      const reader = response.body!.getReader();
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
          } catch {}
        }
      }
      rawContent = full.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    } else {
      const data = await response.json();
      rawContent = data?.choices?.[0]?.message?.content ?? "";
    }

    // Parse the response
    let results: unknown[] = [];
    try {
      const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        results = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse vision response:", e);
    }

    return NextResponse.json({ results, raw: rawContent });
  } catch (error) {
    console.error("Vision extract error:", error);
    return NextResponse.json(
      { error: "Failed to extract from image" },
      { status: 500 }
    );
  }
}
