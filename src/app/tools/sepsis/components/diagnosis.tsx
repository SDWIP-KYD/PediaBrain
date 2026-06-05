"use client";

import { useState, useMemo } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox, ResultAlert } from "../../components/calc-ui";

const investigationData = [
  { exam: "Laktat darah", indication: "⭐ Rekomendasi kuat. Periksa semua probable sepsis" },
  { exam: "Kultur darah (2 set)", indication: "Sebelum antibiotik; jangan tunda antibiotik" },
  { exam: "DPL + hitung jenis", indication: "Leukositosis/leukopenia, trombositopenia" },
  { exam: "CRP / Procalcitonin", indication: "PCT: bukan untuk rutin panduan de-eskalasi" },
  { exam: "Fungsi ginjal (ureum, Cr)", indication: "AKI monitoring" },
  { exam: "Fungsi hati (ALT, AST, bilirubin)", indication: "Disfungsi hepatik" },
  { exam: "Koagulasi (PT, APTT, fibrinogen, D-dimer)", indication: "DIC assessment" },
  { exam: "Gula darah", indication: "Hipoglikemia/hiperglikemia" },
  { exam: "Kalsium, Mg", indication: "Elektrolit kritis pada sepsis" },
  { exam: "Kultur urin, LCS", indication: "Sesuai klinis & sumber infeksi" },
  { exam: "Rontgen dada", indication: "Bila dicurigai sumber paru" },
  { exam: "POCUS (jantung + paru)", indication: "✅ Disarankan untuk panduan resusitasi" },
  { exam: "Molecular testing (PCR)", indication: "Bukti tidak cukup untuk rutin direkomendasikan" },
];

type RespScore = 0 | 1 | 2;
type CardioScore = 0 | 1 | 2 | 3;
type CoagScore = 0 | 1 | 2;
type NeuroScore = 0 | 1 | 2;

interface PhoenixScores {
  resp: RespScore;
  cardio: CardioScore;
  coag: CoagScore;
  neuro: NeuroScore;
}

function classifyPhoenix(total: number, cardioScore: number): string {
  if (total >= 2 && cardioScore >= 1) return "SEPTIC SHOCK";
  if (total >= 2) return "SEPSIS";
  if (total === 1) return "SUSPECTED (skor 1)";
  return "TIDAK MEMENUHI KRITERIA";
}

function getRiskColor(total: number, cardioScore: number): string {
  if (total >= 2 && cardioScore >= 1) return "red";
  if (total >= 2) return "orange";
  if (total === 1) return "yellow";
  return "green";
}

