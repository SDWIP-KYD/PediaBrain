import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "No message" }, { status: 400 });
    }

    const apiKey = process.env.TIANYUAI_API_KEY;
    const apiUrl = process.env.TIANYUAI_BASE_URL || "https://tianyuai.lol/v1";

    if (!apiKey) {
      return NextResponse.json(
        { error: "TIANYUAI_API_KEY not configured" },
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
        max_tokens: 2000,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "Anda adalah dokter spesialis anak (pediatrician) yang membantu menginterpretasikan hasil laboratorium dan memberikan analisis klinis. Jawab dalam Bahasa Indonesia yang jelas dan profesional.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI chat error:", aiRes.status, errText);
      return NextResponse.json(
        { error: "AI API failed", detail: errText.slice(0, 200) },
        { status: 500 }
      );
    }

    const aiData = await aiRes.json();
    const reply =
      aiData.choices?.[0]?.message?.content || "Tidak ada respons dari AI.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
