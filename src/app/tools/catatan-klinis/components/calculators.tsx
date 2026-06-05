"use client";

import { useState } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function GIRCalc() {
  const { weightGram } = usePatient();
  const [rate, setRate] = useState(0);
  const [conc, setConc] = useState(10);
  const [bb, setBb] = useState(weightGram / 1000);

  const gir = bb > 0 ? (rate * conc) / (6 * bb) : 0;

  return (
    <CalcCard title="GIR (Glucose Infusion Rate)" subtitle="Dari infus IV dextrose" icon="📊" color="blue">
      <InfoBox>Rumus: (kecepatan × %dextrose) ÷ (6 × BB). Target neonatus ≥ 4–6.</InfoBox>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Kecepatan infus" value={rate} onChange={(v) => setRate(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="mL/jam" />
        <CalcInput label="Konsentrasi dextrose" value={conc} onChange={(v) => setConc(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="%" />
      </div>
      <CalcInput label="Berat badan" value={bb} onChange={(v) => setBb(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="kg" />
      <CalcResult color="blue">
        <ResultItem label="GIR" value={gir.toFixed(2)} unit="mg/kgBB/menit" />
      </CalcResult>
    </CalcCard>
  );
}

export function CairanRumatanCalc() {
  const { weightGram } = usePatient();
  const [bb, setBb] = useState(weightGram / 1000);

  let total = 0;
  if (bb <= 10) total = 100 * bb;
  else if (bb <= 20) total = 1000 + 50 * (bb - 10);
  else total = 1500 + 20 * (bb - 20);

  const perJam = total / 24;

  return (
    <CalcCard title="Cairan Rumatan (Holliday-Segar)" subtitle="Metode berat badan 100/50/20" icon="💧" color="cyan">
      <CalcInput label="Berat badan" value={bb} onChange={(v) => setBb(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="kg" />
      <CalcResult color="cyan">
        <ResultItem label="Total 24 jam" value={total.toFixed(0)} unit="mL/24 jam" />
        <ResultItem label="Per jam" value={perJam.toFixed(1)} unit="mL/jam" />
      </CalcResult>
      <InfoBox>≤10kg: 100/kg · 10–20kg: 1000+50/kg · &gt;20kg: 1500+20/kg</InfoBox>
    </CalcCard>
  );
}

export function IWLCalc() {
  const { weightGram } = usePatient();
  const [bb, setBb] = useState(weightGram / 1000);
  const [mod, setMod] = useState("26");
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);

  const iwl = bb * parseFloat(mod);
  const balance = totalIn - totalOut - iwl;
  const perKg = bb > 0 ? balance / bb : 0;
  const status = perKg < -20 ? "⚠ < −20 mL/kg → risiko AKI" : perKg > 20 ? "⚠ > +20 mL/kg → risiko overload" : "Dalam target ±20 mL/kg";

  return (
    <CalcCard title="IWL & Balance Cairan" subtitle="Hitung IWL dan balans 24 jam" icon="⚖️" color="teal">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Berat badan" value={bb} onChange={(v) => setBb(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="kg" />
        <CalcSelect label="Modalitas" value={mod} onChange={setMod} options={[{ value: "26", label: "Inkubator / modalitas (×26)" }, { value: "20", label: "Tanpa modalitas (×20)" }]} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Total masuk" value={totalIn} onChange={(v) => setTotalIn(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="mL" />
        <CalcInput label="Total keluar" value={totalOut} onChange={(v) => setTotalOut(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="mL" />
      </div>
      <CalcResult color="teal">
        <ResultItem label="Balance" value={balance.toFixed(0)} unit="mL" />
        <ResultItem label="IWL" value={iwl.toFixed(0)} unit="mL" />
        <ResultItem label="Per kg" value={perKg.toFixed(1)} unit="mL/kgBB" note={status} />
      </CalcResult>
    </CalcCard>
  );
}

export function BicnatCalc() {
  const { weightGram } = usePatient();
  const [be, setBe] = useState(0);
  const [bb, setBb] = useState(weightGram / 1000);

  const meq = 0.3 * Math.abs(be) * bb;

  return (
    <CalcCard title="Koreksi Bikarbonat" subtitle="Bicnat / Meylon — habis 24 jam" icon="🧪" color="green">
      <InfoBox>Rumus: 0,3 × BE × BB → habis 24 jam. Alt NICU: 0,6 × BB × BE dalam D10%.</InfoBox>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Base Excess (BE)" value={be} onChange={(v) => setBe(typeof v === "string" ? parseFloat(v) || 0 : v)} />
        <CalcInput label="Berat badan" value={bb} onChange={(v) => setBb(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="kg" />
      </div>
      <CalcResult color="green">
        <ResultItem label="Kebutuhan" value={meq.toFixed(2)} unit="mEq" />
      </CalcResult>
    </CalcCard>
  );
}

export function PRCCalc() {
  const { weightGram } = usePatient();
  const [hbNow, setHbNow] = useState(0);
  const [hbTgt, setHbTgt] = useState(11);
  const [bb, setBb] = useState(weightGram / 1000);

  const vol = (hbTgt - hbNow) * 4 * bb;

  return (
    <CalcCard title="Volume Transfusi PRC" subtitle="ΔHb × 4 × BB" icon="🩸" color="red">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Hb saat ini" value={hbNow} onChange={(v) => setHbNow(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="g/dL" />
        <CalcInput label="Hb target" value={hbTgt} onChange={(v) => setHbTgt(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="g/dL" />
      </div>
      <CalcInput label="Berat badan" value={bb} onChange={(v) => setBb(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="kg" />
      <CalcResult color="red">
        <ResultItem label="Volume PRC" value={vol.toFixed(1)} unit="mL" note="Berikan bertahap: Tahap I ±100 mL, Tahap II sisanya." />
      </CalcResult>
    </CalcCard>
  );
}

export function ANCCalc() {
  const [wbc, setWbc] = useState(0);
  const [neu, setNeu] = useState(0);

  const anc = (wbc * neu) / 100;
  const grade = anc > 2000 ? "Normal" : anc >= 1000 ? "Neutropenia ringan" : anc >= 500 ? "Neutropenia sedang" : anc >= 100 ? "Neutropenia berat" : "Sangat berat (profound)";

  return (
    <CalcCard title="Absolute Neutrophil Count" subtitle="Derajat neutropenia" icon="🔬" color="orange">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Leukosit total" value={wbc} onChange={(v) => setWbc(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="/mm³" />
        <CalcInput label="Neutrofil (segmen+batang)" value={neu} onChange={(v) => setNeu(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="%" />
      </div>
      <CalcResult color="orange">
        <ResultItem label="ANC" value={anc.toFixed(0)} unit="/mm³" note={grade} />
      </CalcResult>
    </CalcCard>
  );
}

export function MentzerCalc() {
  const [mcv, setMcv] = useState(0);
  const [rbc, setRbc] = useState(0);

  const idx = rbc > 0 ? mcv / rbc : 0;
  const result = idx > 13 ? "> 13 → cenderung ADB (Defisiensi Besi)" : "< 13 → cenderung Thalasemia / APK";

  return (
    <CalcCard title="Indeks Mentzer" subtitle="Bedakan ADB vs Thalasemia" icon="🧬" color="purple">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="MCV" value={mcv} onChange={(v) => setMcv(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="fL" />
        <CalcInput label="Jumlah eritrosit" value={rbc} onChange={(v) => setRbc(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="juta/µL" />
      </div>
      <CalcResult color="purple">
        <ResultItem label="Indeks Mentzer" value={idx.toFixed(1)} note={result} />
      </CalcResult>
    </CalcCard>
  );
}

export function VasoCalc() {
  const { weightGram } = usePatient();
  const [obat, setObat] = useState("100");
  const [dose, setDose] = useState(0);
  const [bb, setBb] = useState(weightGram / 1000);

  const rate = (dose * bb * 60) / parseFloat(obat);

  return (
    <CalcCard title="Drip Obat Vasoaktif" subtitle="Kecepatan infus mL/jam" icon="💉" color="pink">
      <CalcSelect label="Obat" value={obat} onChange={setObat} options={[
        { value: "100", label: "Epinefrin (÷100)" },
        { value: "80", label: "Norepinefrin (÷80)" },
        { value: "4000", label: "Dopamin (÷4000)" },
        { value: "5000", label: "Dobutamin (÷5000)" },
      ]} />
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Dosis" value={dose} onChange={(v) => setDose(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="mcg/kgBB/menit" />
        <CalcInput label="Berat badan" value={bb} onChange={(v) => setBb(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="kg" />
      </div>
      <CalcResult color="pink">
        <ResultItem label="Rate" value={rate.toFixed(2)} unit="mL/jam" />
      </CalcResult>
      <InfoBox>Rumus: dosis × BB × 60 ÷ faktor pengenceran. Pastikan sediaan/pengenceran sesuai.</InfoBox>
    </CalcCard>
  );
}

export function NikardipinCalc() {
  const { weightGram } = usePatient();
  const [dose, setDose] = useState(2.5);
  const [bb, setBb] = useState(weightGram / 1000);

  const rate = (dose * bb * 50 * 60) / 10000;

  return (
    <CalcCard title="Drip Nikardipin" subtitle="10 mL + 40 mL NaCl 0.9%" icon="💊" color="blue">
      <InfoBox>Pengenceran: 10 mL Nikardipin + 40 mL NaCl 0.9%</InfoBox>
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Dosis" value={dose} onChange={(v) => setDose(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="mcg/kgBB/menit" step={0.5} />
        <CalcInput label="Berat badan" value={bb} onChange={(v) => setBb(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="kg" />
      </div>
      <CalcResult color="blue">
        <ResultItem label="Rate" value={rate.toFixed(2)} unit="mL/jam" />
      </CalcResult>
      <InfoBox>Rumus: dosis × BB × 50 × 60 ÷ 10.000</InfoBox>
    </CalcCard>
  );
}

export function MAPCalc() {
  const [sis, setSis] = useState(0);
  const [dia, setDia] = useState(0);

  const map = (sis + 2 * dia) / 3;

  return (
    <CalcCard title="Mean Arterial Pressure" subtitle="(Sis + 2×Dia) ÷ 3" icon="❤️" color="red">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Sistolik" value={sis} onChange={(v) => setSis(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="mmHg" />
        <CalcInput label="Diastolik" value={dia} onChange={(v) => setDia(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="mmHg" />
      </div>
      <CalcResult color="red">
        <ResultItem label="MAP" value={map.toFixed(0)} unit="mmHg" note="Target: neonatus >40 · anak besar >65." />
      </CalcResult>
    </CalcCard>
  );
}

export function RRCalc() {
  const [pco2, setPco2] = useState(0);
  const [tgt, setTgt] = useState(40);
  const [rr, setRr] = useState(0);

  const newRR = tgt > 0 ? (pco2 / tgt) * rr : 0;

  return (
    <CalcCard title="Koreksi RR Ventilator" subtitle="Sesuaikan RR target PCO₂" icon="🫁" color="teal">
      <div className="grid grid-cols-3 gap-3">
        <CalcInput label="PCO₂ terukur" value={pco2} onChange={(v) => setPco2(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="mmHg" />
        <CalcInput label="PCO₂ target" value={tgt} onChange={(v) => setTgt(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="mmHg" />
        <CalcInput label="RR saat ini" value={rr} onChange={(v) => setRr(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="x/mnt" />
      </div>
      <CalcResult color="teal">
        <ResultItem label="RR baru" value={newRR.toFixed(0)} unit="x/menit" />
      </CalcResult>
      <InfoBox>RR baru = (PCO₂ terukur ÷ target) × RR sekarang.</InfoBox>
    </CalcCard>
  );
}

export function EpiAnafilaksisCalc() {
  const { weightGram } = usePatient();
  const [bb, setBb] = useState(weightGram / 1000);

  const ml = 0.01 * bb;
  const cap = Math.min(ml, 0.5);

  return (
    <CalcCard title="Epinefrin Anafilaksis" subtitle="1:1000 intramuskular" icon="💉" color="red">
      <CalcInput label="Berat badan" value={bb} onChange={(v) => setBb(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="kg" />
      <CalcResult color="red">
        <ResultItem label="Dosis" value={cap.toFixed(2)} unit="mL IM (1:1000)" note="0,01 mL/kgBB (rentang 0,01–0,03). Maks ±0,3–0,5 mL. Ulang tiap 5–15 menit bila perlu." />
      </CalcResult>
    </CalcCard>
  );
}

export function PCTParacetamolCalc() {
  const { weightGram } = usePatient();
  const [bb, setBb] = useState(weightGram / 1000);

  const total = (15 * bb * 4) / 24;
  const rate = total / 10;

  return (
    <CalcCard title="PCT (Parasetamol) Kontinu" subtitle="Infus kontinu mL/jam" icon="💊" color="yellow">
      <CalcInput label="Berat badan" value={bb} onChange={(v) => setBb(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="kg" />
      <CalcResult color="yellow">
        <ResultItem label="Rate" value={rate.toFixed(1)} unit="mL/jam" note={`Total = 15 × ${bb} × 4 ÷ 24 = ${total.toFixed(1)} → ÷10 = mL/jam.`} />
      </CalcResult>
    </CalcCard>
  );
}

export function ETTCalc() {
  const { weightGram } = usePatient();
  const [bb, setBb] = useState(weightGram / 1000);
  const [ga, setGa] = useState(30);

  const size = ga / 10;
  const depth = bb + 6;
  const uvc = 1.5 * bb + 5.5;

  return (
    <CalcCard title="ETT & Kateter Umbilikus" subtitle="Ukuran & kedalaman" icon="🩺" color="green">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="Berat badan" value={bb} onChange={(v) => setBb(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="kg" />
        <CalcInput label="Usia gestasi" value={ga} onChange={(v) => setGa(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="minggu" />
      </div>
      <CalcResult color="green">
        <ResultItem label="ETT" value={`Size ${size.toFixed(1)}`} unit="(ukuran)" />
        <ResultItem label="Kedalaman ETT" value={depth.toFixed(1)} unit="cm" />
        <ResultItem label="Kateter umbilikalis" value={uvc.toFixed(1)} unit="cm" note="Konfirmasi X-ray." />
      </CalcResult>
    </CalcCard>
  );
}
