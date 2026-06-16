import { NextRequest, NextResponse } from "next/server";
import { TextDecoder } from "util";

const SYSTEM_PROMPTS: Record<string, string> = {
  note: `Anda adalah asisten dokter anak yang membantu membuat catatan medis.

TUGAS: Buat catatan medis terstruktur dari input user dalam Bahasa Indonesia.

Output HARUS berupa JSON (tanpa markdown, tanpa teks lain):
{
  "title": "judul catatan yang deskriptif",
  "content": "isi catatan lengkap dan profesional dalam Bahasa Indonesia, gunakan format markdown jika diperlukan",
  "tags": ["tag1", "tag2", "tag3"]
}

Jika user meminta revisi, update title/content/tags sesuai permintaan.`,
  laporan: `Anda adalah asisten dokter anak yang mengekstrak data pasien dari laporan.

TUGAS: Ekstrak data pasien dari teks laporan ke JSON.

Output HARUS berupa JSON (tanpa markdown, tanpa teks lain):
{
  "patient": { "name": "...", "medical_record_no": "...", "birth_date": "YYYY-MM-DD", "sex": "L/P" },
  "visit": { "visit_date": "YYYY-MM-DD", "anamnesis": "...", "physical_exam": "...", "diagnosis_primary": "...", "diagnosis_secondary": "...", "therapy": "..." },
  "sections": { "subjektif": "...", "objektif": "...", "assesment": "...", "terapi": "..." }
}`,
  clinical: `Anda adalah dokter spesialis anak (pediatrician) yang membantu menjawab pertanyaan klinis. Jawab dalam Bahasa Indonesia yang jelas dan profesional.`,
  general: `Anda adalah asisten medis yang membantu menjawab pertanyaan umum. Jawab dalam Bahasa Indonesia yang jelas dan profesional.`,
};

const DEFAULT_SYSTEM = `Anda adalah dokter spesialis anak (pediatrician) yang membantu menginterpretasikan hasil laboratorium dan memberikan analisis klinis. Jawab dalam Bahasa Indonesia yang jelas dan profesional.`;

async function callAI(
  baseUrl: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
  history: { role: string; content: string }[] = [],
): Promise<string> {
  const msgs = [
    { role: "system", content: systemPrompt },
    ...history.filter((h) => h.role === "user" || h.role === "assistant"),
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

function tryParseJSON(raw: string): unknown {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  if (cleaned.startsWith("{") || cleaned.startsWith("[")) {
    try {
      return JSON.parse(cleaned);
    } catch {
      // fall through
    }
  }
  const braceMatch = raw.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch {
      // not valid JSON
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [], intent = "general" } = body;

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

    const model = process.env.TIANYUAI_MODEL || "gpt-5.4-mini";
    const systemPrompt = SYSTEM_PROMPTS[intent] || DEFAULT_SYSTEM;

    const raw = await callAI(apiUrl, apiKey, model, systemPrompt, message, history);

    // For structured intents (note, laporan), try to parse JSON from AI response
    if (intent === "note" || intent === "laporan") {
      const parsed = tryParseJSON(raw);
      if (parsed) {
        return NextResponse.json({ data: parsed });
      }
    }

    // Fallback: return raw reply
    return NextResponse.json({ reply: raw });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
