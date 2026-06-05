"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function AKIStagingCalc() {
  const [baselineCr, setBaselineCr] = useState(0.5);
  const [currentCr, setCurrentCr] = useState(1.5);
  const [weight, setWeight] = useState(20);
  const [uo6h, setUo6h] = useState(40);
  const [uo24h, setUo24h] = useState(200);
  const [bun, setBun] = useState(40);

  const crRatio = baselineCr > 0 ? currentCr / baselineCr : 1;
  const deltaCr = currentCr - baselineCr;

  const uoRate6 = weight > 0 ? uo6h / (6 * weight) : 0;
  const uoRate24 = weight > 0 ? uo24h / (24 * weight) : 0;

  let stageCr = 0;
  if (deltaCr >= 0.3 || crRatio >= 1.5) stageCr = 1;
  if (crRatio >= 2) stageCr = 2;
  if (crRatio >= 3 || currentCr > 3.5) stageCr = 3;

  let stageUO = 0;
  if (uoRate6 < 0.5) stageUO = 1;
  if (uoRate24 < 0.5 && uo24h / weight < 0.5 * 24) stageUO = 2;
  if (uo24h === 0) stageUO = 3;

  const stageFinal = Math.max(stageCr, stageUO);
  const bunCrRatio = currentCr > 0 ? bun / currentCr : 0;
  const bunCrInterp = bunCrRatio > 20 ? "Pre-renal" : "Intrinsik/Post-renal";

  const stageColor = (s: number) =>
    s === 0 ? "text-green-400" :
    s === 1 ? "text-yellow-400" :
    s === 2 ? "text-orange-400" : "text-red-500";

  const stageLabel = (s: number) =>
    s === 0 ? "Tidak Ada" : `Stage ${s}`;

  return (
    <CalcCard title="AKI Staging (KDIGO Pediatrik)" icon="🔬" color="red">
      <div className="space-y-3">
        <InfoBox>
          <strong>KDIGO AKI:</strong> ↑Cr ≥0.3 mg/dL dalam 48j, ATAU ↑Cr ≥1.5× baseline dalam 7 hari, ATAU UO &lt;0.5 mL/kg/jam ≥6 jam.
        </InfoBox>

        <div className="grid grid-cols-3 gap-3">
          <CalcInput label="Baseline Cr (mg/dL)" unit="mg/dL" value={baselineCr} onChange={(v) => setBaselineCr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.1} step={0.01} />
          <CalcInput label="Current Cr (mg/dL)" unit="mg/dL" value={currentCr} onChange={(v) => setCurrentCr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0.1} step={0.01} />
          <CalcInput label="BB (kg)" unit="kg" value={weight} onChange={(v) => setWeight(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} step={0.5} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <CalcInput label="UO 6 jam (mL)" unit="mL" value={uo6h} onChange={(v) => setUo6h(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} step={1} />
          <CalcInput label="UO 24 jam (mL)" unit="mL" value={uo24h} onChange={(v) => setUo24h(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} step={1} />
          <CalcInput label="BUN (mg/dL)" unit="mg/dL" value={bun} onChange={(v) => setBun(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} step={1} />
        </div>

        <CalcResult color="red">
          <ResultGrid cols={2}>
            <ResultItem label="Cr Ratio" value={`${crRatio.toFixed(1)}×`} />
            <ResultItem label="Stage AKI (Cr)" value={stageLabel(stageCr)} className={stageColor(stageCr)} />
          </ResultGrid>
          <ResultGrid cols={2}>
            <ResultItem label="UO Rate (mL/kg/jam)" value={`${uoRate6.toFixed(2)}`} note="6 jam" />
            <ResultItem label="Stage AKI (UO)" value={stageLabel(stageUO)} className={stageColor(stageUO)} />
          </ResultGrid>
          <ResultGrid cols={2}>
            <ResultItem label="BUN/Cr Ratio" value={bunCrRatio.toFixed(1)} note={`${bunCrInterp} (>20 pre-renal, <20 intrinsik)`} />
            <ResultItem label="Stage AKI Final (Max)" value={stageFinal > 0 ? `Stage ${stageFinal}` : "Tidak Ada AKI"} className={stageColor(stageFinal)} />
          </ResultGrid>
        </CalcResult>

        {stageFinal === 0 && (
          <InfoBox>
            🟢 Tidak memenuhi kriteria AKI KDIGO. BUN/Cr ratio: {bunCrRatio.toFixed(1)} — Sugestif {bunCrInterp}.
          </InfoBox>
        )}

        {stageFinal === 1 && (
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-sm">
            <strong className="text-yellow-400">🟡 AKI Stage 1 — Rekomendasi:</strong>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>• Optimasi volume status (fluid challenge bila pre-renal)</li>
              <li>• Evaluasi & hentikan obat nefrotoksik</li>
              <li>• Monitoring ketat: UO dan Cr tiap 4–6 jam</li>
              <li>• Hindari kontras nefrotoksik</li>
              <li>• Konsultasi nefrologi bila tidak membaik</li>
            </ul>
          </div>
        )}

        {stageFinal === 2 && (
          <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3 text-sm">
            <strong className="text-orange-400">🔴 AKI Stage 2 — Rekomendasi:</strong>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>• Konsultasi nefrologi pediatric</li>
              <li>• Cegah & manage fluid overload</li>
              <li>• Evaluasi indikasi dialisis</li>
              <li>• Monitor elektrolit, asam-basa tiap 4–6 jam</li>
              <li>• Nutrisi adekuat (protein 1–1.5 g/kg/hari)</li>
              <li>• Hindari nephrotoxins</li>
            </ul>
          </div>
        )}

        {stageFinal === 3 && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm">
            <strong className="text-red-500">⛔ AKI Stage 3 — Rekomendasi:</strong>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>• <span className="text-red-400 font-bold">Indikasi kuat RRT/Dialisis:</span></li>
              <li>  — Anuria &gt;12 jam</li>
              <li>  — Asidosis metabolik refrakter (pH &lt;7.1)</li>
              <li>  — Hiperkalemia refrakter (K &gt;6.5)</li>
              <li>  — Fluid overload berat (FO &gt;20%)</li>
              <li>  — Uremia simtomatik (ensefalopati, perikarditis)</li>
              <li>• <span className="text-red-400 font-bold">Konsul nefrologi SEGERA</span></li>
              <li>• CRRT atau PD/HD sesuai kondisi</li>
              <li>• Monitoring di ICU</li>
            </ul>
          </div>
        )}
      </div>
    </CalcCard>
  );
}
