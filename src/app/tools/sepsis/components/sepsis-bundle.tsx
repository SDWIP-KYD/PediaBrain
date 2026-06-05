"use client";

import { useState, useEffect, useRef } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, CalcButton, InfoBox, ResultAlert } from "../../components/calc-ui";

interface BundleItem {
  id: string;
  label: string;
  done: boolean;
  time: string;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function createEmptyItems(ids: string[]): BundleItem[] {
  return ids.map((id) => ({ id, label: "", done: false, time: "" }));
}

const hour1Ids = [
  "blood-cultures",
  "lactate",
  "broad-spectrum-abx",
  "crystalloid-30ml",
  "vasopressors-map65",
];

const hour1Labels: Record<string, string> = {
  "blood-cultures": "Ambil Blood Cultures (sebelum ABX)",
  "lactate": "Laktat Serum (pre- atau post-resusitasi)",
  "broad-spectrum-abx": "Antibiotik Spektrum Luas (IV, dalam 1 jam)",
  "crystalloid-30ml": "Crystalloid 30 mL/kg (jika hipotensi / laktat ≥4)",
  "vasopressors-map65": "Vasopressor jika MAP < 65 mmHg setelah fluida",
};

const hour3Ids = [
  "repeat-lactate",
  "fluid-responsive",
  "vasopressors-hr3",
];

const hour3Labels: Record<string, string> = {
  "repeat-lactate": "Ulangi Laktat (dalam 3 jam)",
  "fluid-responsive": "Assesmen Responsivitas Cairan",
  "vasopressors-hr3": "Vasopressor jika MAP < 65 mmHg ( lanjutan )",
};

const reassessIds = [
  "reassess-6hr",
  "reassess-24hr",
];

const reassessLabels: Record<string, string> = {
  "reassess-6hr": "Reassessment 6 jam: perfusi, cairan, vasopressor",
  "reassess-24hr": "Reassessment 24 jam: de-eskalasi, organ function",
};

export function SepsisBundle() {
  const { weightGram, ageYears } = usePatient();
  const weightKg = weightGram / 1000;
  const [fluidVolume, setFluidVolume] = useState(30);
  const [mapNow, setMapNow] = useState(55);
  const [lactate, setLactate] = useState(4.5);

  const [hour1, setHour1] = useState<BundleItem[]>(
    hour1Ids.map((id) => ({ id, label: hour1Labels[id], done: false, time: "" }))
  );
  const [hour3, setHour3] = useState<BundleItem[]>(
    hour3Ids.map((id) => ({ id, label: hour3Labels[id], done: false, time: "" }))
  );
  const [reassess, setReassess] = useState<BundleItem[]>(
    reassessIds.map((id) => ({ id, label: reassessLabels[id], done: false, time: "" }))
  );

  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime]);

  const toggleItem = (setter: React.Dispatch<React.SetStateAction<BundleItem[]>>, id: string) => {
    setter((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, done: !item.done, time: !item.done ? new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "" }
          : item
      )
    );
  };

  const hour1Done = hour1.filter((i) => i.done).length;
  const hour3Done = hour3.filter((i) => i.done).length;
  const reassessDone = reassess.filter((i) => i.done).length;
  const totalDone = hour1Done + hour3Done + reassessDone;
  const totalItems = hour1.length + hour3.length + reassess.length;
  const compliance = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  const fluidDose = fluidVolume * weightKg;
  const mapOk = mapNow >= 65;
  const lactateHigh = lactate >= 4;

  const riskLevel =
    compliance === 100
      ? { label: "Full Compliance", color: "text-green-400" }
      : compliance >= 70
      ? { label: "Partial Compliance", color: "text-yellow-400" }
      : { label: "Non-Compliant", color: "text-red-400" };

  const renderChecklist = (
    items: BundleItem[],
    setter: React.Dispatch<React.SetStateAction<BundleItem[]>>,
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
            onChange={() => toggleItem(setter, item.id)}
            className="accent-neon mt-0.5 shrink-0"
          />
          <span className={item.done ? "line-through text-foreground/60" : ""}>
            {item.label}
          </span>
          {item.time && (
            <span className="ml-auto text-[10px] text-neon font-mono shrink-0">{item.time}</span>
          )}
        </label>
      ))}
    </div>
  );

  return (
    <CalcCard title="Sepsis Bundle Compliance (SSC 2026)" icon="🦠" color="red">
      <div className="space-y-3">
        <InfoBox>
          Pasien: {ageYears} thn · BB {weightKg.toFixed(1)} kg · Timer: {formatElapsed(elapsed)}
        </InfoBox>

        <div className="grid grid-cols-2 gap-3">
          <CalcInput
            label="MAP Saat Ini (mmHg)"
            unit="mmHg"
            value={mapNow}
            onChange={(v) => setMapNow(typeof v === "string" ? parseFloat(v) || 0 : v)}
            min={0}
          />
          <CalcInput
            label="Laktat (mmol/L)"
            unit="mmol/L"
            value={lactate}
            onChange={(v) => setLactate(typeof v === "string" ? parseFloat(v) || 0 : v)}
            min={0}
            step={0.1}
          />
        </div>

        <CalcInput
          label="Volume Crystalloid (mL/kg)"
          unit="mL/kg"
          value={fluidVolume}
          onChange={(v) => setFluidVolume(typeof v === "string" ? parseFloat(v) || 0 : v)}
          min={0}
        />

        <CalcResult color="red">
          <ResultGrid cols={2}>
            <ResultItem label="Compliance" value={`${compliance}%`} className={riskLevel.color} />
            <ResultItem label="Status" value={riskLevel.label} className={riskLevel.color} />
            <ResultItem label="Dosis Cairan" value={`${fluidDose.toFixed(0)} mL`} />
            <ResultItem label="MAP Target" value={mapOk ? "≥65 ✓" : "<65 ✗"} className={mapOk ? "text-green-400" : "text-red-400"} />
          </ResultGrid>
        </CalcResult>

        {lactateHigh && (
          <ResultAlert type="danger">
            Laktat ≥4 mmol/L — pertimbangkan 30 mL/kg crystalloid bolus dan vasopressor jika hipotensi.
          </ResultAlert>
        )}

        {renderChecklist(hour1, setHour1, "Hour-1 Bundle", "text-red-400")}
        {renderChecklist(hour3, setHour3, "Hour-3 Bundle", "text-orange-400")}
        {renderChecklist(reassess, setReassess, "Reassessment", "text-yellow-400")}

        <InfoBox>
          <strong>qSOFA Reference:</strong> RR ≥22, GCS &lt;15, SBP ≤100. Skor ≥2 = risiko tinggi.
          PRISM-III calculator tersedia di bagian PICU.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
