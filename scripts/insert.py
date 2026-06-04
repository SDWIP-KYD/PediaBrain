#!/usr/bin/env python3
"""
PediaBrain Data Insertion Helper
Gua (Zai) pake ini buat input data klinis langsung ke Neon DB.

Usage:
  from insert import insert_patient, insert_visit, insert_note, insert_followup, find_patient

Or as CLI:
  python insert.py --mode=patient --data '{"name": "Test"}'
  python insert.py --mode=find --name "Bilqis"
"""

import os
import sys
import json
import argparse
from pathlib import Path
from urllib.parse import urlparse

try:
    import pg8000.dbapi as pg
    HAS_PG = True
except ImportError:
    HAS_PG = False


# ---------- DB Connection ----------

def load_db_url():
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("DATABASE_URL="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ.get("DATABASE_URL")


def parse_url(url: str):
    p = urlparse(url)
    dbname = p.path.lstrip("/")
    return {
        "host": p.hostname,
        "port": p.port or 5432,
        "database": dbname,
        "user": p.username,
        "password": p.password,
        "ssl_context": True,
    }


def connect():
    if not HAS_PG:
        raise SystemExit("pg8000 not installed. Run: pip install pg8000")
    url = load_db_url()
    if not url:
        raise SystemExit("DATABASE_URL not found in .env or env vars")
    return pg.connect(**parse_url(url))


def query_one(sql, params=()):
    with connect() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        row = cur.fetchone()
        cols = [d[0] for d in cur.description] if cur.description else []
        cur.close()
        return dict(zip(cols, row)) if row else None


def query_all(sql, params=()):
    with connect() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        rows = cur.fetchall()
        cols = [d[0] for d in cur.description] if cur.description else []
        cur.close()
        return [dict(zip(cols, r)) for r in rows]


def execute(sql, params=()):
    with connect() as conn:
        cur = conn.cursor()
        cur.execute(sql, params)
        conn.commit()
        cur.close()


# ---------- Insert Helpers ----------

def _camel_to_snake_keys(d: dict) -> dict:
    mapping = {
        "medicalRecordNo": "medical_record_no",
        "birthDate": "birth_date",
        "parentName": "parent_name",
        "patientId": "patient_id",
        "visitDate": "visit_date",
        "chiefComplaint": "chief_complaint",
        "physicalExam": "physical_exam",
        "diagnosisPrimary": "diagnosis_primary",
        "diagnosisSecondary": "diagnosis_secondary",
        "testName": "test_name",
        "referenceRange": "reference_range",
        "drugName": "drug_name",
        "isPinned": "is_pinned",
    }
    return {mapping.get(k, k): v for k, v in d.items()}


def insert_patient(data: dict) -> dict:
    n = _camel_to_snake_keys(data)
    fields = ["medical_record_no", "name", "birth_date", "sex", "parent_name", "phone", "address"]
    values = [n.get(f) or None for f in fields]
    placeholders = ", ".join(["%s"] * len(fields))
    sql = f"""
        INSERT INTO patients ({', '.join(fields)})
        VALUES ({placeholders})
        RETURNING id, name, medical_record_no, created_at;
    """
    with connect() as conn:
        cur = conn.cursor()
        cur.execute(sql, values)
        row = cur.fetchone()
        cols = [d[0] for d in cur.description]
        cur.close()
        conn.commit()
    return dict(zip(cols, row))


def insert_visit(data: dict) -> dict:
    n = _camel_to_snake_keys(data)
    patient_id = n.get("patient_id")
    if not patient_id:
        raise ValueError("patientId required")

    visit_fields = [
        "patient_id", "visit_date", "chief_complaint", "anamnesis", "physical_exam",
        "diagnosis_primary", "diagnosis_secondary", "therapy", "notes", "sections",
    ]
    visit_values = [n.get(f) or None for f in visit_fields]
    # sections is jsonb
    if visit_values[9] is not None and not isinstance(visit_values[9], str):
        visit_values[9] = json.dumps(visit_values[9])

    placeholders = ", ".join(["%s"] * len(visit_fields))
    sql_v = f"""
        INSERT INTO patient_visits ({', '.join(visit_fields)})
        VALUES ({placeholders})
        RETURNING id, visit_date, diagnosis_primary;
    """
    with connect() as conn:
        cur = conn.cursor()
        cur.execute(sql_v, visit_values)
        visit_row = cur.fetchone()
        cols = [d[0] for d in cur.description]
        visit = dict(zip(cols, visit_row))
        visit_id = visit["id"]

        # Labs
        for lab in data.get("labs", []) or []:
            ln = _camel_to_snake_keys(lab)
            cur.execute(
                """INSERT INTO patient_lab_results
                   (visit_id, test_name, result, unit, reference_range, flag)
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (visit_id, ln.get("test_name"), ln.get("result"),
                 ln.get("unit"), ln.get("reference_range"), ln.get("flag"))
            )

        # Medications
        for med in data.get("medications", []) or []:
            mn = _camel_to_snake_keys(med)
            cur.execute(
                """INSERT INTO patient_medications
                   (visit_id, drug_name, dose, frequency, duration, route, notes)
                   VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (visit_id, mn.get("drug_name"), mn.get("dose"),
                 mn.get("frequency"), mn.get("duration"),
                 mn.get("route"), mn.get("notes"))
            )

        cur.close()
        conn.commit()

    return visit


def insert_note(data: dict) -> dict:
    tags = data.get("tags")
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",") if t.strip()]
    elif tags is None:
        tags = []
    is_pinned = bool(data.get("isPinned") or data.get("is_pinned") or False)

    with connect() as conn:
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO notes (title, content, tags, is_pinned)
               VALUES (%s, %s, %s::jsonb, %s)
               RETURNING id, title, is_pinned, created_at""",
            (data["title"], data["content"], json.dumps(tags), is_pinned)
        )
        row = cur.fetchone()
        cols = [d[0] for d in cur.description]
        note = dict(zip(cols, row))
        # Save version
        cur.execute(
            """INSERT INTO note_versions (note_id, title, content, tags)
               VALUES (%s, %s, %s, %s::jsonb)""",
            (note["id"], data["title"], data["content"], json.dumps(tags))
        )
        cur.close()
        conn.commit()
    return note


def insert_followup(data: dict) -> dict:
    recurrence = data.get("recurrence", "none")
    if recurrence not in ("none", "weekly", "monthly"):
        recurrence = "none"

    with connect() as conn:
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO follow_ups (title, content, due_date, status, recurrence)
               VALUES (%s, %s, %s, 'PENDING', %s)
               RETURNING id, title, due_date, status""",
            (data["title"], data.get("content"), data["dueDate"], recurrence)
        )
        row = cur.fetchone()
        cols = [d[0] for d in cur.description]
        cur.close()
        conn.commit()
    return dict(zip(cols, row))


