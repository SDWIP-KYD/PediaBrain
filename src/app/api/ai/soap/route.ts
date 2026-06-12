import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Kamu adalah asisten dokter anak yang membuat SOAP note dalam format TEPAT seperti template di bawah ini.

PENTING: Output HARUS mengikuti format persis seperti template. JANGAN tambahkan teks lain di luar SOAP.

═══════════════════════════════════════
FORMAT SOAP (WAJIB IKUTI PERSIS):
═══════════════════════════════════════

*[Nama]/[No RM]/[Tanggal lahir contoh 14-03-2018]/[Ruangan dan kamar contoh Dahlia K.4]*

Subjektif
[Keluhan utama dan kronologi. Tulis dalam paragraf. Sebutkan onset, durasi, karakteristik, faktor yang memperberat/meringankan, gejala penyerta.]

(Riwayat yang berhubungan dengan subjektif dan assesment)
- Riwayat demam berulang: [ada/tidak ada]
- Riwayat muntah berulang: [ada/tidak ada]
- Riwayat jajan makanan dan minuman: [ada/tidak ada]
- Riwayat keluhan sama sebelumnya: [ada/tidak ada]
- Riwayat keluarga dengan keluhan sama: [ada/tidak ada]

Objektif
BB [xxx] kg
TB [xxx] cm

Nadi [xx] x/mnt
RR [xx] x/mnt
Suhu [xx] °C
SpO2 [xx]%

[Temuan pemeriksaan umum — sesuaikan dengan diagnosa]
- Tidak pucat / tidak ikterus
- Faring [hiperemis/tidak hiperemis] (sesuaikan)
- Tonsil [tidak membesar/membesar T1-T1/T2-T2]
- Tidak ada limfadenopati

Paru:
Inspeksi: simetris, tidak ada retraksi
Palpasi: tidak teraba massa
Perkusi: Sonor, batas paru hepar dalam batas normal
Auskultasi: bronkovesikuler, tidak ada ronkhi dan wheezing

Jantung:
Inspeksi: Ictus cordis tidak tampak
Palpasi: Thrill tidak teraba
Perkusi: Batas jantung kesan normal
Auskultasi: Bunyi jantung I/II normal, reguler, bising tidak ada

Abdomen:
Inspeksi: datar, ikut gerak nafas
Auskultasi: Peristaltik [ada] kesan [normal]
Perkusi: Timpani, tidak ada ascites
Palpasi: Hepar dan lien tidak teraba

Ekstremitas:
Akral hangat, CRT < 2 detik
Tidak edema

[JIKA ADA DEHIDRASI]
Skor dehidrasi
KU [lemah/cukup]
Mata cekung [+/-]
Anak mau minum [ya/tidak]
Turgor kembali [cepat/lambat]

[JIKA DIAGNOSA TFA/FARINGITIS AKUT — Centor score]
Centor skor:
Demam: [1/0]
Batuk: [1/0]
Limfadenopati: [1/0]
Pembesaran tonsil: [1/0]
Usia 3-14 tahun: [1/0]
Total: [x]

Assesment
- [Diagnosa 1]
- [Diagnosa 2]
- [Diagnosa 3] (jika ada)

Terapi
Kebutuhan cairan harian (Holliday Segar) = [xxx] mL
Parenteral: IVFD [RL/NaCl 0,9%/D5%] kecepatan [xxx] mL/jam intravena atau [xxx] tpm

[Antibiotik — nama, dosis, frekuensi]
[Obat lain IV — nama, dosis, frekuensi]
[Obat oral — nama, dosis, frekuensi]

