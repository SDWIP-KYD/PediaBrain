"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { sepsisSubtabs, getSepsisCalculatorsForSubtab } from "./calculator-registry";
import { SepsisDefinisi } from "./components/definisi";
import { SepsisPatofisiologi } from "./components/patofisiologi";
import { SepsisKlinis } from "./components/klinis";
import { SepsisDiagnosis } from "./components/diagnosis";
import { SepsisTatalaksana } from "./components/tatalaksana";
import { SepsisEvaluasi } from "./components/evaluasi";

const calcComponents: Record<string, React.FC> = {
  "sepsis-definisi": SepsisDefinisi,
  "sepsis-patofisiologi": SepsisPatofisiologi,
  "sepsis-klinis": SepsisKlinis,
  "sepsis-diagnosis": SepsisDiagnosis,
  "sepsis-tatalaksana": SepsisTatalaksana,
  "sepsis-evaluasi": SepsisEvaluasi,
};

const subtabIcons: Record<string, string> = {
  "Definisi": "📖",
  "Patofisiologi": "🔬",
  "Klinis": "🩺",
  "Diagnosis": "🔍",
  "Tatalaksana": "💊",
  "Evaluasi": "📊",
};

export function SepsisClient() {
  const [activeTab, setActiveTab] = useState<string>(sepsisSubtabs[0]);
  const calcs = getSepsisCalculatorsForSubtab(activeTab);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 min-w-max pb-1">
          {sepsisSubtabs.map((tab) => (
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
