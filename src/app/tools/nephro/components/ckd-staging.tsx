"use client";

import { useState } from "react";
import { CalcCard, CalcInput, CalcSelect, CalcResult, ResultGrid, ResultItem, ResultAlert, InfoBox } from "../../components/calc-ui";

export function CKDStagingCalc() {
  const [gfr, setGfr] = useState(75);
  const [albCat, setAlbCat] = useState("A1");
  const [duration, setDuration] = useState("yes");
  const [etiology, setEtiology] = useState("congenital");

  let gStage = gfr >= 90 ? "G1" : gfr >= 60 ? "G2" : gfr >= 45 ? "G3a" : gfr >= 30 ? "G3b" : gfr >= 15 ? "G4" : "G5";

  const progMap: Record<string, Record<string, string>> = {
    A1: { G1: "Hijau", G2: "Hijau", G3a: "Kuning", G3b: "Oranye", G4: "Merah", G5: "Merah" },
    A2: { G1: "Kuning", G2: "Kuning", G3a: "Oranye", G3b: "Oranye", G4: "Merah", G5: "Merah" },
    A3: { G1: "Oranye", G2: "Oranye", G3a: "Oranye", G3b: "Merah", G4: "Merah", G5: "Merah" },
  };
  const prognosis = progMap[albCat]?.[gStage] || "—";
  const progColor = prognosis === "Hijau" ? "success" : prognosis === "Kuning" ? "warning" : "danger";

  const etioMap: Record<string, string> = {
    congenital: "CAKUT — perlu evaluasi anatomi, USG ginjal rutin",
    glomerular: "Glomerulonefritis — monitor komplemen, ANCA, anti-dsDNA",
    hereditary: "Herediter — evaluasi genetik, audiologi (Alport), mata",
    other: "Penyebab lainnya — evaluasi lengkap",
  };

  const isCKD = duration === "yes";

  return (
    <CalcCard title="Staging CKD Pediatrik (KDIGO)" subtitle="GFR + Albuminuria staging" icon="📊" color="teal">
      <div className="grid grid-cols-2 gap-3">
        <CalcInput label="eGFR (mL/mnt/1.73m²)" value={gfr} onChange={(v) => setGfr(v as number)} />
        <CalcSelect
          label="Kategori Albuminuria"
          value={albCat}
          onChange={setAlbCat}
          options={[
            { value: "A1", label: "A1: Normal–ringan (<30 mg/g)" },
            { value: "A2", label: "A2: Sedang (30–300 mg/g)" },
            { value: "A3", label: "A3: Berat (>300 mg/g)" },
          ]}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <CalcSelect
          label="Durasi Kelainan (>3 bulan?)"
          value={duration}
          onChange={setDuration}
          options={[
            { value: "yes", label: "Ya (CKD)" },
            { value: "no", label: "Tidak / belum diketahui" },
          ]}
        />
        <CalcSelect
          label="Etiologi"
          value={etiology}
          onChange={setEtiology}
          options={[
            { value: "congenital", label: "CAKUT (kongenital)" },
            { value: "glomerular", label: "Glomerulonefritis" },
            { value: "hereditary", label: "Herediter (Alport, dll)" },
            { value: "other", label: "Lainnya" },
          ]}
        />
      </div>
      <CalcResult color="teal">
        <ResultGrid cols={2}>
          <ResultItem label="Stadium GFR" value={gStage} note={`${gfr} mL/mnt/1.73m²`} />
          <ResultItem label="Albuminuria" value={albCat} />
          <ResultItem label="Prognosis" value={prognosis} note={progColor === "danger" ? "Risiko tinggi" : progColor === "warning" ? "Risiko sedang" : "Risiko rendah"} />
          <ResultItem label="Status" value={isCKD ? "✅ CKD (>3 bulan)" : "⏳ Belum dapat ditentukan"} />
        </ResultGrid>
        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
          <p><strong>Etiologi:</strong> {etioMap[etiology]}</p>
          {gfr < 30 && <p>⚠️ Persiapkan RRT dini — konsul nefrologi anak dan tim transplant</p>}
        </div>
      </CalcResult>
    </CalcCard>
  );
}
