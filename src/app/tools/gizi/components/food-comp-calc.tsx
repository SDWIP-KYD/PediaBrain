"use client";

import { useState } from "react";
import { CalcCard, CalcSelect, CalcResult, InfoBox } from "../../components/calc-ui";

const foodData: Record<string, [string, string, string, string, string][]> = {
  grain: [
    ["Nasi putih 100g", "130", "3", "0", "28"],
    ["Nasi merah 100g", "111", "3", "1", "23"],
    ["Roti gandum 1 iris (30g)", "75", "3", "1", "14"],
    ["Kentang 100g", "77", "2", "0", "17"],
    ["Ubi jalar 100g", "86", "2", "0", "20"],
    ["Mie telur 100g", "138", "5", "2", "25"],
    ["Oatmeal kering 40g", "154", "5", "3", "27"],
    ["Singkong 100g", "159", "1", "0", "38"],
    ["Jagung 1 tongkol (100g)", "86", "3", "1", "19"],
    ["Tepung terigu 30g", "109", "3", "0", "23"],
  ],
  protein: [
    ["Dada ayam 100g", "165", "31", "4", "0"],
    ["Tuna kalengan 100g", "132", "29", "1", "0"],
    ["Telur 1 btr (50g)", "78", "6", "5", "0"],
    ["Tempe 100g", "193", "19", "11", "10"],
    ["Tahu 100g", "76", "8", "4", "2"],
    ["Daging sapi 100g", "250", "26", "17", "0"],
    ["Ikan lele 100g", "135", "21", "4", "0"],
    ["Kacang merah rebus 100g", "127", "9", "0", "23"],
    ["Edamame 100g", "121", "11", "5", "10"],
    ["Hati ayam 100g", "167", "25", "5", "0"],
  ],
  dairy: [
    ["ASI 100mL", "67", "1", "4", "7"],
    ["Formula bayi S1 100mL", "67", "1", "4", "7"],
    ["Susu UHT full fat 200mL", "130", "7", "7", "10"],
    ["Susu skim 200mL", "82", "8", "0", "12"],
    ["Keju cheddar 30g", "120", "7", "10", "0"],
    ["Yogurt plain 150g", "88", "9", "1", "12"],
    ["Pediasure std 100mL", "100", "3", "3", "14"],
    ["Ensure Jr 100mL", "100", "3", "3", "14"],
    ["Peptamen Jr 100mL", "100", "4", "4", "10"],
    ["Formula prematur 100mL", "80", "2", "4", "9"],
  ],
  veg: [
    ["Bayam 100g", "23", "3", "0", "4"],
    ["Brokoli 100g", "34", "3", "0", "7"],
    ["Wortel 100g", "41", "1", "0", "10"],
    ["Kacang panjang 100g", "47", "3", "0", "8"],
    ["Tomat 100g", "18", "1", "0", "4"],
    ["Labu siam 100g", "17", "1", "0", "4"],
    ["Kangkung 100g", "19", "2", "0", "3"],
    ["Kol 100g", "25", "1", "0", "6"],
  ],
  fruit: [
    ["Pisang 1 buah (100g)", "89", "1", "0", "23"],
    ["Apel 1 buah (150g)", "78", "0", "0", "21"],
    ["Jeruk 1 buah (100g)", "47", "1", "0", "12"],
    ["Mangga 100g", "60", "1", "0", "15"],
    ["Pepaya 100g", "43", "1", "0", "11"],
    ["Semangka 100g", "30", "1", "0", "8"],
    ["Avokad ½ buah (75g)", "120", "1", "11", "6"],
    ["Melon 100g", "34", "1", "0", "8"],
  ],
  fat: [
    ["Minyak kelapa sawit 10mL", "90", "0", "10", "0"],
    ["Minyak zaitun 10mL", "88", "0", "10", "0"],
    ["Margarin 10g", "74", "0", "8", "0"],
    ["Santan 50mL", "118", "1", "12", "3"],
    ["Minyak ikan (omega-3) 5mL", "45", "0", "5", "0"],
    ["MCT oil 10mL", "86", "0", "10", "0"],
  ],
  formula: [
    ["Pediasure (1.0 kkal/mL)", "100", "3.0", "3.8", "13.5"],
    ["Ensure Junior (1.0)", "100", "3.2", "3.4", "13.9"],
    ["Peptamen Junior (1.0)", "100", "4.0", "3.8", "10.7"],
    ["Modulen IBD (1.0)", "100", "3.6", "3.7", "12.7"],
    ["Pediasure 1.5 (1.5)", "150", "4.5", "5.7", "20.3"],
    ["Infatrini (1.0)", "100", "2.6", "5.4", "10.3"],
    ["Renastart (renal)", "100", "0.8", "5.1", "15.2"],
    ["Pregestimil (elemental)", "100", "2.8", "5.1", "11.5"],
    ["SMA Gold prematur", "80", "2.0", "3.9", "8.9"],
    ["Nutrison (1.0)", "100", "4.0", "3.9", "12.3"],
  ],
};

const catOptions = [
  { value: "grain", label: "Serealia & Umbi" },
  { value: "protein", label: "Sumber Protein" },
  { value: "dairy", label: "Susu & Produk Susu" },
  { value: "veg", label: "Sayuran" },
  { value: "fruit", label: "Buah" },
  { value: "fat", label: "Lemak & Minyak" },
  { value: "formula", label: "Formula Pediatrik" },
];

export function FoodCompCalc() {
  const [cat, setCat] = useState("grain");
  const foods = foodData[cat] || [];

  return (
    <CalcCard title="Komposisi Bahan Makanan" subtitle="Kalori, protein, lemak, KH per porsi" icon="🍎" color="green">
      <div className="space-y-3">
        <CalcSelect label="Kategori" value={cat} onChange={setCat} options={catOptions} />
        <CalcResult color="green">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Makanan</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground">KKal</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Protein (g)</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground">Lemak (g)</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wider text-muted-foreground">KH (g)</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((f, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5">{f[0]}</td>
                    <td className="text-right font-mono font-bold">{f[1]}</td>
                    <td className="text-right font-mono">{f[2]}</td>
                    <td className="text-right font-mono">{f[3]}</td>
                    <td className="text-right font-mono">{f[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CalcResult>
      </div>
    </CalcCard>
  );
}
