"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { nephroSubtabs, getNephroCalculatorsForSubtab } from "./calculator-registry";
import { GFRCalc } from "./components/gfr-calc";
import { CrClCalc } from "./components/crcl-calc";
import { CystatinCCalc } from "./components/cystatin-calc";
import { EGFRTrendCalc } from "./components/egfr-trend";
import { BUNCreatRatioCalc } from "./components/bun-creat-ratio";
import { AKIStagingCalc } from "./components/aki-staging";
import { RIFLECalc } from "./components/rifle";
import { AKIRiskCalc } from "./components/aki-risk";
import { HyperkalemiaCalc } from "./components/hyperkalemia";
import { HyponatremiaCalc } from "./components/hyponatremia";
import { MetAcidosisCalc } from "./components/met-acidosis";
import { RTACalc } from "./components/rta-calc";
import { CRRTCalc } from "./components/crrt-prescription";
import { PDAdequacyCalc } from "./components/pd-adequacy";
import { HDPrescriptionCalc } from "./components/hd-prescription";
import { DialysisDoseCalc } from "./components/dialysis-dose";
import { ProteinuriaCalc } from "./components/proteinuria";
import { ComplementCalc } from "./components/complement";
import { ANCACalc } from "./components/anca";
import { KDIGOTransplantCalc } from "./components/kdigo-transplant";
import { BKVirusCalc } from "./components/bk-virus";

const calcComponents: Record<string, React.FC> = {
  "gfr-calc": GFRCalc,
  "crcl-calc": CrClCalc,
  "cystatin-calc": CystatinCCalc,
  "egfr-trend": EGFRTrendCalc,
  "bun-creat-ratio": BUNCreatRatioCalc,
  "aki-staging": AKIStagingCalc,
  "rifle": RIFLECalc,
  "aki-risk": AKIRiskCalc,
  "hyperkalemia": HyperkalemiaCalc,
  "hyponatremia": HyponatremiaCalc,
  "met-acidosis": MetAcidosisCalc,
  "rta-calc": RTACalc,
  "crrt-prescription": CRRTCalc,
  "pd-adequacy": PDAdequacyCalc,
  "hd-prescription": HDPrescriptionCalc,
  "dialysis-dose": DialysisDoseCalc,
  "proteinuria": ProteinuriaCalc,
  "complement": ComplementCalc,
  "anca": ANCACalc,
  "kdigo-transplant": KDIGOTransplantCalc,
  "bk-virus": BKVirusCalc,
};

const subtabIcons: Record<string, string> = {
  "GFR & Clearance": "🫘",
  "AKI & Staging": "🔬",
  "Elektrolit & Asam-Basa": "⚡",
  "Dialisis": "🫁",
  "Glomerulonefritis": "🧬",
  "Transplantasi": "🏥",
};

export function NephroClient() {
  const [activeTab, setActiveTab] = useState<string>(nephroSubtabs[0]);
  const calcs = getNephroCalculatorsForSubtab(activeTab);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 min-w-max pb-1">
          {nephroSubtabs.map((tab) => (
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