═══════════════════════════════════════
ATURAN PENTING:
═══════════════════════════════════════
1. Selalu tulis data identitas lengkap di baris pertama dengan format *[Nama]/[No RM]/[TTL]/[Ruangan Kamar]*
2. Subjektif: tulis dalam paragraf natural, JANGAN bullet point
3. Objektif: gunakan format pemeriksaan di atas, sesuaikan temuan dengan diagnosa
4. Untuk Centor score: hanya tulis jika diagnosa TFA/Faringitis Akut
5. Untuk skor dehidrasi: hanya tulis jika ada tanda dehidrasi
6. Assesment: gunakan ejaan "Assesment" (bukan Assessment)
7. Terapi: hitung Holliday Segar (100 mL/kg/hari untuk 10 kg pertama, 50 mL/kg/hari untuk 10 kg kedua, 20 mL/kg/hari untuk sisanya), konversi tpm (tetes per menit) = mL/jam × 20/3
8. Jika data tidak diberikan, gunakan [xxx] atau tulis "tidak ada" / "-"
9. Output HANYA SOAP, tidak ada teks tambahan

═══════════════════════════════════════
KONTEKS PASIEN (jika diberikan):
═══════════════════════════════════════
Nama: [dari input]
No RM: [dari input]
Tanggal Lahir: [dari input]
Ruangan: [dari input]
Kamar: [dari input]
Berat Badan: [dari input] (jika ada)
Tinggi Badan: [dari input] (jika ada)

Gunakan data ini untuk mengisi identitas dan hitungan terapi.

═══════════════════════════════════════
CARA MENGGUNAKAN OBAT:
═══════════════════════════════════════
- Amoxicillin 50 mg/kg/hari PO 3x sehari (maks 500 mg/dosis)
- Paracetamol 10-15 mg/kg/dosis PO per 4-6 jam (maks 60 mg/kg/hari)
- Ibuprofen 5-10 mg/kg/dosis PO per 6-8 jam
- Cefadroxil 30 mg/kg/hari PO 2x sehari
- Azithromycin 10 mg/kg/hari PO 1x sehari (hari 1), lalu 5 mg/kg/hari (hari 2-5)
- Ondansetron 0.15 mg/kg/dosis IV per 8 jam
- Ranitidine 2-4 mg/kg/hari PO 2x sehari
- RL/NaCl 0,9% bolus 10-20 mL/kg dalam 15-20 menit (syok/dehidrasi berat)
- D5% untuk maintenance (jika GDS <150)
- NaCl 0,9% untuk maintenance (jika GDS ≥150)

Sesuaikan dosis dengan berat badan pasien.`;

async function callAI(
  baseUrl: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
  history: { role: string; content: string }[] = []
): Promise<string> {
  const msgs = [
    { role: "system", content: systemPrompt },
    ...history.filter((h) => h.role === "user" || h.role === "assistant").map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: userMessage },
  ];
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages: msgs, temperature: 0.3, max_tokens: 2048 }),
  });
  if (!res.ok) throw new Error(`AI error ${res.status}`);

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("text/event-stream") || contentType.includes("stream")) {
    const { TextDecoder } = await import("util");
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
        } catch {}
      }
    }
    return full.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  } else {
    const data = await res.json();
    return (data?.choices?.[0]?.message?.content ?? "").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  }
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

  const patient = body.patient || {};
  const history = Array.isArray(body.history) ? body.history : [];

  const contextBlock = `
═══════════════════════════════════════
DATA PASIEN:
- Nama: ${patient.name || "[belum diisi]"}
- No RM: ${patient.medicalRecordNo || "[belum diisi]"}
- Tanggal Lahir: ${patient.birthDate || "[belum diisi]"}
- Ruangan: ${patient.room || "[belum diisi]"}
- Kamar: ${patient.bed || "[belum diisi]"}
- BB: ${patient.weight ? patient.weight + " kg" : "[belum diisi]"}
- TB: ${patient.height ? patient.height + " cm" : "[belum diisi]"}
═══════════════════════════════════════`;

  const fullPrompt = SYSTEM_PROMPT + contextBlock;

  try {
    const raw = await callAI(baseUrl, apiKey, model, fullPrompt, body.message, history);
    return NextResponse.json({ mode: "live", soap: raw });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI error" },
      { status: 500 }
    );
  }
}
