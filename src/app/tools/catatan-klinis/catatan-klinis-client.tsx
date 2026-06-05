"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { catatanKlinisSubtabs, getKlinisCalculatorsForSubtab } from "./calculator-registry";
import { SOAPNote } from "./components/soap";
import { ResumeMedis } from "./components/resume";
import { SuratRujukan } from "./components/referral";
import { SuratPulang } from "./components/discharge";
import { PemeriksaanFisikAnak } from "./components/pe-anak";
import { RiwayatPenyakit } from "./components/riwayat";
import { RisikoJatuh } from "./components/risiko-jatuh";
import { RisikoDecubitus } from "./components/risiko-decubitus";
import { CatatanProsedur } from "./components/prosedur";
import { InformedConsent } from "./components/informed-consent";
import { CatatanMedisHarian } from "./components/catatan-medis";
import { SuratAlamatDokter } from "./components/surat-alamat";
import { SuratKeteranganSakit } from "./components/surat-sakit";

const calcComponents: Record<string, React.FC> = {
  "soap": SOAPNote,
  "resume": ResumeMedis,
  "referral": SuratRujukan,
  "discharge": SuratPulang,
  "pe-anak": PemeriksaanFisikAnak,
  "riwayat": RiwayatPenyakit,
  "risiko-jatuh": RisikoJatuh,
  "risiko-decubitus": RisikoDecubitus,
  "prosedur": CatatanProsedur,
  "informed-consent": InformedConsent,
  "catatan-medis": CatatanMedisHarian,
  "surat-alamat": SuratAlamatDokter,
  "surat-sakit": SuratKeteranganSakit,
};

const subtabIcons: Record<string, string> = {
  "Templates": "📋",
  "Assessment": "🩺",
  "Procedures": "🔧",
  "Administrative": "📄",
};

export function CatatanKlinisClient() {
  const [activeTab, setActiveTab] = useState<string>(catatanKlinisSubtabs[0]);
  const calcs = getKlinisCalculatorsForSubtab(activeTab);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 min-w-max pb-1">
          {catatanKlinisSubtabs.map((tab) => (
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