export function SepsisDiagnosis() {
  const { weightGram, ageYears } = usePatient();

  const [resp, setResp] = useState<RespScore>(0);
  const [cardio, setCardio] = useState<CardioScore>(0);
  const [coag, setCoag] = useState<CoagScore>(0);
  const [neuro, setNeuro] = useState<NeuroScore>(0);

  const total = resp + cardio + coag + neuro;
  const classification = classifyPhoenix(total, cardio);
  const riskColor = getRiskColor(total, cardio);

  const respDetails = useMemo(() => {
    switch (resp) {
      case 0: return { label: "Normal", desc: "Tidak ada disfungsi respirasi" };
      case 1: return { label: "Sedang", desc: "SpO₂/FiO₂ 97–215 (atau PF 100–200) + vent, atau ventilasi invasif saja" };
      case 2: return { label: "Berat", desc: "SpO₂/FiO₂ <97 (atau PF <100) + vent" };
    }
  }, [resp]);

  const cardioDetails = useMemo(() => {
    switch (cardio) {
      case 0: return { label: "Normal", desc: "Tidak ada disfungsi kardiovaskular" };
      case 1: return { label: "Ringan", desc: "Laktat 5–10.9 mmol/L atau 1 vasoaktif" };
      case 2: return { label: "Sedang", desc: "Laktat ≥11 atau 2+ vasoaktif" };
      case 3: return { label: "Berat", desc: "+1 poin: Hipotensi + vasoaktif atau laktat ≥5" };
    }
  }, [cardio]);

  const coagDetails = useMemo(() => {
    switch (coag) {
      case 0: return { label: "Normal", desc: "Tidak ada disfungsi koagulasi" };
      case 1: return { label: "Sedang", desc: "Plt <100 atau INR >1.3 atau D-dimer >2" };
      case 2: return { label: "Berat", desc: "Plt <50 atau INR >1.5 atau fibrinogen <100" };
    }
  }, [coag]);

  const neuroDetails = useMemo(() => {
    switch (neuro) {
      case 0: return { label: "Normal", desc: "GCS normal, pupil reaktif" };
      case 1: return { label: "Sedang", desc: "GCS ≤10" };
      case 2: return { label: "Berat", desc: "Pupil anisokor/fixed bilateral" };
    }
  }, [neuro]);

  return (
    <div className="space-y-3">
      <CalcCard title="Phoenix Sepsis Score — Kalkulator Interaktif" subtitle="Penilaian 4 domain organ" icon="🎯" color="yellow">
        <InfoBox>
          <strong>🎯 Langkah Diagnosis</strong>
          <br />
          1. Kenali anak sakit akut → curigai infeksi
          <br />
          2. Hitung <strong>Phoenix Sepsis Score</strong>
          <br />
          3. Tentukan: sepsis atau septic shock
          <br />
          4. Ambil kultur darah (sebelum antibiotik jika tidak menunda)
          <br />
          5. Ukur <strong>laktat darah</strong> (rekomendasi kuat)
          <br />
          6. Cari sumber infeksi (source of infection)
        </InfoBox>

        <CalcResult color="red">
          <div className="space-y-3 text-xs">
            {/* Respirasi Domain */}
            <div>
              <p className="font-semibold mb-1">🫁 Respirasi</p>
              <CalcSelect
                label="Skor Respirasi"
                value={String(resp)}
                onChange={(v) => setResp(Number(v) as RespScore)}
                options={[
                  { value: "0", label: "0 — Normal" },
                  { value: "1", label: "1 — SpO₂/FiO₂ 97–215 + vent / ventilasi invasif saja" },
                  { value: "2", label: "2 — SpO₂/FiO₂ <97 + vent" },
                ]}
              />
              <p className="text-[10px] text-muted-foreground mt-1">{respDetails.desc}</p>
            </div>

            <div className="border-t border-border pt-2" />

            {/* Kardiovaskular Domain */}
            <div>
              <p className="font-semibold mb-1">❤️ Kardiovaskular</p>
              <CalcSelect
                label="Skor Kardiovaskular"
                value={String(cardio)}
                onChange={(v) => setCardio(Number(v) as CardioScore)}
                options={[
                  { value: "0", label: "0 — Normal" },
                  { value: "1", label: "1 — Laktat 5–10.9 atau 1 vasoaktif" },
                  { value: "2", label: "2 — Laktat ≥11 atau 2+ vasoaktif" },
                  { value: "3", label: "3 — Hipotensi + vasoaktif atau laktat ≥5 (+1)" },
                ]}
              />
              <p className="text-[10px] text-muted-foreground mt-1">{cardioDetails.desc}</p>
            </div>

            <div className="border-t border-border pt-2" />

            {/* Koagulasi Domain */}
            <div>
              <p className="font-semibold mb-1">🩸 Koagulasi</p>
              <CalcSelect
                label="Skor Koagulasi"
                value={String(coag)}
                onChange={(v) => setCoag(Number(v) as CoagScore)}
                options={[
                  { value: "0", label: "0 — Normal" },
                  { value: "1", label: "1 — Plt <100 atau INR >1.3 atau D-dimer >2" },
                  { value: "2", label: "2 — Plt <50 atau INR >1.5 atau fibrinogen <100" },
                ]}
              />
              <p className="text-[10px] text-muted-foreground mt-1">{coagDetails.desc}</p>
            </div>

            <div className="border-t border-border pt-2" />

            {/* Neurologis Domain */}
            <div>
              <p className="font-semibold mb-1">🧠 Neurologis</p>
              <CalcSelect
                label="Skor Neurologis"
                value={String(neuro)}
                onChange={(v) => setNeuro(Number(v) as NeuroScore)}
                options={[
                  { value: "0", label: "0 — Normal" },
                  { value: "1", label: "1 — GCS ≤10" },
                  { value: "2", label: "2 — Pupil anisokor/fixed bilateral" },
                ]}
              />
              <p className="text-[10px] text-muted-foreground mt-1">{neuroDetails.desc}</p>
            </div>
          </div>
        </CalcResult>

        <CalcResult color={riskColor}>
          <ResultGrid cols={2}>
            <ResultItem label="Total Phoenix Score" value={total} unit="/7" />
            <ResultItem label="Klasifikasi" value={classification} />
            <ResultItem label="Skor Respirasi" value={resp} unit="poin" />
            <ResultItem label="Skor Kardiovaskular" value={cardio} unit="poin" />
            <ResultItem label="Skor Koagulasi" value={coag} unit="poin" />
            <ResultItem label="Skor Neurologis" value={neuro} unit="poin" />
          </ResultGrid>

          {total >= 2 && cardio >= 1 && (
            <ResultAlert type="danger">
              ⚠️ SEPTIC SHOCK — Phoenix {total} + domain kardiovaskular {cardio}. Resusitasi agresif segera! Mulai antibiotik dalam 1 jam.
            </ResultAlert>
          )}
          {total >= 2 && cardio === 0 && (
            <ResultAlert type="warning">
              ⚠️ SEPSIS — Phoenix {total}. Evaluasi sumber infeksi, mulai antibiotik dalam 3 jam jika terkonfirmasi.
            </ResultAlert>
          )}
          {total === 1 && (
            <ResultAlert type="info">
              Suspected sepsis — skor belum memenuhi kriteria. Pantau dan evaluasi lebih lanjut.
            </ResultAlert>
          )}
        </CalcResult>
      </CalcCard>

      <CalcCard title="Pemeriksaan Penunjang" icon="🔬" color="blue">
        <CalcResult>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-semibold">Pemeriksaan</th>
                  <th className="text-left py-2 font-semibold">Indikasi / Catatan</th>
                </tr>
              </thead>
              <tbody>
                {investigationData.map((row) => (
                  <tr key={row.exam} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.exam}</td>
                    <td className="py-2 text-muted-foreground">{row.indication}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcResult>
      </CalcCard>

      <CalcCard title="Tidak Direkomendasikan Rutin" icon="❌" color="blue">
        <InfoBox>
          <strong>🔍 Tidak Direkomendasikan Rutin</strong>
          <br />
          • Systematic sepsis screening tambahan di luar protokol klinis yang ada
          <br />
          • Molecular pathogen testing rutin (PCT untuk de-eskalasi jika sudah ada stewardship program)
        </InfoBox>
      </CalcCard>
    </div>
  );
}
