"use client";

import { CalcCard, CalcResult, ResultGrid, ResultItem, InfoBox, ResultAlert } from "../../components/calc-ui";

const shockMechanisms = [
  { mechanism: "Vasodilatasi (NO ↑)", effect: "Resistensi vaskular sistemik ↓, hipotensi" },
  { mechanism: "Kebocoran kapiler", effect: "Hipovolemia relatif, edema interstisial" },
  { mechanism: "Disfungsi miokard", effect: "CO ↓ (terutama pada anak kecil)" },
  { mechanism: "Vasokonstriksi splanknik", effect: "Iskemia usus, translokasi bakteri" },
  { mechanism: "Koagulopati", effect: "DIC, mikrotrombus → iskemia organ" },
  { mechanism: "Disfungsi mitokondria", effect: "Utilisasi O₂ seluler ↓ meski DO₂ cukup" },
];

const organDysfunction = [
  { organ: "🫁 Paru", manifestation: "ARDS, ALI — hipoksemia refrakter" },
  { organ: "🫀 Jantung", manifestation: "Disfungsi miokard, aritmia" },
  { organ: "🧠 Otak", manifestation: "Ensefalopati, penurunan kesadaran" },
  { organ: "🫘 Ginjal", manifestation: "AKI — oliguria, kreatinin ↑" },
  { organ: "🩸 Koagulasi", manifestation: "DIC, trombositopenia, perdarahan" },
  { organ: "🫀 Hati", manifestation: "Koagulopati, hiperglikemia/hipoglikemia" },
];

export function SepsisPatofisiologi() {
  return (
    <div className="space-y-3">
      <CalcCard title="Patofisiologi" subtitle="Mekanisme molekular hingga disfungsi organ" icon="🔬" color="green">
        <div className="space-y-3">
          <InfoBox>
            <strong>🧬 Inisiasi</strong>
            <br />
            Patogen (bakteri, virus, jamur, parasit) mengaktifkan <strong>Pattern Recognition Receptors (PRR)</strong> → aktivasi kaskade inflamasi sistemik. PAMP (Pathogen-Associated Molecular Patterns) memicu respons imun innate yang berlebihan.
          </InfoBox>

          <CalcResult color="red">
            <div className="space-y-3 text-xs">
              <p className="font-semibold">Kaskade Inflamasi & Imunopatologi:</p>

              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Trigger</p>
                <p>Infeksi → PAMP/DAMP → aktivasi TLR, NLR, dsb.</p>
              </div>

              <p className="text-center text-muted-foreground">↓</p>

              <div className="rounded-lg border border-border p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Respons Proinflamasi</p>
                <p>TNF-α, IL-1β, IL-6, IL-8 ↑ → aktivasi endotel, neutrofil, makrofag → peningkatan permeabilitas vaskular</p>
              </div>

              <p className="text-center text-muted-foreground">↓</p>

              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 border-dashed p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Imunoparalisis (fase lanjut)</p>
                <p>Apoptosis limfosit masif → IL-10, TGF-β ↑ → imunosupresi → rentan infeksi sekunder</p>
              </div>

              <p className="text-center text-muted-foreground">↓</p>

              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Disfungsi Organ</p>
                <p>Disfungsi mikrovaskular, gangguan utilisasi oksigen seluler → MODS (Multi-Organ Dysfunction Syndrome)</p>
              </div>
            </div>
          </CalcResult>
        </div>
      </CalcCard>

      <CalcCard title="Patofisiologi Syok Septik pada Anak" icon="❤️" color="blue">
        <CalcResult>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-semibold">Mekanisme</th>
                  <th className="text-left py-2 font-semibold">Efek</th>
                </tr>
              </thead>
              <tbody>
                {shockMechanisms.map((row) => (
                  <tr key={row.mechanism} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.mechanism}</td>
                    <td className="py-2 text-muted-foreground">{row.effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcResult>
        <ResultAlert type="danger">
          <strong>Perbedaan penting anak vs dewasa:</strong> Anak lebih sering mengalami syok dengan <strong>cardiac output rendah + resistensi tinggi</strong> (cold shock), bukan vasodilatasi (warm shock) seperti dewasa.
        </ResultAlert>
      </CalcCard>

      <CalcCard title="Disfungsi Organ Spesifik" icon="🫁" color="purple">
        <CalcResult>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-semibold">Organ</th>
                  <th className="text-left py-2 font-semibold">Manifestasi</th>
                </tr>
              </thead>
              <tbody>
                {organDysfunction.map((row) => (
                  <tr key={row.organ} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.organ}</td>
                    <td className="py-2 text-muted-foreground">{row.manifestation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcResult>
      </CalcCard>
    </div>
  );
}
