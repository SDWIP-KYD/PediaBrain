import { NextRequest, NextResponse } from "next/server";

type ExtractedSections = {
  identitas: string;
  diagnosa: string;
  subjektif: string;
  objektif: string;
  pemeriksaan_penunjang: string;
  terapi: string;
};

type ExtractedData = {
  sections: ExtractedSections;
  patient: {
    name: string | null;
    birth_date: string | null;
    sex: string | null;
    parent_name: string | null;
    phone: string | null;
    medical_record_no: string | null;
  };
  visit: {
    visit_date: string;
    chief_complaint: string | null;
    anamnesis: string | null;
    physical_exam: string | null;
    diagnosis_primary: string | null;
    diagnosis_secondary: string | null;
    therapy: string | null;
    notes: string | null;
  };
  labs: { test_name: string; result: string | null; unit: string | null; reference_range: string | null; flag: string | null }[];
  medications: { drug_name: string; dose: string | null; frequency: string | null; duration: string | null; route: string | null; notes: string | null }[];
};

function detectIntent(message: string): "laporan" | "note" | "followup" | "chat" {
  const trimmed = message.trim();
  const firstWord = trimmed.split(/\s+/)[0].toLowerCase().replace(/[.,!?;:]/g, "");
  const start3 = trimmed.slice(0, 30).toLowerCase().replace(/[.,!?;:]/g, "");

  if (/^(fu|followup|follow-up|ingatkan)$/.test(firstWord)) return "followup";
  if (/^laporan/.test(firstWord)) return "laporan";
  if (/^(note|catatkan|simpankan|simpan)$/.test(firstWord)) return "note";
  if (/^(tambahkan ke note|simpan ke note|buat catatan|tulis catatan)/.test(start3)) return "note";
  return "chat";
}

function parseFollowupDate(message: string): string {
  const today = new Date();
  const ID_MONTHS: Record<string, string> = {
    januari: "01", februari: "02", maret: "03", april: "04", mei: "05", juni: "06",
    juli: "07", agustus: "08", september: "09", oktober: "10", november: "11", desember: "12",
    jan: "01", feb: "02", mar: "03", apr: "04", jun: "06",
    jul: "07", agu: "08", sep: "09", okt: "10", nov: "11", des: "12",
  };
  const normalizeDate = (d: string, m: string, y: string): string => {
    let month = ID_MONTHS[m.toLowerCase()] || m;
    if (month.length === 1) month = "0" + month;
    if (y.length === 2) y = (parseInt(y) > 50 ? "19" : "20") + y;
    return `${y}-${month}-${d.padStart(2, "0")}`;
  };

  // Explicit date: "8/6/26", "8-6-2026", "2026-06-08"
  const slashDate = message.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);
  if (slashDate) return normalizeDate(slashDate[1], slashDate[2], slashDate[3]);

  // Indonesian: "8 Juni 2026"
  const idDate = message.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (idDate && ID_MONTHS[idDate[2].toLowerCase()]) return normalizeDate(idDate[1], idDate[2], idDate[3]);

  // Relative: besok/lusa/X hari/minggu/bulan
  if (/\bbesok\b/i.test(message)) { today.setDate(today.getDate() + 1); return today.toISOString().split("T")[0]; }
  if (/\blusa\b/i.test(message)) { today.setDate(today.getDate() + 2); return today.toISOString().split("T")[0]; }
  const dayMatch = message.match(/(\d+)\s*(hari|hari\s+lagi|hari\s+kemudian)/i);
  if (dayMatch) { today.setDate(today.getDate() + parseInt(dayMatch[1])); return today.toISOString().split("T")[0]; }
  const weekMatch = message.match(/(\d+)\s*(minggu|minggu\s+lagi)/i);
  if (weekMatch) { today.setDate(today.getDate() + parseInt(weekMatch[1]) * 7); return today.toISOString().split("T")[0]; }
  const monthMatch = message.match(/(\d+)\s*(bulan|bulan\s+lagi)/i);
  if (monthMatch) { today.setMonth(today.getMonth() + parseInt(monthMatch[1])); return today.toISOString().split("T")[0]; }

  today.setDate(today.getDate() + 7);
  return today.toISOString().split("T")[0];
}

