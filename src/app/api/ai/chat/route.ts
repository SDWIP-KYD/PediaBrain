import { NextRequest, NextResponse } from "next/server";
import { TextDecoder } from "util";

async function callAI(
  baseUrl: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const msgs = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: msgs,
      max_tokens: 2000,
      temperature: 0.3,
      stream: true,
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
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "No message" }, { status: 400 });
    }

    const apiKey = process.env.TIANYUAI_API_KEY;
    const apiUrl = process.env.TIANYUAI_BASE_URL;

    if (!apiKey || !apiUrl) {
      return NextResponse.json(
        { error: "AI credentials not configured — set TIANYUAI_API_KEY and TIANYUAI_BASE_URL" },
        { status: 500 }
      );
    }

    const model = "gpt-5.4-mini";

    const systemPrompt =
      "Anda adalah dokter spesialis anak (pediatrician) yang membantu menginterpretasikan hasil laboratorium dan memberikan analisis klinis. Jawab dalam Bahasa Indonesia yang jelas dan profesional.";

    const raw = await callAI(apiUrl, apiKey, model, systemPrompt, message);

    return NextResponse.json({ reply: raw });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
