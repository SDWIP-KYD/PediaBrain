"use client";

import { useState, useEffect } from "react";
import { usePatient } from "../../patient-context";
import { CalcCard, CalcInput, CalcResult, ResultAlert, CalcButton } from "../../components/calc-ui";

export function EnteralNeonatusCalc() {
  const { weightGram, gestationalAge } = usePatient();
  const [wt, setWt] = useState(weightGram);
  const [ga, setGa] = useState(gestationalAge);
  const [show, setShow] = useState(false);

  useEffect(() => { setWt(weightGram); setGa(gestationalAge); }, [weightGram, gestationalAge]);

  const isPremature = ga < 34;
  const isELBW = wt < 1000;
  const isVLBW = wt < 1500;
  const advRate = isELBW ? 10 : 20;

  return (
    <CalcCard title="Panduan Enteral Neonatus" subtitle="Trophic feeding & advancement" icon="🤱" color="pink">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="BB (gram)" value={wt} onChange={(v) => setWt(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="g" />
        <CalcInput label="GA (minggu)" value={ga} onChange={(v) => setGa(typeof v === "string" ? parseFloat(v) || 0 : v)} unit="mgg" />
      </div>
      <CalcButton onClick={() => setShow(true)} color="pink">Panduan Feeding</CalcButton>
      {show && (
        <CalcResult color="pink">
          <div className="space-y-1 text-xs leading-relaxed">
            <p><strong>Panduan Enteral Feeding {wt}g GA {ga} mgg:</strong></p>
            {isELBW && <p>🟡 ELBW (&lt;1000g): Trofik 10-20 mL/kg/hr (kolostrum/ASI), hari 1-2</p>}
            {isVLBW && !isELBW && <p>📌 VLBW (1000-1499g): Mulai 20 mL/kg/hr, naikkan bertahap</p>}
            {!isVLBW && isPremature && <p>📌 Prematur (1500-2499g): Mulai 30-40 mL/kg/hr</p>}
            {!isPremature && !isVLBW && <p>📌 Aterm/Besar: Mulai 30-40 mL/kg/hr</p>}
            <p>📈 Kenaikan volume: <strong>{advRate} mL/kg/hari</strong></p>
            <p>🎯 Target penuh: <strong>150-160 mL/kg/hr</strong></p>
            <p>🥛 ASI preferensi utama. Fortifikasi HMF bila &gt;100 mL/kg/hr</p>
            <p>⏰ Feeding NGT {isELBW ? "bolus tiap 2-3 jam" : "bolus tiap 3 jam (aterm: tiap 2-3 jam)"}</p>
            <p>🚫 Tunda feeding bila: distensi abdomen, muntah hijau, darah di feses, ketidakstabilan hemodinamik</p>
          </div>
        </CalcResult>
      )}
    </CalcCard>
  );
}
