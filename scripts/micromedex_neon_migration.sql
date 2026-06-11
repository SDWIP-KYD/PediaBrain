CREATE TABLE IF NOT EXISTS "micromedex_dose_adjustments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "drug_id" uuid,
  "adjustment_type" varchar(50),
  "criteria" text,
  "adjustment" text,
  "age_group" varchar(100),
  "source_text" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "micromedex_drug_interactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "drug_id" uuid,
  "interacting_drug_name" varchar(255) NOT NULL,
  "severity" varchar(50),
  "mechanism" text,
  "clinical_effect" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "micromedex_drugs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(255) NOT NULL,
  "drug_class" varchar(255),
  "is_pediatric_approved" boolean DEFAULT false,
  "neonatal_safe" boolean DEFAULT false,
  "is_discontinued" boolean DEFAULT false,
  "quality_score" varchar(10),
  "uses_summary" text,
  "dosing_summary" text,
  "dosing_raw" text,
  "uses_raw" text,
  "contraindications_summary" text,
  "contraindications_raw" text,
  "interactions_summary" text,
  "interactions_raw" text,
  "pharmacokinetics_summary" text,
  "pharmacokinetics_raw" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "micromedex_indications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "drug_id" uuid,
  "indication" text,
  "route" varchar(50),
  "dose_per_kg" varchar(50),
  "dose_unit" varchar(50),
  "dose_frequency" varchar(100),
  "max_single_dose" varchar(50),
  "max_daily_dose" varchar(50),
  "source_text" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'micromedex_dose_adjustments_drug_id_micromedex_drugs_id_fk') THEN
    ALTER TABLE "micromedex_dose_adjustments" ADD CONSTRAINT "micromedex_dose_adjustments_drug_id_micromedex_drugs_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."micromedex_drugs"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'micromedex_drug_interactions_drug_id_micromedex_drugs_id_fk') THEN
    ALTER TABLE "micromedex_drug_interactions" ADD CONSTRAINT "micromedex_drug_interactions_drug_id_micromedex_drugs_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."micromedex_drugs"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'micromedex_indications_drug_id_micromedex_drugs_id_fk') THEN
    ALTER TABLE "micromedex_indications" ADD CONSTRAINT "micromedex_indications_drug_id_micromedex_drugs_id_fk" FOREIGN KEY ("drug_id") REFERENCES "public"."micromedex_drugs"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
