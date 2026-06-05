"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { picuSubtabs, getPicuCalculatorsForSubtab } from "./calculator-registry";
import { ResusitasiCalc } from "./components/resusitasi-calc";
import { EpinefrinCalc } from "./components/epinefrin-calc";
import { DefibrilasiCalc } from "./components/defibrilasi-calc";
import { AdenosinCalc } from "./components/adenosin-calc";
import { AtropinCalc } from "./components/atropin-calc";
import { RSICalc } from "./components/rsi-calc";
import { ETTPICUCalc } from "./components/ett-picu-calc";
import { VentPICUCalc } from "./components/vent-picu-calc";
import { OIPICUCalc } from "./components/oi-picu-calc";
import { SyokCalc } from "./components/syok-calc";
import { CairanSyokCalc } from "./components/cairan-syok-calc";
import { CardiacOutputCalc } from "./components/cardiac-output-calc";
import { SyringePICUCalc } from "./components/syringe-picu-calc";
import { AntikoagulanCalc } from "./components/antikoagulan-calc";
import { InsulinCalc } from "./components/insulin-calc";
import { SedasiCalc } from "./components/sedasi-calc";
import { FLACCCalc } from "./components/flacc-calc";
import { NMBCalc } from "./components/nmb-calc";
import { PELOD2Calc } from "./components/pelod2-calc";
import { PRISMCalc } from "./components/prism-calc";
import { SepsisScoreCalc } from "./components/sepsis-score-calc";
import { CairanPICUCalc } from "./components/cairan-picu-calc";
import { NutrisiPICUCalc } from "./components/nutrisi-picu-calc";
import { BurnCalc } from "./components/burn-calc";
import { CSFCalc } from "./components/csf-calc";

const calcComponents: Record<string, React.FC> = {
  resusitasi: ResusitasiCalc,
  epinefrin: EpinefrinCalc,
  defibrilasi: DefibrilasiCalc,
  adenosin: AdenosinCalc,
  atropin: AtropinCalc,
  rsi: RSICalc,
  "ett-picu": ETTPICUCalc,
  "vent-picu": VentPICUCalc,
  "oi-picu": OIPICUCalc,
  syok: SyokCalc,
  "cairan-syok": CairanSyokCalc,
  "cardiac-output": CardiacOutputCalc,
  "syringe-picu": SyringePICUCalc,
  antikoagulan: AntikoagulanCalc,
  insulin: InsulinCalc,
  sedasi: SedasiCalc,
  flacc: FLACCCalc,
  nmb: NMBCalc,
  pelod2: PELOD2Calc,
  prism: PRISMCalc,
  "sepsis-score": SepsisScoreCalc,
  "cairan-picu": CairanPICUCalc,
  "nutrisi-picu": NutrisiPICUCalc,
  burn: BurnCalc,
  csf: CSFCalc,
};

const subtabIcons: Record<string, string> = {
  Resusitasi: "🫀",
  Ventilator: "🫁",
  Hemodinamik: "❤️",
  "Infus Obat": "💉",
  Sedasi: "💊",
  Skor: "📊",
  "Cairan & Nutrisi": "💧",
  Lainnya: "🧪",
};

export function PICUClient() {
  const [activeTab, setActiveTab] = useState(picuSubtabs[0]);
  const calcs = getPicuCalculatorsForSubtab(activeTab);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 min-w-max pb-1">
          {picuSubtabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5",
                activeTab === tab
                  ? "bg-neon/10 border-neon/30 text-neon"
                  : "bg-card border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <span>{subtabIcons[tab]}</span>
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {calcs.map((calc) => {
          const Component = calcComponents[calc.id];
          if (!Component) return null;
          return <Component key={calc.id} />;
        })}
      </div>
    </div>
  );
}
