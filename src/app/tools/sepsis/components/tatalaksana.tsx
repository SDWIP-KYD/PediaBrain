"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, InfoBox, ResultAlert } from "../../components/calc-ui";

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

const hour1Items: ChecklistItem[] = [
  { id: "h1-lactate", label: "Ukur laktat darah", done: false },
  { id: "h1-culture", label: "Ambil kultur darah (2 set) sebelum antibiotik", done: false },
  { id: "h1-abx", label: "Mulai antibiotik spektrum luas IV (dalam 1 jam untuk shock)", done: false },
  { id: "h1-fluid", label: "Resusitasi cairan 10–20 mL/kg bolus (jika hipotensi)", done: false },
  { id: "h1-vaso", label: "Mulai vasoaktif jika MAP < persentil 5 setelah cairan", done: false },
  { id: "h1-source", label: "Source control sesegera mungkin", done: false },
];

const hour3Items: ChecklistItem[] = [
  { id: "h3-reassess", label: "Reassess responsivitas cairan", done: false },
  { id: "h3-abx-eval", label: "Evaluasi kebutuhan antibiotik (probable sepsis tanpa shock)", done: false },
  { id: "h3-lactate", label: "Ulangi laktat jika awalnya tinggi", done: false },
];

const fluidData = [
  { setting: "Dengan ICU", condition: "Septic shock", recommendation: "10–20 mL/kg/bolus, max 40–60 mL/kg dalam 1 jam" },
  { setting: "Tanpa ICU", condition: "Sepsis tanpa hipotensi", recommendation: "❌ Hindari bolus; mulai maintenance saja (Rekomendasi KUAT)" },
  { setting: "Tanpa ICU", condition: "Septic shock + hipotensi", recommendation: "Bolus 10–20 mL/kg, max 40 mL/kg" },
];

const vasoactiveData = [
  { situation: "Lini pertama", recommendation: "Epinefrin ATAU Norepinefrin (bukti seimbang)" },
  { situation: "Katekol dosis tinggi", recommendation: "Tambahkan Vasopressin" },
  { situation: "Disfungsi jantung", recommendation: "Pertimbangkan inodilator (bukti belum cukup)" },
  { situation: "Hipoperfusi refrakter", recommendation: "Angiotensin II / Methylene blue: bukti tidak cukup" },
];

const ventilationData = [
  { aspect: "Etomidate", recommendation: "❌ Hindari saat intubasi" },
  { aspect: "Target SpO₂", recommendation: "88–92% (konservatif) — bukan >94%" },
  { aspect: "Intubasi tanpa gagal napas", recommendation: "Bukti tidak cukup (pada fluid-refractory shock)" },
];

const notRecommended = [
  { intervention: "Vitamin C (ascorbic acid)", recommendation: "❌ Tidak disarankan rutin" },
  { intervention: "Thiamine (Vitamin B1)", recommendation: "❌ Tidak disarankan rutin" },
  { intervention: "Vitamin D (tanpa defisiensi)", recommendation: "❌ Tidak disarankan" },
  { intervention: "IVIG rutin", recommendation: "❌ Tidak disarankan (kecuali defisiensi humoral)" },
  { intervention: "Levothyroxine (sick euthyroid)", recommendation: "❌ Tidak disarankan" },
  { intervention: "High-volume hemofiltration", recommendation: "⚠️ Disarankan jika RRT diperlukan (>35 mL/kg/jam)" },
];

function toggleItem(items: ChecklistItem[], id: string): ChecklistItem[] {
  return items.map((item) =>
    item.id === id ? { ...item, done: !item.done } : item
  );
}

