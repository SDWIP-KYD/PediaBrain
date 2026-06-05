"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function HyperkalemiaCalc() {
  const [k, setK] = useState(6.0);
  const [weight, setWeight] = useState(20);
  const [ph, setPh] = useState(7.4);
  const [ecg, setEcg] = useState("none");
  const [renal, setRenal] = useState("normal");

  const kEff = k + (7.4 - ph) * 0.5;
  const deficit = k < 3.5 ? (3.5 - k) * 0.4 * weight * 3 : null;
  const oralKCl = deficit !== null ? deficit / 2 : null;

  const severity =
    k >= 7 ? { label: "Severe (≥7)", color: "text-red-500" } :
    k >= 6 ? { label: "Moderate (≥6)", color: "text-orange-400" } :
    k >= 5.5 ? { label: "Mild (5.5–6)", color: "text-yellow-400" } :
    k >= 3.5 ? { label: "Normal", color: "text-green-400" } :
    k >= 2.5 ? { label: "Mild Hypo", color: "text-yellow-400" } :
    { label: "Severe Hypo (<2.5)", color: "text-red-500" };

  const ecgChanges = ecg === "peaked" || ecg === "wide" || ecg === "sine";
  const renalImpaired = renal === "impaired" || renal === "esrd";

  const doseCaGluconate = (0.5 * weight).toFixed(0);
  const doseInsulin = (0.1 * weight).toFixed(1);
  const doseD10 = (2 * weight).toFixed(0);
  const salbutamolDose = weight < 25 ? 2.5 : 5;

  return (
    <CalcCard title="Hyperkalemia Management" icon="⚡" color="red">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <CalcInput label="Serum K⁺ (mEq/L)" unit="mEq/L" value={k} onChange={(v) => setK(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} step={0.1} />
          <CalcInput label="BB (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} step={0.5} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CalcInput label="pH Darah" unit="" value={ph} onChange={(v) => setPh(typeof v === "string" ? parseFloat(v) || 0 : v)} min={6.5} max={7.8} step={0.01} />
          <CalcSelect label="Kondisi Ginjal" value={renal} onChange={setRenal} options={[
            { value: "normal", label: "Normal" },
            { value: "impaired", label: "Gangguan Ginjal" },
            { value: "esrd", label: "ESRD / Dialisis" },
          ]} />
        </div>
        <CalcSelect label="ECG Changes" value={ecg} onChange={setEcg} options={[
          { value: "none", label: "Normal" },
          { value: "peaked", label: "Peaked T waves" },
          { value: "wide", label: "Wide QRS" },
          { value: "sine", label: "Sine wave (pre-arrest)" },
        ]} />

        <CalcResult color="red">
          <ResultGrid cols={3}>
            <ResultItem label="Severity" value={severity.label} className={severity.color} />
            <ResultItem label="K Efektif (pH-adj)" value={kEff.toFixed(2)} unit="mEq/L" />
            <ResultItem label="ECG Changes" value={ecgChanges ? "YES" : "No"} className={ecgChanges ? "text-red-500" : "text-green-400"} />
          </ResultGrid>
          <ResultGrid cols={2}>
            <ResultItem label="K Deficit" value={deficit !== null ? `${deficit.toFixed(0)} mEq` : "—"} note={deficit !== null ? "(3.5 - K) × 0.4 × W × 3" : "K ≥3.5"} />
            <ResultItem label="Oral KCl (½ dose)" value={oralKCl !== null ? `${oralKCl.toFixed(0)} mEq` : "—"} note={oralKCl !== null ? "Deficit / 2 mEq" : ""} />
          </ResultGrid>
        </CalcResult>

        {k >= 6 && (
          <div className="rounded-lg border border-border bg-card p-3 text-sm">
            <strong className="text-foreground">Weight-Based Treatment Protocol (BB {weight} kg):</strong>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>• <span className="text-red-400 font-semibold">1. Ca Gluconate 10%:</span> {doseCaGluconate} mL IV pelan (100 mg/kg) — stabilisasi membran {ecgChanges ? "(SEGERA - ECG abnormal!)" : ""}</li>
              <li>• <span className="text-orange-400 font-semibold">2. Insulin Reguler:</span> {doseInsulin} unit + D10 {doseD10} mL IV — shift K intracellular</li>
              <li>• <span className="text-yellow-400 font-semibold">3. Salbutamol Nebulizer:</span> {salbutamolDose} mg nebulizer</li>
              <li>• <span className="text-blue-400 font-semibold">4. NaHCO₃:</span> 1–2 mEq/kg IV bila asidosis</li>
              <li>• <span className="text-purple-400 font-semibold">5. Kayexalate / Patiromer:</span> 1 g/kg PO — eliminasi K</li>
              {renalImpaired && k > 6 && (
                <li>• <span className="text-red-500 font-bold">6. ⛔ DIALISIS — Fungsi ginjal terganggu + K &gt;6. Konsul nefrologi SEGERA.</span></li>
              )}
            </ul>
          </div>
        )}

        {k >= 2.5 && k < 3.5 && (
          <div className="rounded-lg border border-border bg-card p-3 text-sm">
            <strong className="text-foreground">Hypokalemia Treatment (K {k} mEq/L):</strong>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>• <span className="text-yellow-400 font-semibold">Oral KCl:</span> 1–2 mEq/kg/hari dalam dosis terbagi</li>
              {k < 2.5 && (
                <li>• <span className="text-red-400 font-semibold">IV KCl:</span> 0.3–0.5 mEq/kg/jam via CVC (maks 40 mEq/L perifer, 80 mEq/L CVC)</li>
              )}
              <li>• Monitor EKG. Hidrasi adekuat. Cek Mg!</li>
              {deficit !== null && (
                <li>• Defisit K: {deficit.toFixed(0)} mEq — berikan setengah ({oralKCl?.toFixed(0)} mEq) sebagai dosis pertama</li>
              )}
            </ul>
          </div>
        )}

        <InfoBox>
          {k >= 7 ? "EMERGENCY: K⁺ ≥7.0. Berikan calcium gluconate SEGERA. EKG monitor continuous. Pertimbangkan dialisis bila ginjal terganggu." :
           k >= 6 ? `K⁺ ≥6.0. ${ecgChanges ? "ECG ABNORMAL — treatment agresif!" : "Insulin+Dextrose + kalsium gluconate."} Ulang K⁺ dalam 2 jam.${renalImpaired ? " ⚠️ Ginjal terganggu — pertimbangkan dialisis." : ""}` :
           k >= 5.5 ? "K⁺ 5.5-6.0. Monitor EKG. Batasi K diet. Pertimbangkan diuretik atau resin." :
           k >= 3.5 ? "K⁺ dalam batas normal." :
           k >= 2.5 ? "Hipokalemia ringan-sedang. Oral KCl 1-2 mEq/kg/hari." :
           "Hipokalemia BERAT (<2.5). IV KCL via CVC. Monitor EKG continuous. Cek Mg!"}
        </InfoBox>
      </div>
    </CalcCard>
  );
}
