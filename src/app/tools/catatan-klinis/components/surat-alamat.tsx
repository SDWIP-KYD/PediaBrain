"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcResult, CalcButton, InfoBox } from "../../components/calc-ui";

export function SuratAlamatDokter() {
  const [namaDokter, setNamaDokter] = useState("");
  const [sip, setSip] = useState("");
  const [alamatPraktek, setAlamatPraktek] = useState("");
  const [telepon, setTelepon] = useState("");
  const [jamPraktek, setJamPraktek] = useState("");
  const [spesialisasi, setSpesialisasi] = useState("");
  const [copied, setCopied] = useState(false);

  const output = `SURAT ALAMAT DOKTER
====================

${namaDokter || "dr. ..., Sp.A"}
${spesialisasi || "Spesialis Anak"}

SIP: ${sip || "..."}

ALAMAT PRAKTIK:
${alamatPraktek || "..."}

TELEPON: ${telepon || "..."}

JAM PRAKTIK:
${jamPraktek || "..."}

${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}

Dokter yang bersangkutan,

${namaDokter || "dr. ..., Sp.A"}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Surat Alamat Dokter" icon="🏥" color="green">
      <div className="space-y-3">
        <CalcInput label="Nama Dokter" type="text" value={namaDokter} onChange={(v) => setNamaDokter(typeof v === "string" ? v : String(v))} placeholder="dr. ..., Sp.A" />
        <CalcInput label="SIP (Surat Izin Praktik)" type="text" value={sip} onChange={(v) => setSip(typeof v === "string" ? v : String(v))} placeholder="No. SIP..." />
        <CalcInput label="Spesialisasi" type="text" value={spesialisasi} onChange={(v) => setSpesialisasi(typeof v === "string" ? v : String(v))} placeholder="Anak, Nefrologi..." />
        <CalcInput label="Alamat Praktik" type="text" value={alamatPraktek} onChange={(v) => setAlamatPraktek(typeof v === "string" ? v : String(v))} placeholder="Jl. ..., Kota..." />
        <CalcInput label="Telepon" type="text" value={telepon} onChange={(v) => setTelepon(typeof v === "string" ? v : String(v))} placeholder="021-..." />
        <CalcInput label="Jam Praktik" type="text" value={jamPraktek} onChange={(v) => setJamPraktek(typeof v === "string" ? v : String(v))} placeholder="Senin-Jumat 08:00-16:00" />
        <CalcResult>
          <pre className="whitespace-pre-wrap text-xs font-mono text-foreground leading-relaxed">{output}</pre>
        </CalcResult>
        <CalcButton onClick={handleCopy} color="green">
          {copied ? "✓ Tersalin!" : "📋 Copy to Clipboard"}
        </CalcButton>
      </div>
    </CalcCard>
  );
}
