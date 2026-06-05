export interface KlinisCalcDef {
  id: string;
  name: string;
  description: string;
}

export const catatanKlinisSubtabs = [
  "Templates",
  "Assessment",
  "Procedures",
  "Administrative",
] as const;

const calculatorRegistry: Record<string, KlinisCalcDef[]> = {
  Templates: [
    { id: "soap", name: "SOAP Note Generator", description: "Subjective, Objective, Assessment, Plan" },
    { id: "resume", name: "Resume Medis", description: "Ringkasan medis lengkap" },
    { id: "referral", name: "Surat Rujukan", description: "Surat rujukan spesialis" },
    { id: "discharge", name: "Surat Pulang", description: "Ringkasan pulang & instruksi" },
  ],
  Assessment: [
    { id: "pe-anak", name: "Pemeriksaan Fisik Anak", description: "Checklist sistematis pemeriksaan fisik" },
    { id: "riwayat", name: "Riwayat Penyakit", description: "Panduan anamnesis lengkap" },
    { id: "risiko-jatuh", name: "Risiko Jatuh", description: "Morse Fall Scale adaptasi peds" },
    { id: "risiko-decubitus", name: "Risiko Decubitus", description: "Braden Q scale pediatric" },
  ],
  Procedures: [
    { id: "prosedur", name: "Catatan Prosedur", description: "Dokumentasi prosedur medis" },
    { id: "informed-consent", name: "Informed Consent", description: "Formulir persetujuan tindakan" },
    { id: "catatan-medis", name: "Catatan Medis Harian", description: "Progress notes harian" },
  ],
  Administrative: [
    { id: "surat-alamat", name: "Surat Alamat Dokter", description: "Surat keterangan alamat dokter" },
    { id: "surat-sakit", name: "Surat Keterangan Sakit", description: "Surat izin sakit" },
  ],
};

export function getKlinisCalculatorsForSubtab(subtab: string): KlinisCalcDef[] {
  return calculatorRegistry[subtab] || [];
}

export function getAllKlinisCalculators(): KlinisCalcDef[] {
  return Object.values(calculatorRegistry).flat();
}
