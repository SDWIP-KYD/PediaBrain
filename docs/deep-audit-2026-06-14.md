# PediaBrain Deep Audit — 2026-06-14

## 1. WEBSITE MAP — Full Structure

### Routes & Pages
| Route | Type | Description |
|-------|------|-------------|
| `/login` | Server | Single password auth (K95), 30-min session cookie |
| `/` (Dashboard) | Server | Follow-up calendar, sticky notes, pinned notes, today's follow-ups, AI chatbox, jadwal DPJP |
| `/notes` | Server | Notes CRUD table with pagination, search, pin, edit, delete, version history |
| `/follow-ups` | Server | Follow-up list with calendar view, status management, recurrence (weekly/monthly) |
| `/pasien` | Server | Full patient list with pagination, search, create dialog, AI input |
| `/pasien/kanban` | Client | Kanban board: drag-drop patients between rooms, AI sync, inline notes, DPJP filter |
| `/pasien/[id]` | Server+Client | Patient detail: visits, labs, medications, growth charts, AI overlay, add/edit visit |
| `/ai-toolbox` | Client | 4 tabs: Laporan Pasien, Notes, Clinical Assistant, General chat |
| `/soap` | Page | SOAP note generator |
| `/jadwal-dpjp` | Page | DPJP schedule management |
| `/tools` | Server | Tools index |
| `/tools/neonatologi` | Page | Neonatology tools |
| `/tools/nephro` | Page | Nephrology tools |
| `/tools/micromedex` | Page | Drug database (Micromedex) |
| `/tools/referensi-obat` | Page | Drug reference |
| `/tools/catatan-klinis` | Page | Clinical notes |
| `/tools/catatan-gizi` | Page | Nutrition notes |
| `/tools/gizi` | Page | Nutrition calculator |
| `/tools/picu` | Page | PICU tools |
| `/tools/sepsis` | Page | Sepsis protocol |

---

## 2. DATABASE SCHEMA (Complete)

### Tables

#### `patients`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | Auto-generated |
| medicalRecordNo | VARCHAR(50) | Nullable |
| name | VARCHAR(255) | NOT NULL |
| birthDate | DATE (string) | Nullable |
| sex | VARCHAR(1) | Nullable |
| parentName | VARCHAR(255) | Nullable |
| phone | VARCHAR(50) | Nullable |
| address | TEXT | Nullable |
| room | VARCHAR(50) | Nullable — kanban room assignment |
| bed | VARCHAR(20) | Nullable — bed number (K.XX.X) |
| status | VARCHAR(20) | Default "rawat_inap" |
| notes | TEXT | Nullable — inline kanban notes |
| dpjp | VARCHAR(255) | Nullable — treating physician |
| createdAt | TIMESTAMP | Default now() |
| updatedAt | TIMESTAMP | Default now() |

#### `patient_visits`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | Auto-generated |
| patientId | UUID FK → patients | Cascade delete |
| visitDate | DATE (string) | NOT NULL |
| chiefComplaint | TEXT | Nullable |
| anamnesis | TEXT | Nullable |
| physicalExam | TEXT | Nullable |
| weightKg | VARCHAR(10) | Nullable |
| heightCm | VARCHAR(10) | Nullable |
| headCircumferenceCm | VARCHAR(10) | Nullable |
| diagnosisPrimary | VARCHAR(255) | Nullable |
| diagnosisSecondary | TEXT | Nullable |
| therapy | TEXT | Nullable |
| notes | TEXT | Nullable |
| sections | JSONB (string[]) | Nullable — structured sections |
| createdAt | TIMESTAMP | Default now() |
| updatedAt | TIMESTAMP | Default now() |

