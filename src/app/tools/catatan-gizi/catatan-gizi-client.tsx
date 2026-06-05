"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { catatanGiziSubtabs, getGiziLogCalculatorsForSubtab } from "./calculator-registry";
import { NutriAssessment } from "./components/nutri-assessment";
import { FoodAllergy } from "./components/food-allergy";
import { FeedingEval } from "./components/feeding-eval";
import { IntakeOutput } from "./components/intake-output";
import { GrowthLog } from "./components/growth-log";
import { MicronutrientLog } from "./components/micronutrient-log";
import { DietPlan } from "./components/diet-plan";
import { NutriCarePlan } from "./components/nutri-care-plan";
import { MilkDatabaseCalc } from "./components/milk-database";
import { PRSLCalc } from "./components/prsl-calc";
import { GrowthTablesCalc } from "./components/growth-tables";
import { TPNReferenceCalc } from "./components/tpn-reference";
import { KneeHeightCalc } from "./components/knee-height";

const calcComponents: Record<string, React.FC> = {
  "nutri-assessment": NutriAssessment,
  "food-allergy": FoodAllergy,
  "feeding-eval": FeedingEval,
  "intake-output": IntakeOutput,
  "growth-log": GrowthLog,
  "micronutrient-log": MicronutrientLog,
  "diet-plan": DietPlan,
  "nutri-care-plan": NutriCarePlan,
  "milk-database": MilkDatabaseCalc,
  "prsl-calc": PRSLCalc,
  "growth-tables": GrowthTablesCalc,
  "tpn-reference": TPNReferenceCalc,
  "knee-height": KneeHeightCalc,
};

const subtabIcons: Record<string, string> = {
  "Assessment": "🩺",
  "Monitoring": "📈",
  "Planning": "📝",
  "Referensi": "📚",
};

export function CatatanGiziClient() {
  const [activeTab, setActiveTab] = useState<string>(catatanGiziSubtabs[0]);
  const calcs = getGiziLogCalculatorsForSubtab(activeTab);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 min-w-max pb-1">
          {catatanGiziSubtabs.map((tab) => (
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
