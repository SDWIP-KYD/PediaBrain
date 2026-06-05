"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { giziSubtabs, getGiziCalculatorsForSubtab } from "./calculator-registry";
import { BMICalc } from "./components/bmi-calc";
import { WeightAgeCalc } from "./components/weight-age";
import { HeightAgeCalc } from "./components/height-age";
import { WeightHeightCalc } from "./components/weight-height";
import { CalorieCalc } from "./components/calorie-calc";
import { ProteinReqCalc } from "./components/protein-req";
import { REECalc } from "./components/ree-calc";
import { StressFactorCalc } from "./components/stress-factor";
import { VitaminCalc } from "./components/vitamin-calc";
import { MineralCalc } from "./components/mineral-calc";
import { IronCalc } from "./components/iron-calc";
import { EnteralCalc } from "./components/enteral-calc";
import { TPNGiziCalc } from "./components/tpn-gizi";
import { BreastfeedCalc } from "./components/breastfeed-calc";
import { MalnutriScreen } from "./components/malnutri-screen";
import { RefeedingRisk } from "./components/refeeding-risk";

const calcComponents: Record<string, React.FC> = {
  "bmi-calc": BMICalc,
  "weight-age": WeightAgeCalc,
  "height-age": HeightAgeCalc,
  "weight-height": WeightHeightCalc,
  "calorie-calc": CalorieCalc,
  "protein-req": ProteinReqCalc,
  "ree-calc": REECalc,
  "stress-factor": StressFactorCalc,
  "vitamin-calc": VitaminCalc,
  "mineral-calc": MineralCalc,
  "iron-calc": IronCalc,
  "enteral-calc": EnteralCalc,
  "tpn-gizi": TPNGiziCalc,
  "breastfeed-calc": BreastfeedCalc,
  "malnutri-screen": MalnutriScreen,
  "refeeding-risk": RefeedingRisk,
};

const subtabIcons: Record<string, string> = {
  "Antropometri": "📏",
  "Kalori & Protein": "🔥",
  "Mikronutrien": "💊",
  "Feeding": "🍼",
  "Assessment": "📉",
};

export function GiziClient() {
  const [activeTab, setActiveTab] = useState<string>(giziSubtabs[0]);
  const calcs = getGiziCalculatorsForSubtab(activeTab);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 min-w-max pb-1">
          {giziSubtabs.map((tab) => (
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