export function SepsisTatalaksana() {
  const { weightGram, ageYears } = usePatient();
  const weightKg = weightGram / 1000;

  const [fluidVolume, setFluidVolume] = useState(20);
  const [vasoagent, setVasoagent] = useState("epinefrin");
  const [doseRate, setDoseRate] = useState(0.05);
  const [hour1, setHour1] = useState(hour1Items);
  const [hour3, setHour3] = useState(hour3Items);

  const h1Done = hour1.filter((i) => i.done).length;
  const h3Done = hour3.filter((i) => i.done).length;
  const totalItems = hour1.length + hour3.length;
  const totalDone = h1Done + h3Done;
  const compliance = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  const fluidDose = fluidVolume * weightKg;

  const vasoDoseMCG = vasoagent === "vasopressin"
    ? 0.04
    : doseRate * weightKg * 60;

  const renderChecklist = (
    items: ChecklistItem[],
    setter: (items: ChecklistItem[]) => void,
    sectionTitle: string,
    sectionColor: string
  ) => (
    <div className="space-y-2">
      <p className={`text-xs font-semibold ${sectionColor}`}>{sectionTitle}</p>
      {items.map((item) => (
        <label
          key={item.id}
          className="flex items-start gap-2 text-[11px] text-muted-foreground cursor-pointer group"
        >
          <input
            type="checkbox"
            checked={item.done}
            onChange={() => setter(toggleItem(items, item.id))}
            className="accent-neon mt-0.5 shrink-0"
          />
          <span className={item.done ? "line-through text-foreground/60" : ""}>
            {item.label}
          </span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      <CalcCard title="Tatalaksana" subtitle="Resusitasi, antibiotik, vasoaktif, ventilasi — SSC 2026" icon="💊" color="green">
        <InfoBox>
          <strong>🚨 Prinsip Utama — "Sepsis Bundles"</strong>
          <br />
          1. Kenali segera, ukur <strong>laktat</strong>
          <br />
          2. Ambil <strong>kultur darah</strong>
          <br />
          3. Mulai <strong>antibiotik</strong> (1 jam untuk shock, 3 jam untuk probable sepsis)
          <br />
          4. Resusitasi <strong>cairan</strong> bertahap
          <br />
          5. Mulai <strong>vasoaktif</strong> jika diperlukan
          <br />
          6. <strong>Source control</strong> sesegera mungkin
        </InfoBox>
      </CalcCard>

      <CalcCard title="Antimikroba — Timeline" icon="⏱" color="orange">
        <div className="space-y-3">
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-red-400 mb-1">⏱ Dalam 1 Jam</p>
            <p className="text-xs"><strong>Septic shock</strong> → mulai antibiotik segera (rekomendasi KUAT)</p>
          </div>
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-yellow-400 mb-1">⏱ Dalam 3 Jam</p>
            <p className="text-xs"><strong>Probable sepsis tanpa shock</strong> → evaluasi cepat, lalu antibiotik jika terkonfirmasi</p>
          </div>
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-green-400 mb-1">Pilihan Regimen</p>
            <p className="text-xs">Empiris <strong>broad-spectrum</strong>; imunokompromais/MDR risk → multidrug. De-eskalasi setelah hasil kultur</p>
          </div>
        </div>
      </CalcCard>

      <CalcCard title="Resusitasi Cairan — Update 2026" icon="💧" color="blue">
        <CalcResult>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-semibold">Setting</th>
                  <th className="text-left py-2 pr-3 font-semibold">Kondisi</th>
                  <th className="text-left py-2 font-semibold">Rekomendasi</th>
                </tr>
              </thead>
              <tbody>
                {fluidData.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.setting}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{row.condition}</td>
                    <td className="py-2">{row.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcResult>

        <div className="grid grid-cols-2 gap-3">
          <CalcInput
            label="Volume Bolus (mL/kg)"
            unit="mL/kg"
            value={fluidVolume}
            onChange={(v) => setFluidVolume(typeof v === "string" ? parseFloat(v) || 0 : v)}
            min={0}
            max={60}
          />
          <CalcResult color="blue">
            <ResultItem label="Dosis Total" value={`${fluidDose.toFixed(0)} mL`} />
          </CalcResult>
        </div>

        <ResultAlert type="success">
          ✅ Reassess setelah setiap bolus — hentikan jika syok teratasi atau ada tanda fluid overload
          <br />
          ✅ Pilih balanced/buffered crystalloid (misal: Ringer Laktat) dibanding NaCl 0,9%
          <br />
          ✅ Kristaloid lebih disarankan dari albumin untuk resusitasi awal
        </ResultAlert>
      </CalcCard>

      <CalcCard title="Vasoaktif" icon="💉" color="purple">
        <InfoBox>
          ✅ Mulai vasoaktif melalui <strong>akses vena perifer</strong> — jangan tunda menunggu akses sentral
        </InfoBox>

        <CalcResult color="purple">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-semibold">Situasi</th>
                  <th className="text-left py-2 font-semibold">Rekomendasi</th>
                </tr>
              </thead>
              <tbody>
                {vasoactiveData.map((row) => (
                  <tr key={row.situation} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.situation}</td>
                    <td className="py-2">{row.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcResult>

        <div className="grid grid-cols-2 gap-3">
          <CalcSelect
            label="Vasoaktif"
            value={vasoagent}
            onChange={setVasoagent}
            options={[
              { value: "epinefrin", label: "Epinefrin" },
              { value: "norepinefrin", label: "Norepinefrin" },
              { value: "vasopressin", label: "Vasopressin" },
            ]}
          />
          <CalcInput
            label="Dosis (mcg/kg/menit)"
            unit="mcg/kg/menit"
            value={vasoagent === "vasopressin" ? 0.04 : doseRate}
            onChange={(v) => setDoseRate(typeof v === "string" ? parseFloat(v) || 0 : v)}
            min={0}
            step={0.01}
            disabled={vasoagent === "vasopressin"}
          />
        </div>

        <InfoBox>
          Target: MAP ≥ persentil 5 sesuai usia. Target ScvO₂ ≥ 70% jika akses vena sentral tersedia.
        </InfoBox>
      </CalcCard>

      <CalcCard title="Ventilasi" icon="🫁" color="teal">
        <CalcResult>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-semibold">Aspek</th>
                  <th className="text-left py-2 font-semibold">Rekomendasi</th>
                </tr>
              </thead>
              <tbody>
                {ventilationData.map((row) => (
                  <tr key={row.aspect} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.aspect}</td>
                    <td className="py-2">{row.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcResult>
      </CalcCard>

      <CalcCard title="Kortikosteroid" icon="💊" color="yellow">
        <InfoBox>
          <strong>Steroid Protocol:</strong>
          <br />
          • Hemodinamik stabil dengan cairan + vasoaktif: <strong>❌ tidak disarankan hidrokortison rutin</strong>
          <br />
          • Tetap tidak stabil meski terapi adekuat: bukti tidak cukup (pertimbangkan kasus per kasus)
          <br />
          • <strong>✅ Wajib</strong> diberikan jika curiga/terbukti <strong>insufisiensi adrenal</strong>
        </InfoBox>
      </CalcCard>

      <CalcCard title="Tidak Direkomendasikan (Baru 2026)" icon="❌" color="red">
        <CalcResult color="red">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-semibold">Intervensi</th>
                  <th className="text-left py-2 font-semibold">Rekomendasi</th>
                </tr>
              </thead>
              <tbody>
                {notRecommended.map((row) => (
                  <tr key={row.intervention} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.intervention}</td>
                    <td className="py-2">{row.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcResult>
      </CalcCard>

      <CalcCard title="Source Control" icon="🆕" color="green">
        <InfoBox>
          <strong>🆕 Source Control</strong>
          <br />
          • Source control dilakukan <strong>sesegera mungkin</strong> setelah diagnosis
          <br />
          • Cabut akses intravaskular yang menjadi sumber infeksi <strong>setelah</strong> akses lain tersedia
        </InfoBox>
      </CalcCard>

      <CalcCard title="Bundle Compliance Tracker" icon="📋" color="green">
        <CalcResult color="green">
          <ResultGrid cols={2}>
            <ResultItem label="Compliance" value={`${compliance}%`} />
            <ResultItem label="Items Done" value={`${totalDone}/${totalItems}`} />
          </ResultGrid>
        </CalcResult>

        {renderChecklist(hour1, setHour1, "Hour-1 Bundle", "text-red-400")}
        {renderChecklist(hour3, setHour3, "Hour-3 Bundle", "text-yellow-400")}
      </CalcCard>
    </div>
  );
}
