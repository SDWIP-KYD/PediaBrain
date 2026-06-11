-- PedMicromedex v4.0 — Neon PostgreSQL Schema
-- Run this in Neon SQL Editor to create tables + import data

-- ═══════════════════════════════════════════════════════════════
-- TABLES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS micromedex_drugs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(300) NOT NULL,
  drug_class VARCHAR(100) DEFAULT 'other',
  is_pediatric_approved BOOLEAN DEFAULT FALSE,
  neonatal_safe BOOLEAN DEFAULT FALSE,
  is_discontinued BOOLEAN DEFAULT FALSE,
  quality_score INTEGER DEFAULT 0,
  dosing_summary TEXT DEFAULT '',
  uses_summary TEXT DEFAULT '',
  contraindications_summary TEXT DEFAULT '',
  interactions_summary TEXT DEFAULT '',
  pharmacokinetics_summary TEXT DEFAULT '',
  dosing_raw TEXT DEFAULT '',
  uses_raw TEXT DEFAULT '',
  contraindications_raw TEXT DEFAULT '',
  interactions_raw TEXT DEFAULT '',
  pharmacokinetics_raw TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS micromedex_indications (
  id SERIAL PRIMARY KEY,
  drug_id INTEGER REFERENCES micromedex_drugs(id) ON DELETE CASCADE,
  indication TEXT DEFAULT '',
  route VARCHAR(20) DEFAULT '',
  age_min_months NUMERIC,
  age_max_months NUMERIC,
  weight_min_kg NUMERIC,
  weight_max_kg NUMERIC,
  dose_per_kg NUMERIC,
  dose_unit VARCHAR(20) DEFAULT 'mg',
  dose_frequency VARCHAR(50) DEFAULT '',
  max_single_dose NUMERIC,
  max_daily_dose NUMERIC,
  is_loading_dose BOOLEAN DEFAULT FALSE,
  is_neonatal_dose BOOLEAN DEFAULT FALSE,
  source_text TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS micromedex_interactions (
  id SERIAL PRIMARY KEY,
  drug_id INTEGER REFERENCES micromedex_drugs(id) ON DELETE CASCADE,
  interacting_drug_name VARCHAR(300) NOT NULL,
  severity VARCHAR(50) DEFAULT 'unknown',
  mechanism TEXT DEFAULT '',
  clinical_effect TEXT DEFAULT '',
  management TEXT DEFAULT '',
  evidence_level VARCHAR(50) DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS micromedex_adjustments (
  id SERIAL PRIMARY KEY,
  drug_id INTEGER REFERENCES micromedex_drugs(id) ON DELETE CASCADE,
  adjustment_type VARCHAR(50) DEFAULT '',
  criteria TEXT DEFAULT '',
  adjustment TEXT DEFAULT '',
  age_group VARCHAR(100) DEFAULT '',
  source_text TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_mdx_drugs_name ON micromedex_drugs(name);
CREATE INDEX IF NOT EXISTS idx_mdx_drugs_class ON micromedex_drugs(drug_class);
CREATE INDEX IF NOT EXISTS idx_mdx_ind_drug_id ON micromedex_indications(drug_id);
CREATE INDEX IF NOT EXISTS idx_mdx_int_drug_id ON micromedex_interactions(drug_id);
CREATE INDEX IF NOT EXISTS idx_mdx_adj_drug_id ON micromedex_adjustments(drug_id);
