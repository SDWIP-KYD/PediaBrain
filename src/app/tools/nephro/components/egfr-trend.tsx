"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcButton, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

interface GFRPoint {
  date: string;
  gfr: number;
}

export function EGFRTrendCalc() {
  const [points, setPoints] = useState<GFRPoint[]>([
    { date: new Date().toISOString().split("T")[0], gfr: 90 },
  ]);
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newGFR, setNewGFR] = useState(90);

  const add = () => {
    setPoints([...points, { date: newDate, gfr: newGFR }]);
  };

  const trend = points.length >= 2 ? points[points.length - 1].gfr - points[0].gfr : 0;
  const avgDecline = points.length >= 2 ? trend / (points.length - 1) : 0;
  const prognosis =
    trend > -5 ? "Stabil" :
    trend > -15 ? "Decline ringan" :
    trend > -30 ? "Decline sedang" : "Decline berat";

  return (
    <CalcCard title="eGFR Trend Tracker" icon="📈">
      <div className="space-y-3">
        {points.map((p, i) => (
          <div key={i} className="flex gap-2 text-sm">
            <span className="text-muted-foreground w-24">{p.date}</span>
            <span className="font-mono">{p.gfr}</span>
            <span className="text-muted-foreground">mL/min/1.73m²</span>
          </div>
        ))}
        <div className="flex gap-2 items-end">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Date</label>
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full rounded border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <CalcInput label="GFR" value={newGFR} onChange={(v) => setNewGFR(typeof v === "string" ? parseFloat(v) || 0 : v)} min={0} />
          <CalcButton onClick={add} color="cyan">
            + Add
          </CalcButton>
        </div>
        {points.length >= 2 && (
          <CalcResult>
            <ResultGrid cols={2}>
              <ResultItem label="Total Change" value={`${trend > 0 ? "+" : ""}${Math.round(trend)} mL/min`} />
              <ResultItem label="Prognosis" value={prognosis} />
              <ResultItem label="Points Tracked" value={`${points.length}`} />
              <ResultItem label="Avg Change/Point" value={`${Math.round(avgDecline)} mL/min`} />
            </ResultGrid>
          </CalcResult>
        )}
        <InfoBox>
          KDIGO: Anak dengan GFR &lt;60 harus dimonitor tiap 3 bulan. Decline &gt;-5 mL/min/tahun mengindikasikan progresi.
        </InfoBox>
      </div>
    </CalcCard>
  );
}
