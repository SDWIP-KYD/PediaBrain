import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
  date,
  boolean,
} from "drizzle-orm/pg-core";

export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  tags: jsonb("tags").notNull().default([]),
  isPinned: boolean("is_pinned").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const followUps = pgTable("follow_ups", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  dueDate: date("due_date", { mode: "string" }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("PENDING"),
  recurrence: varchar("recurrence", { length: 20 }).notNull().default("none"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stickyNotes = pgTable("sticky_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const noteVersions = pgTable("note_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  noteId: uuid("note_id")
    .notNull()
    .references(() => notes.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  tags: jsonb("tags").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  medicalRecordNo: varchar("medical_record_no", { length: 50 }),
  name: varchar("name", { length: 255 }).notNull(),
  birthDate: date("birth_date", { mode: "string" }),
  sex: varchar("sex", { length: 1 }),
  parentName: varchar("parent_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  room: varchar("room", { length: 50 }),
  bed: varchar("bed", { length: 20 }),
  status: varchar("status", { length: 20 }).notNull().default("rawat_inap"),
  notes: text("notes"),
  dpjp: varchar("dpjp", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const patientVisits = pgTable("patient_visits", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  visitDate: date("visit_date", { mode: "string" }).notNull(),
  chiefComplaint: text("chief_complaint"),
  anamnesis: text("anamnesis"),
  physicalExam: text("physical_exam"),
  weightKg: varchar("weight_kg", { length: 10 }),
  heightCm: varchar("height_cm", { length: 10 }),
  headCircumferenceCm: varchar("head_circumference_cm", { length: 10 }),
  diagnosisPrimary: varchar("diagnosis_primary", { length: 255 }),
  diagnosisSecondary: text("diagnosis_secondary"),
  therapy: text("therapy"),
  notes: text("notes"),
  sections: jsonb("sections"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const patientLabResults = pgTable("patient_lab_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  visitId: uuid("visit_id")
    .notNull()
    .references(() => patientVisits.id, { onDelete: "cascade" }),
  testName: varchar("test_name", { length: 255 }).notNull(),
  result: varchar("result", { length: 255 }),
  unit: varchar("unit", { length: 50 }),
  referenceRange: varchar("reference_range", { length: 100 }),
  flag: varchar("flag", { length: 20 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const patientMedications = pgTable("patient_medications", {
  id: uuid("id").primaryKey().defaultRandom(),
  visitId: uuid("visit_id")
    .notNull()
    .references(() => patientVisits.id, { onDelete: "cascade" }),
  drugName: varchar("drug_name", { length: 255 }).notNull(),
  dose: varchar("dose", { length: 100 }),
  frequency: varchar("frequency", { length: 100 }),
  duration: varchar("duration", { length: 100 }),
  route: varchar("route", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const drugs = pgTable("drugs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  drugClass: varchar("drug_class", { length: 255 }),
  isPediatricApproved: boolean("is_pediatric_approved").default(false),
  neonatalSafe: boolean("neonatal_safe").default(false),
  qualityScore: varchar("quality_score", { length: 10 }),
  usesSummary: text("uses_summary"),
  dosingRaw: text("dosing_raw"),
  contraindicationsRaw: text("contraindications_raw"),
  interactionsRaw: text("interactions_raw"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const indications = pgTable("indications", {
  id: uuid("id").primaryKey().defaultRandom(),
  drugId: uuid("drug_id").references(() => drugs.id, { onDelete: "cascade" }),
  indication: text("indication"),
  route: varchar("route", { length: 50 }),
  dosePerKg: varchar("dose_per_kg", { length: 50 }),
  doseUnit: varchar("dose_unit", { length: 50 }),
  doseFrequency: varchar("dose_frequency", { length: 100 }),
  maxSingleDose: varchar("max_single_dose", { length: 50 }),
  maxDailyDose: varchar("max_daily_dose", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const drugInteractions = pgTable("drug_interactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  drugId: uuid("drug_id").references(() => drugs.id, { onDelete: "cascade" }),
  interactingDrugName: varchar("interacting_drug_name", { length: 255 }).notNull(),
  severity: varchar("severity", { length: 50 }),
  mechanism: text("mechanism"),
  clinicalEffect: text("clinical_effect"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
