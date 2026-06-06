import { NextRequest, NextResponse } from "next/server";

type ParsedPatient = {
  room: string;
  bed: string | null;
  name: string;
  medicalRecordNo: string | null;
  birthDate: string | null;
  diagnosis: string | null;
  notes: string | null;
  dpjp: string | null;
  status?: "rawat_inap" | "pulang";
};

const ID_MONTHS: Record<string, string> = {
  januari: "01", februari: "02", maret: "03", april: "04", mei: "05", juni: "06",
  juli: "07", agustus: "08", september: "09", oktober: "10", november: "11", desember: "12",
  jan: "01", feb: "02", mar: "03", apr: "04", jun: "06",
  jul: "07", agu: "08", sep: "09", okt: "10", nov: "12", des: "12",
};

function parseIndonesianDateLoose(s: string): string | null {
  const cleaned = s.trim();
  if (!cleaned) return null;
  const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return cleaned;
  const slashMatch = cleaned.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (slashMatch) {
    let [, d, m, y] = slashMatch;
    if (y.length === 2) y = (parseInt(y) > 50 ? "19" : "20") + y;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const idMatch = cleaned.match(/^(\d{1,2})[\s-]+(\w+)[\s-]+(\d{4})$/);
  if (idMatch) {
    const month = ID_MONTHS[idMatch[2].toLowerCase()];
    if (month) return `${idMatch[3]}-${month}-${idMatch[1].padStart(2, "0")}`;
  }
  return null;
}

async function callAI(baseUrl: string, apiKey: string, model: string, systemPrompt: string, userMessage: string, history: { role: string; content: string }[] = [], maxTokens: number, temperature: number): Promise<string> {
  const msgs = [
    { role: "system", content: systemPrompt },
    ...history.filter(h => h.role === "user" || h.role === "assistant").map(h => ({ role: h.role, content: h.content })),
    { role: "user", content: userMessage },
  ];
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

  const mode = body.mode || "sync";

  const editSystemPrompt = `Kamu adalah asisten edit pasien rawat inap pediatric.

TUGAS: Interpret instruksi user dan ekstrak aksi yang diminta ke JSON array.

USER BISA MEMINTA:
- Tambah pasien baru
- Edit pasien (pindah kamar/bed, update catatan, update DPJP)
- Pulangkan pasien (discharge)

FORMAT OUTPUT (JSON saja, no markdown, no explanation):
{
  "patients": [
    {
      "room": "DAHLIA|ANGGREK|MELATI|SERUNI",
      "bed": "K.01.1 atau null",
      "name": "nama lengkap pasien",
      "medicalRecordNo": "no RM atau null",
      "birthDate": "YYYY-MM-DD atau null",
      "diagnosis": "diagnosis atau null",
      "notes": "catatan atau null",
      "dpjp": "nama DPJP atau null",
      "status": "rawat_inap atau pulang"
    }
  ]
}

ATURAN PENTING:
- status "rawat_inap" = pasien yang ditambah/diupdate (default jika tidak disebut)
- status "pulang" = pasien yang ingin dipulangkan/discharge
- Jika user bilang "pulangkan Budi", maka Budi dapat status "pulang"
- Jika user bilang "tambah Ani di MELATI K.03", maka Ani dapat status "rawat_inap"
- Jika user bilang "Budi pindah ke ANGGREK K.02", maka Budi dapat status "rawat_inap" dengan room=ANGGREK bed=K.02
- Jika user bilang "tambah catatan untuk Budi: gentamisin", maka Budi dapat status "rawat_inap" dengan notes="gentamisin"
- Jika user hanya menyebut 1-2 pasien, HANYA return pasien tersebut. JANGAN return pasien lain.
- KONTEKS PERCAKAPAN: Jika user memberikan koreksi atau tambahan (misal "bukan Ani tapi Budi", "tambah juga K.05", "jangan pulangkan"), GUNAKAN konteks pesan sebelumnya untuk memahami maksud user. Return hasil yang sudah dikoreksi/dilengkapi, bukan duplikat.
- Jika user bilang "jangan tambah catatan" atau "batalin", return array kosong {"patients": []}
- Room: uppercase (DAHLIA, ANGGREK, MELATI, SERUNI)
- Bed: pola "K.XX" atau "K.XX.X"
- Nama: setelah bed, sebelum nomor RM
- MedicalRecordNo: angka 4-7 digit
- BirthDate: DD-MM-YYYY → YYYY-MM-DD
- Diagnosis: teks diagnosis
- Notes: catatan tambahan
- DPJP: dari baris "*DPJP : ...*"
- Jika ada title "An." atau "Ny.", hilangkan dari nama
- Abaikan nomor urut, baris kosong, baris "-", TOTAL

Output HARUS JSON valid.`;

  const syncSystemPrompt = `Kamu adalah parser list pasien rawat inap pediatric.

TUGAS: Extract daftar pasien dari teks yang diberikan menjadi JSON array.

FORMAT OUTPUT (JSON saja, no markdown, no explanation):
{
  "patients": [
    {
      "room": "DAHLIA|ANGGREK|MELATI|SERUNI",
      "bed": "K.01.1 atau null jika tidak ada",
      "name": "nama lengkap pasien",
      "medicalRecordNo": "no RM atau null",
      "birthDate": "YYYY-MM-DD atau null",
      "diagnosis": "diagnosis utama + tambahan atau null",
      "notes": "catatan tambahan seperti 'Rencana pulang besok', 'Pulang', 'Gentamisin', 'USG', dll. Atau null",
      "dpjp": "nama DPJP atau null"
    }
  ]
}

ATURAN PENTING:
- Parse semua pasien yang ada di list
- Room: teks yang uppercase (DAHLIA, ANGGREK, MELATI, SERUNI) — ini nama ruangan
- Bed: ambil dari pola "K.XX" atau "K.XX.X" di awal baris pasien
- Nama: setelah bed, sebelum nomor RM (jika ada)
- MedicalRecordNo: angka 4-7 digit, biasanya setelah nama
- BirthDate: format DD-MM-YYYY atau DD/MM/YYYY → konversi ke YYYY-MM-DD
- Diagnosis: semua teks diagnosis setelah tanggal
- Notes: informasi tambahan setelah diagnosis (Rencana pulang, Pulang, obat, dll)
- DPJP: ambil dari baris "*DPJP : ...*"
- Abaikan baris kosong, baris "-", dan baris TOTAL
- Jika ada nama dengan title "An." atau "Ny.", hilangkan title dari nama
- Abaikan nomor urut (1. 2. 3. dll)

Output HARUS JSON valid.`;

  const systemPrompt = mode === "edit" ? editSystemPrompt : syncSystemPrompt;

  try {
    const history = Array.isArray(body.history) ? body.history : [];
    const raw = await callAI(baseUrl, apiKey, model, systemPrompt, body.message, history, 4096, 0.1);
    let cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    
    let parsed: { patients: ParsedPatient[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Gagal memparse output AI");
      }
    }

    if (!parsed.patients || !Array.isArray(parsed.patients)) {
      throw new Error("Format output AI tidak valid");
    }

    const validRooms = ["DAHLIA", "ANGGREK", "MELATI", "SERUNI"];
    const patients = parsed.patients
      .filter((p) => {
        if (!p || !p.name) return false;
        if (p.status === "pulang") return true;
        return validRooms.includes((p.room || "").toUpperCase());
      })
      .map((p) => ({
        room: p.room?.toUpperCase() || "",
        bed: p.bed || null,
        name: p.name.trim(),
        medicalRecordNo: p.medicalRecordNo || null,
        birthDate: p.birthDate ? (parseIndonesianDateLoose(p.birthDate) || null) : null,
        diagnosis: p.diagnosis || null,
        notes: p.notes || null,
        dpjp: p.dpjp || null,
        status: p.status || "rawat_inap",
      }));

    return NextResponse.json({ mode: "live", patients });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "AI error" }, { status: 500 });
  }
}
