"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { subtabs, getCalculatorsForSubtab } from "./calculator-registry";
import { KafeinCalc } from "./components/kafein-calc";
import { SurfaktanCalc } from "./components/surfaktan-calc";
import { AntibiotikCalc } from "./components/antibiotik-calc";
import { InotropikCalc } from "./components/inotropik-calc";
import { FenobarbitalCalc } from "./components/fenobarbital-calc";
import { VitKCalc } from "./components/vitk-calc";
import { CairanHarianCalc } from "./components/cairanharian-calc";
import { GIRCalc } from "./components/gir-calc";
import { TPNCalc } from "./components/tpn-calc";
import { ElektrolitCalc } from "./components/elektrolit-calc";
import { VentilatorCalc } from "./components/ventilator-calc";
import { TidalVolumeCalc } from "./components/tidalvolume-calc";
import { OICalc } from "./components/oi-calc";
import { ETTCalc } from "./components/ett-calc";
import { ApgarCalc } from "./components/apgar-calc";
import { BallardCalc } from "./components/ballard-calc";
import { SilvermanCalc } from "./components/silverman-calc";
import { FototerapiCalc } from "./components/fototerapi-calc";
import { AGDCalc } from "./components/agd-calc";
import { NatriumCalc } from "./components/natrium-calc";
import { NutrisiNeonatusCalc } from "./components/nutrisi-neonatus-calc";
import { EnteralNeonatusCalc } from "./components/enteral-neonatus-calc";
import { PMACalc } from "./components/pma-calc";
import { TransfusiPRCCalc } from "./components/transfusi-prc-calc";
import { TransfusiTukarCalc } from "./components/transfusi-tukar-calc";
import { ObatResusitasiCalc } from "./components/obat-resusitasi-calc";
import { NaHCO3KoreksiCalc } from "./components/nahco3-koreksi-calc";

const calcComponents: Record<string, React.FC> = {
  kafein: KafeinCalc,
  surfaktan: SurfaktanCalc,
  antibiotik: AntibiotikCalc,
  inotropik: InotropikCalc,
  fenobarbital: FenobarbitalCalc,
  vitk: VitKCalc,
  cairanharian: CairanHarianCalc,
  gir: GIRCalc,
  tpn: TPNCalc,
  elektrolit: ElektrolitCalc,
  ventilator: VentilatorCalc,
  tidalvolume: TidalVolumeCalc,
  oi: OICalc,
  ett: ETTCalc,
  apgar: ApgarCalc,
  ballard: BallardCalc,
  silverman: SilvermanCalc,
  fototerapi: FototerapiCalc,
  agd: AGDCalc,
  natrium: NatriumCalc,
  nutrisi: NutrisiNeonatusCalc,
  enteral: EnteralNeonatusCalc,
  pma: PMACalc,
  transfusiprc: TransfusiPRCCalc,
  transfusitukar: TransfusiTukarCalc,
  obatresusitasi: ObatResusitasiCalc,
  nahco3koreksi: NaHCO3KoreksiCalc,
};

const subtabIcons: Record<string, string> = {
  Obat: "💊",
  "Cairan & TPN": "💧",
  Ventilator: "🫁",
  Skor: "📊",
  AGD: "🧪",
  Nutrisi: "🥛",
  "Alat Hitung": "🔢",
};

export function NeonatologiClient() {
  const [activeTab, setActiveTab] = useState(subtabs[0]);

  const calcs = getCalculatorsForSubtab(activeTab);

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 min-w-max pb-1">
          {subtabs.map((tab) => (
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

      {/* Calculator grid */}
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
