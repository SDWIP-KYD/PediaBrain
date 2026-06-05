"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function DiuretikDosisCalc() {
  const [w, setW] = useState(20);
  const [gfr, setGfr] = useState(80);

  const r2 = (n: number) => Math.round(n * 100) / 100;
  const r1 = (n: number) => Math.round(n * 10) / 10;
  const furosOral = r2(1 * w);
  const furosIV = r2(0.5 * w);
  const spiro = r2(1.5 * w);
  const hctz = r2(1 * w);

  return (
    <CalcCard title="Diuretik — Dosis" subtitle="Furosemid, Spironolakton, HCTZ" icon="🫧" color="purple">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <CalcInput label="BB (kg)" unit="kg" value={w} onChange={(v) => setW(typeof v === "string" ? parseFloat(v) || 0 : v)} min={1} />
          <CalcInput label="eGFR (mL/mnt/1.73m²)" value={gfr} onChange={(v) => setGfr(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
        </div>
        <CalcResult color="purple">
          <div className="space-y-2 text-xs leading-relaxed">
            <p className="font-semibold text-foreground">Dosis Diuretik untuk BB {w} kg:</p>
            <ResultGrid cols={2}>
              <ResultItem label="Furosemid oral" value={`${furosOral} mg`} unit="1–4 mg/kg q12–24h" />
              <ResultItem label="Furosemid IV" value={`${furosIV} mg`} unit="0.5–2 mg/kg q6–12h" />
              <ResultItem label="Spironolakton" value={`${spiro} mg`} unit="1–3.3 mg/kg q12h" />
              <ResultItem label="HCTZ" value={`${hctz} mg`} unit="1–3 mg/kg q12h" />
            </ResultGrid>
            {gfr < 30 && (
              <InfoBox>⚠️ GFR &lt;30: Furosemid dosis tinggi mungkin diperlukan. Spironolakton dan HCTZ kurang efektif + risiko hiperkalemia. Hindari kombinasi ACEI+Spironolakton.</InfoBox>
            )}
            {gfr < 10 && (
              <InfoBox>⛔ GFR &lt;10: Furosemid boleh, spironolakton KONTRAINDIKASI (hiperkalemia). Pertimbangkan dialisis untuk overload.</InfoBox>
            )}
          </div>
        </CalcResult>
      </div>
    </CalcCard>
  );
}
