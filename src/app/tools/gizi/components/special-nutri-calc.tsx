"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, InfoBox } from "../../components/calc-ui";

const condOptions = [
  { value: "chd", label: "Penyakit Jantung Bawaan (CHD)" },
  { value: "cf", label: "Fibrosis Kistik (CF)" },
  { value: "ibd", label: "IBD / Kolitis Ulseratif" },
  { value: "ckd-child", label: "CKD Pediatrik" },
  { value: "cancer", label: "Onkologi / Kemoterapi" },
  { value: "cp", label: "Cerebral Palsy" },
  { value: "liver", label: "Penyakit Hati Kronik" },
  { value: "short-bowel", label: "Short Bowel Syndrome" },
];

export function SpecialNutriCalc() {
  const [weight, setWeight] = useState(15);
  const [cond, setCond] = useState("chd");

  const w = weight;
  const recs: Record<string, string> = {
    chd: `PJB — Penyakit Jantung Bawaan:\n\nKalori: ${Math.round(150 * w)}-${Math.round(200 * w)} kkal/hari (140-200% kebutuhan normal)\nRestriksi cairan: 100-120 mL/kgBB/hari (bila gagal jantung)\nFormula kalori tinggi: 1-1.5 kkal/mL\nSuplemen MCT oil, modular protein bila perlu\nPantau: BB harian, diuresis, edema, hepatomegali`,
    cf: `Fibrosis Kistik (CF):\n\nKalori: ${Math.round(130 * w)}-${Math.round(150 * w)} kkal/hari (120-150% kebutuhan)\nProtein: ${Math.round(3 * w * 10) / 10}-${Math.round(4 * w * 10) / 10} g/hari (3-4 g/kgBB)\nSodium suplemen (hiperhidrosis via keringat)\nPERT (Pancreatic Enzyme Replacement Therapy) WAJIB bersama makan\nVit ADEK larut lemak dosis tinggi`,
    ibd: `IBD / Kolitis Ulseratif:\n\nKalori: ${Math.round(120 * w)}-${Math.round(140 * w)} kkal/hari (flare: lebih tinggi)\nEEN (Exclusive Enteral Nutrition) efektif untuk remisi CD pada anak (80% berhasil!)\nFormula: polymeric (Modulen IBD, Peptamen) 6-8 minggu\nHindari serat tak larut saat flare. Rendah laktosa bila intoleransi`,
    "ckd-child": `CKD Pediatrik:\n\nKalori: sesuai AKG normal (jaga pertumbuhan)\nProtein: TIDAK dibatasi bila pre-dialisis (kontroversi) → ${Math.round(1.1 * w * 10) / 10}-${Math.round(1.5 * w * 10) / 10} g/hari\nFosfat: restriksi makanan tinggi fosfat (fosfor additive!)\nKalium: restriksi bila hiperkalemia\nVit D aktif (Kalsitriol), Ca suplemen, Eritropoietin`,
    cancer: `Onkologi / Kemoterapi:\n\nKalori: ${Math.round(120 * w)}-${Math.round(150 * w)} kkal/hari (130-150% kebutuhan)\nProtein: ${Math.round(2 * w * 10) / 10}-${Math.round(3 * w * 10) / 10} g/hari (2-3 g/kgBB)\nTPN bila asupan oral <50% target >3-5 hari\nHindari suplemen antioksidan dosis tinggi saat kemo (interfere dengan terapi)`,
    cp: `Cerebral Palsy:\n\nKalori: ${Math.round(70 * w)}-${Math.round(90 * w)} kkal/hari (60-80% anak normal — aktivitas lebih rendah)\nProtein: ${Math.round(1.5 * w * 10) / 10}-${Math.round(2 * w * 10) / 10} g/hari\nPertimbangkan feeding tube (gastrostomi) bila asupan oral tidak aman\nKalsium dan Vit D tinggi (kepadatan tulang rendah)`,
    liver: `Penyakit Hati Kronik:\n\nKalori: ${Math.round(120 * w)}-${Math.round(140 * w)} kkal/hari (malabsorpsi lemak!)\nProtein: TIDAK dibatasi (kecuali ensefalopati hepatik aktif): ${Math.round(1.5 * w * 10) / 10}-${Math.round(2 * w * 10) / 10} g/hari\nVit ADEK dosis tinggi (suplemen larut lemak + air)\nMCT oil (Medium Chain Triglyceride) untuk suplemen kalori lemak`,
    "short-bowel": `Short Bowel Syndrome:\n\nTPN jangka panjang fase awal. Enteral trofik SEGERA dimulai\nKalori: ${Math.round(150 * w)}-${Math.round(200 * w)} kkal/hari (oral/EN agresif)\nFormula: elemental/semielemental lebih mudah diserap\nB12 parenteral bila ileum terminal terpotong >60 cm\nGlutamin suplemen untuk adaptasi intestinal`,
  };

  return (
    <CalcCard title="Nutrisi Kondisi Khusus" subtitle="Panduan per penyakit" icon="🩺" color="purple">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <CalcInput label="BB (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} step={0.1} />
          <CalcSelect label="Kondisi" value={cond} onChange={setCond} options={condOptions} />
        </div>
        <CalcResult color="purple">
          <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed">{recs[cond]}</pre>
        </CalcResult>
      </div>
    </CalcCard>
  );
}
