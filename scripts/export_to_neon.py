#!/usr/bin/env python3
"""Export Micromedex SQLite data to Neon-ready SQL INSERT statements."""
import sqlite3

conn = sqlite3.connect('../pedia-brain-drug-db/data/drugs_structured.db')
conn.row_factory = sqlite3.Row

drugs = conn.execute('SELECT * FROM drugs ORDER BY id').fetchall()
indications = conn.execute('SELECT * FROM indications').fetchall()
interactions = conn.execute('SELECT * FROM drug_interactions').fetchall()
adjustments = conn.execute('SELECT * FROM dose_adjustments').fetchall()

print(f"Drugs: {len(drugs)}, Indications: {len(indications)}, Interactions: {len(interactions)}, Adjustments: {len(adjustments)}")

def q(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    s = str(val).replace("'", "''")
    return f"'{s}'"

with open('micromedex-import.sql', 'w') as f:
    # Drugs
    f.write("TRUNCATE TABLE micromedex_drugs RESTART IDENTITY;\n")
    f.write("TRUNCATE TABLE micromedex_indications RESTART IDENTITY;\n")
    f.write("TRUNCATE TABLE micromedex_interactions RESTART IDENTITY;\n")
    f.write("TRUNCATE TABLE micromedex_adjustments RESTART IDENTITY;\n\n")

    vals = []
    for d in drugs:
        vals.append(f"({d['id']}, {q(d['name'])}, {q(d['drug_class'])}, {q(bool(d['is_pediatric_approved']))}, {q(bool(d['neonatal_safe']))}, {q(bool(d['is_discontinued']))}, {d['quality_score'] or 0}, {q(d['dosing_summary'])}, {q(d['uses_summary'])}, {q(d['contraindications_summary'])}, {q(d['interactions_summary'])}, {q(d['pharmacokinetics_summary'])}, {q(d['dosing_raw'])}, {q(d['uses_raw'])}, {q(d['contraindications_raw'])}, {q(d['interactions_raw'])}, {q(d['pharmacokinetics_raw'])})")
    f.write("INSERT INTO micromedex_drugs (id, name, drug_class, is_pediatric_approved, neonatal_safe, is_discontinued, quality_score, dosing_summary, uses_summary, contraindications_summary, interactions_summary, pharmacokinetics_summary, dosing_raw, uses_raw, contraindications_raw, interactions_raw, pharmacokinetics_raw) VALUES\n")
    f.write(",\n".join(vals) + ";\n\n")

    vals = []
    for i in indications:
        vals.append(f"({i['drug_id']}, {q(i['indication'])}, {q(i['route'])}, {i['age_min_months'] or 'NULL'}, {i['age_max_months'] or 'NULL'}, {i['weight_min_kg'] or 'NULL'}, {i['weight_max_kg'] or 'NULL'}, {i['dose_per_kg'] or 'NULL'}, {q(i['dose_unit'])}, {q(i['dose_frequency'])}, {i['max_single_dose'] or 'NULL'}, {i['max_daily_dose'] or 'NULL'}, {q(bool(i['is_loading_dose']))}, {q(bool(i['is_neonatal_dose']))}, {q(i['source_text'])})")
    f.write("INSERT INTO micromedex_indications (drug_id, indication, route, age_min_months, age_max_months, weight_min_kg, weight_max_kg, dose_per_kg, dose_unit, dose_frequency, max_single_dose, max_daily_dose, is_loading_dose, is_neonatal_dose, source_text) VALUES\n")
    f.write(",\n".join(vals) + ";\n\n")

    vals = []
    for i in interactions:
        vals.append(f"({i['drug_id']}, {q(i['interacting_drug_name'])}, {q(i['severity'])}, {q(i['mechanism'])}, {q(i['clinical_effect'])}, {q(i['management'])}, {q(i['evidence_level'])})")
    f.write("INSERT INTO micromedex_interactions (drug_id, interacting_drug_name, severity, mechanism, clinical_effect, management, evidence_level) VALUES\n")
    f.write(",\n".join(vals) + ";\n\n")

    vals = []
    for a in adjustments:
        vals.append(f"({a['drug_id']}, {q(a['adjustment_type'])}, {q(a['criteria'])}, {q(a['adjustment'])}, {q(a['age_group'])}, {q(a['source_text'])})")
    f.write("INSERT INTO micromedex_adjustments (drug_id, adjustment_type, criteria, adjustment, age_group, source_text) VALUES\n")
    f.write(",\n".join(vals) + ";\n")

conn.close()
print("Done! Check scripts/micromedex-import.sql")
