-- Add patient_cppt_notes table (cached CPPT from SIRS)
CREATE TABLE IF NOT EXISTS patient_cppt_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  kunjungan varchar(60),
  tanggal varchar(40),
  penulis varchar(255),
  subjektif text,
  objektif text,
  assesment text,
  terapi text,
  planning text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS patient_cppt_notes_patient_idx ON patient_cppt_notes(patient_id);
CREATE UNIQUE INDEX IF NOT EXISTS patient_cppt_notes_key_idx ON patient_cppt_notes(patient_id, COALESCE(kunjungan,''), COALESCE(tanggal,''), COALESCE(penulis,''));
