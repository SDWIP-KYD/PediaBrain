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
import { BPClassificationCalc } from "./components/bp-classification";
import { AntihipertensiPediatrikCalc } from "./components/antihipertensi-pediatrik";
import { MAPTargetCalc } from "./components/map-target";
import { MaintenanceFluidCalc } from "./components/maintenance-fluid";
import { DehidrasiAssessmentCalc } from "./components/dehidrasi-assessment";
import { DiuretikDosisCalc } from "./components/diuretik-dosis";
import { UPCRCalc } from "./components/upcr-calc";
import { OsmolalitasUrinRFICalc } from "./components/osmolalitas-urin-rfi";
import { SindromNefrotikCalc } from "./components/sindrom-nefrotik";
import { ImunosupresiNefrologiCalc } from "./components/immunosupresi-nefrologi";
import { PenyesuaianDosisCKDCalc } from "./components/penyesuaian-dosis-ckd";
import { CKDStagingCalc } from "./components/ckd-staging";
import { CalciumAssessmentCalc } from "./components/calcium-assessment";
import { AnionGapCalc } from "./components/anion-gap";
import { FENaCalc } from "./components/fena-calc";
import { FluidOverloadCalc } from "./components/fluid-overload";

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
  "bp-classification": BPClassificationCalc,
  "antihipertensi-pediatrik": AntihipertensiPediatrikCalc,
  "map-target": MAPTargetCalc,
  "maintenance-fluid": MaintenanceFluidCalc,
  "dehidrasi-assessment": DehidrasiAssessmentCalc,
  "diuretik-dosis": DiuretikDosisCalc,
  "upcr-calc": UPCRCalc,
  "osmolalitas-urin-rfi": OsmolalitasUrinRFICalc,
  "sindrom-nefrotik": SindromNefrotikCalc,
  "immunosupresi-nefrologi": ImunosupresiNefrologiCalc,
  "penyesuaian-dosis-ckd": PenyesuaianDosisCKDCalc,
  "ckd-staging": CKDStagingCalc,
  "calcium-assessment": CalciumAssessmentCalc,
  "anion-gap": AnionGapCalc,
  "fena-calc": FENaCalc,
  "fluid-overload": FluidOverloadCalc,
};

const subtabIcons: Record<string, string> = {
  "GFR & Clearance": "🫘",
  "AKI & Staging": "🔬",
  "Elektrolit & Asam-Basa": "⚡",
  "Hipertensi": "💓",
  "Cairan & Edema": "💧",
  "Urin & Proteinuria": "🧪",
  "Obat Nefrologi": "💊",
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