def find_patient(name: str = None, mrn: str = None) -> list:
    if not name and not mrn:
        return []
    if mrn:
        return query_all(
            "SELECT id, name, medical_record_no, birth_date, sex FROM patients WHERE medical_record_no ILIKE %s LIMIT 5",
            (f"%{mrn}%",)
        )
    return query_all(
        "SELECT id, name, medical_record_no, birth_date, sex FROM patients WHERE name ILIKE %s LIMIT 5",
        (f"%{name}%",)
    )


# ---------- CLI ----------

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", required=True, choices=["patient", "visit", "note", "followup", "find"])
    parser.add_argument("--data", help="JSON data string")
    parser.add_argument("--patient-id", dest="patient_id")
    parser.add_argument("--name", help="for find mode")
    parser.add_argument("--mrn", help="for find mode")
    args = parser.parse_args()

    try:
        if args.mode == "patient":
            result = insert_patient(json.loads(args.data))
        elif args.mode == "visit":
            data = json.loads(args.data)
            if args.patient_id:
                data["patientId"] = args.patient_id
            result = insert_visit(data)
        elif args.mode == "note":
            result = insert_note(json.loads(args.data))
        elif args.mode == "followup":
            result = insert_followup(json.loads(args.data))
        elif args.mode == "find":
            result = find_patient(name=args.name, mrn=args.mrn)

        print(json.dumps(result, indent=2, default=str))
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)
