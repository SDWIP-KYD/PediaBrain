export interface NephroCalcDef {
  id: string;
  name: string;
  description: string;
  linkOutputTo?: string[];
  linkLabel?: string;
  linkIcon?: string;
}

export const nephroSubtabs = [
  "GFR & Clearance",
  "AKI & Staging",
  "Elektrolit & Asam-Basa",
  "Hipertensi",
  "Cairan & Edema",
  "Urin & Proteinuria",
  "Obat Nefrologi",
  "Dialisis",
  "Glomerulonefritis",
  "Transplantasi",
] as const;

const calculatorRegistry: Record<string, NephroCalcDef[]> = {
  "GFR & Clearance": [
    { id: "gfr-calc", name: "GFR Calculator", description: "Schwartz, CKiD, bedside GFR" },
    { id: "crcl-calc", name: "CrCl (Cockcroft-Gault)", description: "Creatinine clearance" },
    { id: "cystatin-calc", name: "Cystatin C GFR", description: "Cystatin-based eGFR" },
    { id: "egfr-trend", name: "eGFR Trend", description: "Track eGFR over time" },
    { id: "bun-creat-ratio", name: "BUN/Creatinine Ratio", description: "Prerenal vs intrinsic" },
  ],
  "AKI & Staging": [
    { id: "aki-staging", name: "AKI Staging", description: "KDIGO criteria" },
    { id: "rifle", name: "RIFLE Criteria", description: "AKI classification" },
    { id: "aki-risk", name: "AKI Risk Assessment", description: "Pediatric AKI risk" },
  ],
  "Elektrolit & Asam-Basa": [
    { id: "hyperkalemia", name: "Hyperkalemia Mgmt", description: "K+ >5.5 management" },
    { id: "hyponatremia", name: "Hyponatremia Mgmt", description: "Na+ <135 correction" },
    { id: "met-acidosis", name: "Metabolic Acidosis", description: "AG, delta-delta, RTA" },
    { id: "rta-calc", name: "RTA Classification", description: "Type 1/2/3/4 RTA" },
  ],
  "Hipertensi": [
    { id: "bp-classification", name: "BP Classification (AAP 2017)", description: "Age-based BP percentiles for pediatric hypertension staging" },
    { id: "antihipertensi-pediatrik", name: "Antihipertensi Pediatrik", description: "Drug protocols for crisis, stage 1, stage 2, CKD, nephrotic" },
    { id: "map-target", name: "MAP & Target", description: "MAP formula + target BP reduction percentages" },
  ],
  "Cairan & Edema": [
    { id: "maintenance-fluid", name: "Maintenance Fluid", description: "Holliday-Segar 100/50/20 method" },
    { id: "dehidrasi-assessment", name: "Dehidrasi Assessment", description: "Iso/hypo/hypernatremic dehydration + rehydration volumes" },
    { id: "diuretik-dosis", name: "Diuretik Dosis", description: "Furosemide, spironolactone, HCTZ dosing by weight" },
  ],
  "Urin & Proteinuria": [
    { id: "upcr-calc", name: "UPCR", description: "Urine Protein:Creatinine Ratio interpretation" },
    { id: "osmolalitas-urin-rfi", name: "Osmolalitas Urin & RFI", description: "Renal Failure Index calculator" },
    { id: "sindrom-nefrotik", name: "Sindrom Nefrotik", description: "Steroid protocols (remission/relapse)" },
  ],
  "Obat Nefrologi": [
    { id: "immunosupresi-nefrologi", name: "Imunosupresi Nefrologi", description: "7 protocols (NS, ITP, HSP, transplant)" },
    { id: "penyesuaian-dosis-ckd", name: "Penyesuaian Dosis CKD", description: "13 drugs × 3 GFR stages adjustment table" },
  ],
  "Dialisis": [
    { id: "crrt-prescription", name: "CRRT Prescription", description: "CVVH/CVVHD/CVVHDF" },
    { id: "pd-adequacy", name: "PD Adequacy", description: "Kt/V, CrCl" },
    { id: "hd-prescription", name: "HD Prescription", description: "Hemodialysis setup" },
    { id: "dialysis-dose", name: "Dialysis Dose", description: "Kt/V target" },
  ],
  "Glomerulonefritis": [
    { id: "proteinuria", name: "Proteinuria Assessment", description: "ACR, PCR, staging" },
    { id: "complement", name: "Complement Levels", description: "C3/C4 interpretation" },
    { id: "anca", name: "ANCA Interpretation", description: "c-ANCA/p-ANCA patterns" },
  ],
  "Transplantasi": [
    { id: "kdigo-transplant", name: "KDIGO Transplant", description: "Monitoring protocol" },
    { id: "bk-virus", name: "BK Virus Risk", description: "BK nephropathy risk" },
  ],
};

export function getNephroCalculatorsForSubtab(subtab: string): NephroCalcDef[] {
  return calculatorRegistry[subtab] || [];
}

export function getAllNephroCalculators(): NephroCalcDef[] {
  return Object.values(calculatorRegistry).flat();
}
