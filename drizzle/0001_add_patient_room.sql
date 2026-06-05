-- Migration: Add room and bed columns to patients table
-- Run this if the patients table already exists

ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "room" varchar(50);
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "bed" varchar(20);