#### `patient_lab_results`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | Auto-generated |
| visitId | UUID FK → patient_visits | Cascade delete |
| testName | VARCHAR(255) | NOT NULL |
| result | VARCHAR(255) | Nullable |
| unit | VARCHAR(50) | Nullable |
| referenceRange | VARCHAR(100) | Nullable |
| flag | VARCHAR(20) | "high"/"low"/"normal"/"unknown" |
| createdAt | TIMESTAMP | Default now() |

#### `patient_medications`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | Auto-generated |
| visitId | UUID FK → patient_visits | Cascade delete |
| drugName | VARCHAR(255) | NOT NULL |
| dose | VARCHAR(100) | Nullable |
| frequency | VARCHAR(100) | Nullable |
| duration | VARCHAR(100) | Nullable |
| route | VARCHAR(50) | Nullable |
| notes | TEXT | Nullable |
| createdAt | TIMESTAMP | Default now() |

#### `notes`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | Auto-generated |
| title | VARCHAR(255) | NOT NULL |
| content | TEXT | NOT NULL |
| tags | JSONB (string[]) | Default [] |
| isPinned | BOOLEAN | Default false |
| createdAt | TIMESTAMP | Default now() |
| updatedAt | TIMESTAMP | Default now() |

#### `follow_ups`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | Auto-generated |
| title | VARCHAR(255) | NOT NULL |
| content | TEXT | Nullable |
| dueDate | DATE (string) | NOT NULL |
| status | VARCHAR(20) | Default "PENDING" |
| recurrence | VARCHAR(20) | "none"/"weekly"/"monthly" |
| createdAt | TIMESTAMP | Default now() |

#### `sticky_notes`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | Auto-generated |
| content | TEXT | NOT NULL |
| createdAt | TIMESTAMP | Default now() |
| updatedAt | TIMESTAMP | Default now() |

#### `note_versions`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | Auto-generated |
| noteId | UUID FK → notes | Cascade delete |
| title | VARCHAR(255) | NOT NULL |
| content | TEXT | NOT NULL |
| tags | JSONB (string[]) | Default [] |
| createdAt | TIMESTAMP | Default now() |

#### `micromedex_drugs` + related tables
- `micromedex_drugs` — drug database with pediatric info
- `micromedex_indications` — dosing per indication
- `micromedex_drug_interactions` — drug-drug interactions
- `micromedex_dose_adjustments` — dose adjustments by condition

---

## 3. SERVER ACTIONS (src/app/actions.ts)

All actions are Server Actions (RSC). Auth-required actions check session cookie.

| Action | Auth? | Description |
|--------|-------|-------------|
| `createNote(formData)` | ✅ | Create note + version |
| `updateNote(id, formData)` | ✅ | Update note + version |
| `deleteNote(id)` | ✅ | Delete note |
| `togglePinNote(id)` | ✅ | Toggle pin |
| `createFollowUp(formData)` | ❌ | Create follow-up |
| `updateFollowUpStatus(id, status)` | ❌ | Update status, auto-create next if recurring |
| `deleteFollowUp(id)` | ❌ | Delete follow-up |
| `updateFollowUp(id, formData)` | ❌ | Full update |
| `autosaveFollowUp(id, data)` | ❌ | Autosave |
| `saveStickyNote(formData)` | ❌ | Save sticky |
| `createOrUpdateSticky(content)` | ❌ | Create or update latest sticky |
| `updateStickyNote(id, content)` | ❌ | Update sticky |
| `deleteStickyNote(id)` | ❌ | Delete sticky |
| `saveStickyToNote(id)` | ❌ | Convert sticky to note |
| `globalSearch(query)` | ❌ | Search notes, follow-ups, patients, diagnoses |
| `autosaveNote(id, data)` | ✅ | Autosave note |
| `saveNoteVersion(noteId, data)` | ✅ | Save note version |
| `getNoteVersions(noteId)` | ❌ | Get versions |
| `restoreNoteVersion(versionId)` | ✅ | Restore version |
| `createPatient(data)` | ❌ | Create patient |
| `updatePatient(id, data)` | ❌ | Update patient |
| `deletePatient(id)` | ❌ | Delete patient |
| `createVisit(data)` | ❌ | Create visit + labs + medications atomically |
| `updateVisit(id, data)` | ❌ | Update visit |
| `deleteVisit(id, patientId)` | ❌ | Delete visit |
| `movePatientToRoom(id, room)` | ❌ | Move patient between rooms |
| `getPatientsByRoom()` | ❌ | Get all rawat_inap patients with latest diagnosis |
| `updatePatientNotes(id, notes)` | ❌ | Update kanban inline notes |
| `dischargePatient(id)` | ❌ | Discharge (status=pulang, clear room/bed) |
| `admitPatient(id)` | ❌ | Readmit (status=rawat_inap) |
| `bulkSyncPatients(input)` | ❌ | AI sync: create/move/update/discharge based on AI parse |
| `bulkEditPatients(input)` | ❌ | Manual edit version of bulk sync |
| `undoBulkSync(patientIds)` | ❌ | Revert discharged patients |
| `findPatientByName(name)` | ❌ | Search patients |
| `createPatientWithVisit(data)` | ❌ | Create patient + visit + labs + meds atomically |

