"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcResult, ResultItem, ResultGrid, InfoBox } from "../../components/calc-ui";

export function MacroDistCalc() {
  const [kcal, setKcal] = useState(1200);
  const [proPct, setProPct] = useState(15);
  const [fatPct, setFatPct] = useState(30);
  const [choPct, setChoPct] = useState(55);

  const total = proPct + fatPct + choPct;
  const proG = Math.round(kcal * proPct / 100 / 4 * 10) / 10;
  const fatG = Math.round(kcal * fatPct / 100 / 9 * 10) / 10;
  const choG = Math.round(kcal * choPct / 100 / 4 * 10) / 10;

  let notes = "";
  if (total !== 100) notes = `Total distribusi ${total}% (seharusnya 100%)`;
  else if (proPct < 8 || proPct > 20) notes = "Protein di luar range normal (8-20%)";
  else if (fatPct < 20 || fatPct > 40) notes = "Lemak di luar range (20-40%)";
  else notes = "Distribusi makronutrien dalam batas rekomendasi";

  return (
    <CalcCard title="Distribusi Makronutrien" subtitle="Karbohidrat, Protein, Lemak — harian" icon="🍽️" color="orange">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <CalcInput label="Energi Total (kcal/hari)" unit="kcal" value={kcal} onChange={(v) => setKcal(typeof v === "string" ? parseFloat(v) || 0 : v)} min={100} step={50} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <CalcInput label="Protein (%)" unit="%" value={proPct} onChange={(v) => setProPct(typeof v === "string" ? parseFloat(v) || 0 : v)} min={5} max={30} />
          <CalcInput label="Lemak (%)" unit="%" value={fatPct} onChange={(v) => setFatPct(typeof v === "string" ? parseFloat(v) || 0 : v)} min={10} max={50} />
          <CalcInput label="KH (%)" unit="%" value={choPct} onChange={(v) => setChoPct(typeof v === "string" ? parseFloat(v) || 0 : v)} min={30} max={70} />
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Distribusi Makronutrien</p>
          <div className="flex h-3.5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${choPct}%` }} />
            <div className="h-full bg-orange-500 transition-all" style={{ width: `${fatPct}%` }} />
            <div className="h-full bg-purple-500 transition-all" style={{ width: `${proPct}%` }} />
          </div>
          <div className="flex gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block" />KH {choPct}%</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-orange-500 rounded-sm inline-block" />Lemak {fatPct}%</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-purple-500 rounded-sm inline-block" />Protein {proPct}%</span>
          </div>
        </div>

        <CalcResult color="orange">
          <ResultGrid cols={3}>
            <ResultItem label="Protein" value={`${proG}`} unit="g/hari" />
            <ResultItem label="Lemak" value={`${fatG}`} unit="g/hari" />
            <ResultItem label="Karbohidrat" value={`${choG}`} unit="g/hari" />
          </ResultGrid>
        </CalcResult>
        <InfoBox>
          {total !== 100 ? `⚠️ ${notes}` : notes === "Distribusi makronutrien dalam batas rekomendasi" ? `✅ ${notes}` : `⚠️ ${notes}`}
        </InfoBox>
      </div>
    </CalcCard>
  );
}
