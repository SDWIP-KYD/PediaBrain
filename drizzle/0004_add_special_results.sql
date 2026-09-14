-- Add patient_special_results table (PA/RAD/BMP/LCS/Imuno/IHC from SIMRS)
CREATE TABLE IF NOT EXISTS patient_special_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  jenis varchar(20) NOT NULL,
  tanggal varchar(40),
  klinis text,
  kesan text,
  kesimpulan text,
  hasil text,
  accession varchar(60),
  viewer_url text,
  state varchar(20),
  detail jsonb,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS patient_special_results_patient_idx ON patient_special_results(patient_id);
CREATE INDEX IF NOT EXISTS patient_special_results_jenis_idx ON patient_special_results(jenis);