---

## 4. AI FUNCTIONS EVALUATION

### 4.1 API Routes Overview

| Route | Env Vars | Model | SSE Support | Status |
|-------|----------|-------|-------------|--------|
| `/api/ai/chat` | `TIANYUAI_*` | `gpt-5.4-mini` | ❌ No | ⚠️ INCONSISTENT |
| `/api/ai/soap` | `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` | `MiniMax-M2.7` (default) | ✅ Yes | ✅ Working |
| `/api/ai/kanban-parse` | `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` | `MiniMax-M2.7` (default) | ✅ Yes | ✅ Working |
| `/api/lab-extract` | `TIANYUAI_*` | `gpt-5.4-mini` | ❌ No (vision) | ⚠️ INCONSISTENT |
| `/api/vision-extract` | `AI_API_URL`, `AI_API_KEY`, `AI_MODEL` | `MiniMax-M3` (default) | ❌ No (vision) | ✅ Working |
| `/api/lab-extract/save` | DB only | N/A | N/A | ✅ Working |
| `/api/micromedex/*` | DB only (lazy pool) | N/A | N/A | ✅ Working |

### 4.2 Critical Issue: ENV VAR INCONSISTENCY

**3 different env var sets are used across routes:**
1. `TIANYUAI_API_KEY` + `TIANYUAI_BASE_URL` → used by `/api/ai/chat`, `/api/lab-extract`
2. `AI_BASE_URL` + `AI_API_KEY` + `AI_MODEL` → used by `/api/ai/soap`, `/api/ai/kanban-parse`
3. `AI_API_URL` + `AI_API_KEY` + `AI_MODEL` → used by `/api/vision-extract`

**Per skill docs**, current config should be:
- `TIANYUAI_BASE_URL` = `https://rt3q2cs.abc-tunnel.us/v1` (ngrok to 9router)
- `TIANYUAI_API_KEY` = set in Vercel
- Model: `gemincombo`

**Routes using `AI_BASE_URL`/`AI_API_KEY`** would be **broken** if only `TIANYUAI_*` vars are set in Vercel. This means:
- `/api/ai/soap` → ❌ BROKEN if only TIANYUAI vars exist
- `/api/ai/kanban-parse` → ❌ BROKEN if only TIANYUAI vars exist

### 4.3 SSE Handling

Routes `/api/ai/soap` and `/api/ai/kanban-parse` have proper `callAI()` helper with SSE parsing. Routes `/api/ai/chat` and `/api/lab-extract` do NOT have SSE parsing — they use `res.json()` directly. Since 9router returns `text/event-stream`, these routes may break when the backend is 9router.

### 4.4 Model Names

