"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, CalcButton, InfoBox, ResultGrid, ResultItem } from "../../components/calc-ui";

const systems = [
  { id: "heent", name: "HEENT", items: ["Head shape/sutures", "Anterior fontanelle", "Eyes (red reflex, PERRLA)", "Ears (tympanic membrane)", "Nose (patency, discharge)", "Mouth (pharynx, tonsils, mucosa)"] },
  { id: "cvs", name: "Kardiovaskular", items: ["Heart rate & rhythm", "Heart murmur (grade, location)", "Capillary refill", "Pulses (brachial, femoral)", "Peripheral edema", "BP (lengan atas)"] },
  { id: "rs", name: "Respirasi", items: ["Respiratory rate", "Breath sounds (bilateral)", "Wheezing / crackles", "Retraction (intercostal, subcostal, suprasternal)", "Oxygen saturation", "Cyanosis"] },
  { id: "abd", name: "Abdomen", items: ["Inspection (distension, hernia)", "Auscultation (bowel sounds)", "Palpation (tender, hepatosplenomegaly)", "Umbilicus"] },
  { id: "ext", name: "Extremitas", items: ["Range of motion", "Muscle tone", "Muscle strength", "Clubbing", "Joint swelling"] },
  { id: "neuro", name: "Neurologi", items: ["Mental status / consciousness", "Cranial nerves", "Deep tendon reflexes", "Motor function", "Sensory function", "Meningeal signs"] },
  { id: "skin", name: "Kulit", items: ["Color (jaundice, pallor, cyanosis)", "Rashes / lesions", "Turgor", "Petechiae / ecchymosis"] },
  { id: "gs", name: "Genitourinari", items: ["External genitalia", "Hydrocele / hernia", "Umbilical cord"] },
];

export function PemeriksaanFisikAnak() {
  const { ageMonths, weightGram, sex, heightCm } = usePatient();
  const [patientName, setPatientName] = useState("");
  const [vitalSigns, setVitalSigns] = useState("");
  const [generalExam, setGeneralExam] = useState("");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const ageYr = Math.floor(ageMonths / 12);
  const ageMo = ageMonths % 12;
  const ageStr = ageYr > 0 ? `${ageYr} thn ${ageMo} bln` : `${ageMo} bln`;
  const weightKg = (weightGram / 1000).toFixed(1);
  const sexStr = sex === "L" ? "Laki-laki" : "Perempuan";

  const toggleItem = (systemId: string, item: string) => {
    const key = `${systemId}-${item}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalItems = systems.reduce((sum, s) => sum + s.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  let output = `PEMERIKSAAN FISIK ANAK
=======================
Nama: ${patientName || "..."}
Usia: ${ageStr} | JK: ${sexStr} | BB: ${weightKg} kg | TB: ${heightCm} cm

VITAL SIGNS:
${vitalSigns || "..."}

STATUS GENERALIS:
${generalExam || "..."}`;

  for (const system of systems) {
    const checkedInSystem = system.items.filter((item) => checkedItems[`${system.id}-${item}`]);
    if (checkedInSystem.length > 0 || notes[system.id]) {
      output += `\n\n${system.name.toUpperCase()}:`;
      for (const item of system.items) {
        if (checkedItems[`${system.id}-${item}`]) {
          output += `\n  ✓ ${item}`;
        }
      }
      if (notes[system.id]) {
        output += `\n  Catatan: ${notes[system.id]}`;
      }
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <CalcCard title="Pemeriksaan Fisik Anak" icon="🩺" color="teal">
      <div className="space-y-3">
        <CalcInput label="Nama Pasien" type="text" value={patientName} onChange={(v) => setPatientName(typeof v === "string" ? v : String(v))} />
        <InfoBox>Pasien: {ageStr} · {sexStr} · BB {weightKg} kg · TB {heightCm} cm</InfoBox>
        <CalcInput label="Vital Signs" type="text" value={vitalSigns} onChange={(v) => setVitalSigns(typeof v === "string" ? v : String(v))} placeholder="TD, RR, Nadi, Suhu, SpO2" />
        <CalcInput label="Status Generalis" type="text" value={generalExam} onChange={(v) => setGeneralExam(typeof v === "string" ? v : String(v))} placeholder="Aktif, alert, payah..." />

        <InfoBox>Checklist pemeriksaan: {checkedCount}/{totalItems} item</InfoBox>

        {systems.map((system) => (
          <div key={system.id} className="rounded-lg border border-border p-3 space-y-2">
            <p className="text-xs font-semibold text-foreground">{system.name}</p>
            <div className="grid grid-cols-1 gap-1">
              {system.items.map((item) => {
                const key = `${system.id}-${item}`;
                return (
                  <label key={key} className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!checkedItems[key]}
                      onChange={() => toggleItem(system.id, item)}
                      className="rounded border-border accent-neon"
                    />
                    {item}
                  </label>
                );
              })}
            </div>
            <CalcInput label={`Catatan ${system.name}`} type="text" value={notes[system.id] || ""} onChange={(v) => setNotes((prev) => ({ ...prev, [system.id]: typeof v === "string" ? v : String(v) }))} placeholder={`Catatan ${system.name}...`} />
          </div>
        ))}

        <CalcResult>
          <pre className="whitespace-pre-wrap text-xs font-mono text-foreground leading-relaxed">{output}</pre>
        </CalcResult>
        <CalcButton onClick={handleCopy} color="cyan">
          {copied ? "✓ Tersalin!" : "📋 Copy to Clipboard"}
        </CalcButton>
      </div>
    </CalcCard>
  );
}
