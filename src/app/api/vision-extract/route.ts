import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image, prompt } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiUrl = process.env.AI_API_URL || "https://api.minimax.io/v1/chat/completions";
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "MiniMax-M3",
        max_tokens: 4000,
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

    const data = await response.json();

    // Parse the response
    let results = [];
    try {
      const content = data.content?.[0]?.text || data.choices?.[0]?.message?.content || "";
      // Try to find JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        results = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Failed to parse vision response:", e);
    }

    return NextResponse.json({ results, raw: data });
  } catch (error) {
    console.error("Vision extract error:", error);
    return NextResponse.json(
      { error: "Failed to extract from image" },
      { status: 500 }
    );
  }
}
