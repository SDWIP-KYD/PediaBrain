# AI Usage Guide — PediaBrain Database & API

> This guide tells an AI agent exactly how to interact with the PediaBrain system — database tables, server actions, API endpoints, and step-by-step workflows for every common operation.

---

## 1. DATABASE CONNECTION

**Provider:** Neon Postgres (serverless)
**ORM:** Drizzle ORM
**Schema file:** `src/lib/db/schema.ts`
**DB client:** `src/lib/db/index.ts` (exports `db`)

### Connecting directly (for scripts)
```ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);
```

### Python (for Zai/Hermes HP scripts)
```python
import psycopg2
conn = psycopg2.connect(DATABASE_URL + "?sslmode=require")
cur = conn.cursor()
cur.execute("SELECT * FROM patients LIMIT 10")
rows = cur.fetchall()
```

---

## 2. TABLE SCHEMAS — Complete

### 2.1 `patients` — Master Patient Data

```sql
CREATE TABLE patients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_no VARCHAR(50),
  name          VARCHAR(255) NOT NULL,
  birth_date    DATE,
  sex           VARCHAR(1),          -- 'L' or 'P'
  parent_name   VARCHAR(255),
  phone         VARCHAR(50),
  address       TEXT,
  room          VARCHAR(50),         -- Kanban room (DAHLIA, ANGGREK, etc.)
  bed           VARCHAR(20),         -- Bed number (K.01.1)
  status        VARCHAR(20) NOT NULL DEFAULT 'rawat_inap',  -- 'rawat_inap' or 'pulang'
  notes         TEXT,                -- Inline kanban notes
  dpjp          VARCHAR(255),        -- Treating physician name
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Key fields for AI:**
- `name` — required
- `room` + `bed` — for kanban placement
- `status` — 'rawat_inap' = active inpatient, 'pulang' = discharged
- `dpjp` — physician name (used for filtering in kanban)
- `notes` — quick notes shown on kanban card

### 2.2 `patient_visits` — Clinical Encounters

```sql
CREATE TABLE patient_visits (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id              UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_date              DATE NOT NULL,
  chief_complaint         TEXT,
  anamnesis               TEXT,
  physical_exam           TEXT,
  weight_kg               VARCHAR(10),
  height_cm               VARCHAR(10),
  head_circumference_cm   VARCHAR(10),
  diagnosis_primary       VARCHAR(255),
  diagnosis_secondary     TEXT,
  therapy                 TEXT,
  notes                   TEXT,
  sections                JSONB,           -- Array of formatted section strings
  created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Sections format:** JSONB array of strings like `["Subjektif: ...", "Objektif: ...", "Assesment: ...", "Terapi: ..."]`

### 2.3 `patient_lab_results` — Lab Data

```sql
CREATE TABLE patient_lab_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id        UUID NOT NULL REFERENCES patient_visits(id) ON DELETE CASCADE,
  test_name       VARCHAR(255) NOT NULL,
  result          VARCHAR(255),
  unit            VARCHAR(50),
  reference_range VARCHAR(100),
  flag            VARCHAR(20),     -- 'high', 'low', 'normal', 'unknown'
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 2.4 `patient_medications` — Drug Orders

```sql
CREATE TABLE patient_medications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id    UUID NOT NULL REFERENCES patient_visits(id) ON DELETE CASCADE,
  drug_name   VARCHAR(255) NOT NULL,
  dose        VARCHAR(100),
  frequency   VARCHAR(100),
  duration    VARCHAR(100),
  route       VARCHAR(50),
  notes       TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 2.5 `notes` — General Notes

```sql
CREATE TABLE notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  content     TEXT NOT NULL,
  tags        JSONB NOT NULL DEFAULT '[]',   -- Array of strings
  is_pinned   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 2.6 `follow_ups` — Follow-up Tasks

```sql
CREATE TABLE follow_ups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(255) NOT NULL,
  content     TEXT,
  due_date    DATE NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- 'PENDING' or 'COMPLETED'
  recurrence  VARCHAR(20) NOT NULL DEFAULT 'none',     -- 'none', 'weekly', 'monthly'
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 3. HOW TO DO EVERYTHING — Step by Step

### 3.1 Input a New Note

**Via Server Action (recommended):**
```ts
import { createNote } from '@/app/actions';

const formData = new FormData();
formData.set('title', 'Protokol Sepsis Pediatrik');
formData.set('content', '# Protokol Sepsis\n\n1. Identifikasi dini...\n2. Cairan bolus...');
formData.set('tags', 'sepsis, protokol, emergensi');
await createNote(formData);
```

**Via Direct SQL:**
```sql
INSERT INTO notes (title, content, tags) 
VALUES (
  'Protokol Sepsis Pediatrik',
  '# Protokol Sepsis\n\n1. Identifikasi dini...',
  '["sepsis", "protokol", "emergensi"]'::jsonb
);
```

**Via Python:**
```python
import uuid, json, psycopg2

conn = psycopg2.connect("DATABASE_URL?sslmode=require")
cur = conn.cursor()
cur.execute("""
    INSERT INTO notes (id, title, content, tags)
    VALUES (%s, %s, %s, %s::jsonb)
""", (
    str(uuid.uuid4()),
    "Protokol Sepsis Pediatrik",
    "# Protokol Sepsis\n\n1. Identifikasi dini...",
    json.dumps(["sepsis", "protokol", "emergensi"])
))
conn.commit()
```

### 3.2 Set Up Follow-up

**Via Server Action:**
```ts
import { createFollowUp } from '@/app/actions';

const formData = new FormData();
formData.set('title', 'Cek Lab Ulang - An. Budi');
formData.set('content', 'CBC, CRP, Prokalsitonin');
formData.set('dueDate', '2026-06-16');
formData.set('recurrence', 'none');  // or 'weekly' or 'monthly'
await createFollowUp(formData);
```

**Via Direct SQL:**
```sql
INSERT INTO follow_ups (title, content, due_date, status, recurrence)
VALUES ('Cek Lab Ulang - An. Budi', 'CBC, CRP, Prokalsitonin', '2026-06-16', 'PENDING', 'none');
```

### 3.3 Edit Patient List

#### Create new patient:
```ts
import { createPatient } from '@/app/actions';

await createPatient({
  name: 'An. Budi Santoso',
  medicalRecordNo: '123456',
  birthDate: '2020-03-15',
  sex: 'L',
  parentName: 'Ibu Sari',
  phone: '081234567890',
  room: 'DAHLIA',
  bed: 'K.01.1',
});
```

#### Update existing patient:
```ts
import { updatePatient } from '@/app/actions';

await updatePatient('patient-uuid-here', {
  room: 'ANGGREK',    // move room
  bed: 'K.03.2',      // move bed
  dpjp: 'Dr. Ahmad',  // set physician
});
```

#### Discharge patient:
```ts
import { dischargePatient } from '@/app/actions';

await dischargePatient('patient-uuid-here');
// Sets status='pulang', room=null, bed=null
```

#### Via Direct SQL (batch):
```sql
-- Update multiple patients
UPDATE patients SET room = 'ANGGREK', bed = 'K.03.2', updated_at = NOW()
WHERE name ILIKE '%Budi%';

-- Bulk discharge (set to pulang)
UPDATE patients SET status = 'pulang', room = NULL, bed = NULL, updated_at = NOW()
WHERE id IN ('uuid-1', 'uuid-2');
```

### 3.4 Input Lab Results

**Via createVisit (atomic — recommended):**
```ts
import { createVisit } from '@/app/actions';

await createVisit({
  patientId: 'patient-uuid',
  visitDate: '2026-06-14',
  chiefComplaint: 'Demam 3 hari',
  diagnosisPrimary: 'Demam Berdarah Dengue',
  labs: [
    { testName: 'Hemoglobin', result: '10.5', unit: 'g/dL', referenceRange: '12.0-16.0', flag: 'low' },
    { testName: 'Trombosit', result: '85000', unit: '/uL', referenceRange: '150000-400000', flag: 'low' },
    { testName: 'Hematokrit', result: '42', unit: '%', referenceRange: '35-45', flag: 'normal' },
  ],
  medications: [
    { drugName: 'Paracetamol', dose: '150mg', frequency: '3x sehari', route: 'PO' },
  ],
});
```

**Via Direct SQL (add to existing visit):**
```sql
INSERT INTO patient_lab_results (visit_id, test_name, result, unit, reference_range, flag)
VALUES 
  ('visit-uuid', 'Hemoglobin', '10.5', 'g/dL', '12.0-16.0', 'low'),
  ('visit-uuid', 'Trombosit', '85000', '/uL', '150000-400000', 'low');
```

### 3.5 Create Visite / Visit Notes

**Via createVisit (full visit):**
```ts
import { createVisit } from '@/app/actions';

await createVisit({
  patientId: 'patient-uuid',
  visitDate: '2026-06-14',
  chiefComplaint: 'Demam 3 hari, muntah 2x',
  anamnesis: 'Demam sejak 3 hari lalu, tidak turun dengan paracetamol...',
  physicalExam: 'KU cukup, TTV dalam batas normal...',
  weightKg: '12',
  heightCm: '85',
  diagnosisPrimary: 'Demam Berdarah Dengue Grade I',
  diagnosisSecondary: 'Gastritis',
  therapy: 'IVFD RL 120cc/jam, Paracetamol 150mg PO 3x/hari',
  notes: 'Observasi ketat tanda syok',
  sections: {
    subjektif: 'Keluhan Utama: Demam 3 hari\n\nRiwayat: Demam tidak turun dengan antipiretik...',
    objektif: 'KU: Cukup\nTTV: TD 90/60, N 100, RR 24, S 38.5\n...',
    assesment: '- DBD Grade I\n- Gastritis',
    terapi: 'IVFD RL 120cc/jam\nParacetamol 150mg PO 3x/hari\nObservasi tanda syok',
  },
});
```

**Via updateVisit (edit existing visit):**
```ts
import { updateVisit } from '@/app/actions';

await updateVisit('visit-uuid', {
  diagnosisPrimary: 'DBD Grade II',
  therapy: 'IVFD RL 120cc/jam, Paracetamol 150mg PO 3x/hari, Transfusi Trombosit',
  notes: 'Trombosit turun, perlu observasi ketat',
});
```

**Via Direct SQL:**
```sql
-- Insert new visit
INSERT INTO patient_visits (patient_id, visit_date, chief_complaint, diagnosis_primary, therapy)
VALUES ('patient-uuid', '2026-06-14', 'Demam 3 hari', 'DBD Grade I', 'IVFD RL 120cc/jam');

-- Insert with sections (structured)
INSERT INTO patient_visits (patient_id, visit_date, sections)
VALUES ('patient-uuid', '2026-06-14', 
  '["Subjektif: Demam 3 hari...", "Objektif: KU cukup...", "Assesment: DBD Grade I", "Terapi: IVFD RL"]'::jsonb
);
```

### 3.6 Quick Reference — All Server Actions

| Action | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `createNote(formData)` | FormData: title, content, tags | void | Create note |
| `updateNote(id, formData)` | id, FormData | void | Update note |
| `deleteNote(id)` | id | void | Delete note |
| `togglePinNote(id)` | id | void | Toggle pin |
| `createFollowUp(formData)` | FormData: title, content, dueDate, recurrence | void | Create follow-up |
| `updateFollowUpStatus(id, status)` | id, status | void | Update status |
| `createPatient(data)` | object: name, room, bed, etc. | inserted patient | Create patient |
| `updatePatient(id, data)` | id, object | void | Update patient |
| `deletePatient(id)` | id | void | Delete patient |
| `createVisit(data)` | object: patientId, visitDate, labs[], medications[] | visit object | Create visit + children |
| `updateVisit(id, data)` | id, object | void | Update visit |
| `deleteVisit(id, patientId)` | id, patientId | void | Delete visit |
| `dischargePatient(id)` | id | void | Discharge (status=pulang) |
| `admitPatient(id)` | id | void | Readmit |
| `movePatientToRoom(id, room)` | id, room | void | Move patient |
| `updatePatientNotes(id, notes)` | id, notes | void | Update kanban notes |
| `bulkSyncPatients(input)` | input: patients[] | BulkSyncResult | AI sync operation |
| `globalSearch(query)` | query | {notes, followUps, patients} | Global search |

---

## 4. AI API ENDPOINTS

### 4.1 Chat — `/api/ai/chat`
```
POST /api/ai/chat
{ "message": "Apa interpretasi hasil lab ini?" }
→ { "reply": "..." }
```
Uses `TIANYUAI_API_KEY` + `TIANYUAI_BASE_URL`, model `gpt-5.4-mini`.

### 4.2 SOAP Generator — `/api/ai/soap`
```
POST /api/ai/soap
{
  "message": "Buatkan SOAP untuk pasien demam berdarah",
  "patient": {
    "name": "An. Budi",
    "medicalRecordNo": "123456",
    "birthDate": "2020-03-15",
    "room": "DAHLIA",
    "bed": "K.01.1",
    "weight": 12,
    "height": 85
  },
  "history": [{"role": "user", "content": "..."}]
}
→ { "mode": "live", "soap": "*An. Budi/123456/15-03-2020/DAHLIA K.01.1*\n\nSubjektif\n..." }
```
Uses `AI_BASE_URL` + `AI_API_KEY` + `AI_MODEL`. Returns formatted SOAP note.

### 4.3 Kanban Parse — `/api/ai/kanban-parse`
```
POST /api/ai/kanban-parse
{
  "message": "DAHLIA\nK.01.1 An. Budi 123456 15-03-2020\nDBD Grade I",
  "mode": "sync"  // or "edit"
}
→ { "mode": "live", "patients": [{ "room": "DAHLIA", "bed": "K.01.1", "name": "An. Budi", ... }] }
```
Parses free-text patient lists into structured JSON. Used by AI Sync feature on kanban.

### 4.4 Lab Extract (Vision) — `/api/lab-extract`
```
POST /api/lab-extract (multipart/form-data)
file: <image file>
visitId: "visit-uuid"
→ { "success": true, "visitId": "...", "extracted": [{ "testName": "Hemoglobin", ... }], "message": "..." }
```
Extracts lab parameters from images using vision model.

### 4.5 Vision Extract — `/api/vision-extract`
```
POST /api/vision-extract
{ "image": "data:image/jpeg;base64,...", "prompt": "Extract lab parameters" }
→ { "results": [...], "raw": {...} }
```
General-purpose vision extraction.

### 4.6 Save Lab Results — `/api/lab-extract/save`
```
POST /api/lab-extract/save
{
  "visitId": "visit-uuid",
  "results": [
    { "testName": "Hemoglobin", "result": "10.5", "unit": "g/dL", "referenceRange": "12-16", "flag": "low" }
  ]
}
→ { "success": true }
```
Saves extracted lab results to database.

### 4.7 Micromedex Routes
| Route | Description |
|-------|-------------|
| `POST /api/micromedex/search?q=paracetamol` | Search drug database |
| `GET /api/micromedex/drugs/[name]` | Get drug details |
| `GET /api/micromedex/dosing?drug=X&weight=12` | Get pediatric dosing |
| `POST /api/micromedex/ai-correct` | AI correction for drug info |

---

## 5. WORKFLOWS FOR AI AGENTS

### Workflow A: Input patient from morning report text
1. Call `POST /api/ai/kanban-parse` with the report text, `mode: "sync"`
2. Receive parsed patients array
3. Call server action `bulkSyncPatients({ patients: [...]})`
4. Returns summary of created/moved/discharged patients

### Workflow B: Create visit with labs
1. Get patient ID (search or create)
2. Call `createVisit()` with labs array included
3. Everything saved atomically

### Workflow C: Generate SOAP note
1. Call `POST /api/ai/soap` with patient context + clinical info
2. Receive formatted SOAP text
3. Either display to user or save via `createVisit()` or `updateVisit()`

### Workflow D: Add lab from photo
1. Call `POST /api/lab-extract` with image file
2. Receive extracted parameters
3. Call `POST /api/lab-extract/save` with visitId + results
4. OR pass results directly to `createVisit()` or `createPatientWithVisit()`

---

## 6. IMPORTANT NOTES

- **All server actions** in `src/app/actions.ts` use `revalidatePath()` after mutations — this triggers Next.js cache invalidation
- **Auth-required actions** check session cookie — non-authenticated calls will throw
- **Cascade deletes** — deleting a visit deletes its labs and medications
- **Sections field** — stored as JSONB array of strings, NOT object. Format: `["Subjektif: ...", "Objektif: ..."]`
- **Status values** — patients: `'rawat_inap'` or `'pulang'`; follow-ups: `'PENDING'` or `'COMPLETED'`
- **Recurrence** — completing a recurring follow-up auto-creates the next one
- **Room names** — stored as UPPERCASE strings (DAHLIA, ANGGREK, MELATI, SERUNI)
- **Bed format** — pattern `K.XX` or `K.XX.X` (e.g., K.01.1, K.03.2)

---

*Generated 2026-06-14 by Hermes Agent — Deep Audit Mode*