function parseTagsToSections(raw: string): ExtractedSections {
  const empty: ExtractedSections = {
    identitas: "", diagnosa: "", subjektif: "", objektif: "", pemeriksaan_penunjang: "", terapi: "",
  };
  const tagMap: Record<keyof ExtractedSections, RegExp> = {
    identitas: /<Identitas>([\s\S]*?)<\/Identitas>/i,
    diagnosa: /<Diagnosa(?:[\/\s]Assesment)?>([\s\S]*?)<\/Diagnosa(?:[\/\s]Assesment)?>/i,
    subjektif: /<Subjektif>([\s\S]*?)<\/Subjektif>/i,
    objektif: /<Objektif>([\s\S]*?)<\/Objektif>/i,
    pemeriksaan_penunjang: /<Pemeriksaan\s*Penunjang>([\s\S]*?)<\/Pemeriksaan\s*Penunjang>/i,
    terapi: /<Terapi>([\s\S]*?)<\/Terapi>/i,
  };
  for (const key of Object.keys(tagMap) as (keyof ExtractedSections)[]) {
    const m = raw.match(tagMap[key]);
    if (m) empty[key] = m[1].trim();
  }
  return empty;
}

const ID_MONTHS: Record<string, string> = {
  januari: "01", februari: "02", maret: "03", april: "04", mei: "05", juni: "06",
  juli: "07", agustus: "08", september: "09", oktober: "10", november: "11", desember: "12",
  jan: "01", feb: "02", mar: "03", apr: "04", jun: "06",
  jul: "07", agu: "08", sep: "09", okt: "10", nov: "11", des: "12",
};

function parseIndonesianDate(s: string): string | null {
  const cleaned = s.trim();
  const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return cleaned;
  const slashMatch = cleaned.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (slashMatch) {
    let [, d, m, y] = slashMatch;
    if (y.length === 2) y = (parseInt(y) > 50 ? "19" : "20") + y;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const idMatch = cleaned.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/);
  if (idMatch) {
    const month = ID_MONTHS[idMatch[2].toLowerCase()];
    if (month) return `${idMatch[3]}-${month}-${idMatch[1].padStart(2, "0")}`;
  }
  return null;
}

