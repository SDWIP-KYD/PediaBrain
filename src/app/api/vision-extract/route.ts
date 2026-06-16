import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image, prompt } = await req.json();

    const apiUrl = process.env.AI_BASE_URL;
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey || !apiUrl) {
      return NextResponse.json(
        { error: "AI API key or base URL not configured" },
        { status: 500 }
      );
    }

    // Build messages — with image if provided, text-only otherwise
    const messages: { role: string; content: unknown }[] = [];
    if (image) {
      messages.push({
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
      });
    } else {
      messages.push({
        role: "user",
        content: prompt || "Apa yang bisa saya bantu?",
      });
    }

    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "MiniMax-M2.7",
        max_tokens: 4000,
        stream: false,
        messages,
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

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content ?? "";

    // For vision extraction, try to parse JSON array from response
    let results: unknown[] = [];
    if (image) {
      try {
        const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          results = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error("Failed to parse vision response:", e);
      }
    }

    return NextResponse.json({
      results,
      response: rawContent,
      raw: rawContent,
    });
  } catch (error) {
    console.error("Vision extract error:", error);
    return NextResponse.json(
      { error: "Failed to extract from image" },
      { status: 500 }
    );
  }
}
