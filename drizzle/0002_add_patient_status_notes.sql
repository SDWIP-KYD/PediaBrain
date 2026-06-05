-- Add status and notes columns to patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS status varchar(20) NOT NULL DEFAULT 'rawat_inap';
ALTER TABLE patients ADD COLUMN IF NOT EXISTS notes text;
