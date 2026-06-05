-- Add dpjp column to patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS dpjp varchar(255);