- `gpt-5.4-mini` — hardcoded in chat + lab-extract
- `MiniMax-M2.7` — default in soap + kanban-parse
- `MiniMax-M3` — default in vision-extract
- `gemincombo` — per skill docs, the actual working model

If 9router's backend is `gemini-3.1-flash-lite` but the model name passed is `gemincombo`, it works because 9router maps the alias. But routes passing `gpt-5.4-mini` or `MiniMax-M2.7` directly to 9router may return **503** (wrong model name).

---

## 5. DOUBLE-CLICK BUG — Root Cause Analysis

### 5.1 Notes Page (`/notes`)

**Component chain:** `notes/page.tsx` (server) → `data-table.tsx` (client) → `NoteViewDialog`

**Bug in `data-table.tsx` line 220-228:**
```tsx
useEffect(() => {
  if (initialOpenId && data.length > 0) {
    const note = data.find((n) => n.id === initialOpenId);
    if (note) {
      setViewingNote(note);
      setViewDialogOpen(true);
    }
  }
}, [initialOpenId, data]);
```

**Root cause:** This is actually correct for server-rendered data. The `data` prop comes from the server, so it should be available immediately. The bug is more likely in the `note-popup.tsx` hook.

### 5.2 NotePopup (`note-popup.tsx`)

**`useNoteFromUrl` hook (line 109-122):**
```tsx
export function useNoteFromUrl(notes: NoteRow[]) {
  const params = useSearchParams();
  const openId = params.get("open");
  const [note, setNote] = useState<NoteRow | null>(null);
  useEffect(() => {
    if (openId) {
      const found = notes.find((n) => n.id === openId);
      setNote(found ?? null);
    } else {
      setNote(null);
    }
  }, [openId, notes]);  // ← DEPENDENCY ON notes ARRAY
  return note;
}
```

**Root cause:** When a note is clicked from a dashboard or other page:
1. URL changes to `?open=<id>`
2. `useEffect` fires with `openId` set
3. BUT `notes` array hasn't been passed down yet (parent fetch not complete)
4. `notes.find()` returns undefined → `setNote(null)`
5. User sees empty dialog
6. Parent finishes fetching, `notes` updates
7. `useEffect` fires again → note found → shows content

**The "second click" triggers because:** The URL param is already set, so re-clicking fires the effect again with the now-loaded `notes` array.

### 5.3 Patient Visits (Edit/View)

**Component chain:** `pasien/[id]/page.tsx` (server) → `patient-detail-client.tsx` (client)

Visits are server-rendered with full data, so the double-click is less likely here. However, if the `sections` JSONB field is null/empty on first render and gets populated via JS, the expand/collapse behavior could cause a similar effect.

**In `patient-detail-client.tsx`:** The `openFullReport` function builds sections from `visit.sections` or falls back to individual fields. If `sections` is stored as a JSONB string that needs parsing, there could be a timing issue.

---

## 6. RECOMMENDATIONS

### P1 — Fix AI Env Var Inconsistency
All AI routes should use the SAME env vars. Either:
- Standardize on `AI_BASE_URL`/`AI_API_KEY`/`AI_MODEL` across ALL routes
- OR standardize on `TIANYUAI_BASE_URL`/`TIANYUAI_API_KEY` + `TIANYUAI_MODEL`
- Update Vercel env vars accordingly

### P1 — Fix SSE Handling
Routes `/api/ai/chat` and `/api/lab-extract` need SSE parsing added (like soap/kanban-parse have) since 9router returns `text/event-stream`.

### P2 — Fix Double-Click Bug (NotePopup)
Fix `useNoteFromUrl` to not depend on the `notes` array for the initial lookup. Options:
- Pass note data via URL/route state instead of searching array
- Add a loading state that waits for notes to arrive before rendering
- Use server-side lookup for the specific note ID

### P3 — AI Docs
Create comprehensive AI usage guide (in progress)

---

*Audit completed 2026-06-14 by Hermes Agent*