function buildStructuredData(sections: ExtractedSections): ExtractedData {
  const identityLines = sections.identitas.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  let name: string | null = null;
  let medicalRecordNo: string | null = null;
  let birthDate: string | null = null;
  let sex: string | null = null;

  for (const line of identityLines) {
    if (!name && /[A-Za-z]{3,}/.test(line)) {
      const firstPart = line.split("/")[0].trim();
      if (firstPart.length > 2) name = firstPart;
    }
    const mrnMatch = line.match(/(\d{4,})/);
    if (!medicalRecordNo && mrnMatch) medicalRecordNo = mrnMatch[1];
    if (!birthDate) {
      const dateMatch = line.match(/(\d{1,2}\s+\w+\s+\d{4})|(\d{4}-\d{2}-\d{2})|(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/);
      if (dateMatch) birthDate = parseIndonesianDate(dateMatch[0]);
    }
    if (!sex && /\b(L|P|Laki-laki|Perempuan)\b/i.test(line)) {
      const sexMatch = line.match(/\b(L|P|Laki-laki|Perempuan)\b/i);
      if (sexMatch) sex = sexMatch[1].toUpperCase().startsWith("P") || sexMatch[1].toUpperCase().startsWith("L") ? sexMatch[1][0].toUpperCase() : sexMatch[1].toUpperCase();
    }
  }

  const diagnosisItems = sections.diagnosa.split(/[,\n]+/).map((s) => s.replace(/^[-*•\s]+/, "").trim()).filter(Boolean);
  const diagnosisPrimary = diagnosisItems[0] ?? null;
  const diagnosisSecondary = diagnosisItems.slice(1).join(", ") || null;

  return {
    sections,
    patient: { name, birth_date: birthDate, sex, parent_name: null, phone: null, medical_record_no: medicalRecordNo },
    visit: {
      visit_date: new Date().toISOString().split("T")[0],
      chief_complaint: sections.subjektif ? sections.subjektif.split("\n")[0].trim() : null,
      anamnesis: sections.subjektif || null,
      physical_exam: sections.objektif || null,
      diagnosis_primary: diagnosisPrimary, diagnosis_secondary: diagnosisSecondary,
      therapy: sections.terapi || null, notes: null,
    },
    labs: [], medications: [],
  };
}

async function callAI(baseUrl: string, apiKey: string, model: string, systemPrompt: string, history: { role: string; content: string }[], userMessage: string, maxTokens: number, temperature: number): Promise<string> {
  const msgs = [{ role: "system", content: systemPrompt }];
  const histLimit = history.slice(-10);
  for (const h of histLimit) {
    msgs.push({ role: h.role === "assistant" ? "assistant" : "user", content: h.content });
  }
  msgs.push({ role: "user", content: userMessage });

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages: msgs, temperature, max_tokens: maxTokens }),
  });
  if (!res.ok) throw new Error(`AI error ${res.status}`);
  const data = await res.json();
  return (data?.choices?.[0]?.message?.content ?? "").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.message?.trim()) {
    return NextResponse.json({ error: "Message kosong" }, { status: 400 });
  }

  const baseUrl = process.env.AI_BASE_URL;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || "MiniMax-M2.7";

  if (!baseUrl || !apiKey) {
    return NextResponse.json({ error: "AI credentials not set" }, { status: 500 });
  }

  const history: { role: "user" | "assistant"; content: string }[] = body.history || [];
  const intent = body.intent || detectIntent(body.message);

  try {
    // FOLLOWUP — date calculated server-side
    if (intent === "followup") {
      const dueDate = parseFollowupDate(body.message);
      const fuPrompt = `Ekstrak follow-up. Output JSON: {"title":"judul singkat","content":"detail tindakan/kondisi"}. JSON only.`;
      const raw = await callAI(baseUrl, apiKey, model, fuPrompt, history, body.message, 512, 0.1);
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      let fuData;
      try { fuData = JSON.parse(cleaned); } catch { fuData = {}; }
      fuData.dueDate = dueDate;
      if (!fuData.title) fuData.title = "Follow-up";
      if (!fuData.content) fuData.content = body.message;
      return NextResponse.json({ mode: "live", intent: "followup", data: fuData });
    }

    // NOTE — simple auto-tag
    if (intent === "note") {
      const notePrompt = `Ekstrak catatan medis. Output JSON saja: {"title":"judul singkat 3-5 kata","content":"isi lengkap catatan","tags":["tag1","tag2"]}. Tags: diagnosa, terapi, lab, obs, anamnesis, obat, tindakan, followup, umum. JSON only, no markdown.`;
      const raw = await callAI(baseUrl, apiKey, model, notePrompt, history, body.message, 2048, 0.1);
      const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      let noteData;
      try { noteData = JSON.parse(cleaned); } catch { noteData = { title: "Catatan Medis", content: cleaned, tags: [] }; }
      return NextResponse.json({ mode: "live", intent: "note", data: noteData });
    }

    // CHAT
    if (intent === "chat") {
      const chatPrompt = `Asisten medis pediatric. Jawab singkat, akurat, berbasis bukti. Bahasa Indonesia.`;
      const reply = await callAI(baseUrl, apiKey, model, chatPrompt, history, body.message, 1024, 0.3);
      return NextResponse.json({ mode: "live", intent: "chat", reply });
    }

    // LAPORAN — default
    const laporanPrompt = `Parse laporan pasien ke 6 tag XML. Output HANYA tag XML.

<Identitas>nama/no RM/ttl/usia/sex/ruang</Identitas>
<Diagnosa>semua diagnosis</Diagnosa>
<Subjektif>anamnesis/keluhan</Subjektif>
<Objektif>pemeriksaan fisik/tanda vital</Objektif>
<Pemeriksaan Penunjang>lab/radiologi - tulis persis nilai+satuan</Pemeriksaan Penunjang>
<Terapi>obat/cairan - tulis persis dosis+frek</Terapi>

Rules: Copy teks asli. Output tag XML saja.`;
    const cleaned = await callAI(baseUrl, apiKey, model, laporanPrompt, history, body.message, 2048, 0.1);
    const sections = parseTagsToSections(cleaned);
    const extracted = buildStructuredData(sections);
    return NextResponse.json({ mode: "live", intent: "laporan", data: extracted });

  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "AI error" }, { status: 500 });
  }
}
