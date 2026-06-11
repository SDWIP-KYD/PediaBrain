import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { drug_name, weight_kg, age_months, route = 'PO', indication } = body;
    if (!drug_name || !weight_kg || Number(weight_kg) <= 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const drugRes = await pool.query(
      `SELECT * FROM micromedex_drugs WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [drug_name]
    );
    if (!drugRes.rows.length) {
      return NextResponse.json({ error: `Drug '${drug_name}' not found` }, { status: 404 });
    }

    const drug = drugRes.rows[0];
    const warnings: string[] = [];

    if (Number(age_months || 0) <= 1 && !drug.neonatal_safe) {
      warnings.push(`⚠️ ${drug.name} — neonatal safety not confirmed`);
    }
    if (!drug.is_pediatric_approved) {
      warnings.push(`⚠️ ${drug.name} — pediatric approval not established`);
    }
    if (['antibiotic', 'antifungal', 'anticonvulsant', 'antipsychotic'].includes((drug.drug_class || '').toLowerCase())) {
      warnings.push(`⚠️ ${drug.name} — KIDs List risk classification`);
    }

    const indicationRes = await pool.query(
      `SELECT * FROM micromedex_indications
       WHERE drug_id = $1 AND ($2 = '' OR route = $2 OR route = '' OR route IS NULL)
       ORDER BY dose_per_kg::numeric DESC NULLS LAST
       LIMIT 1`,
      [drug.id, route]
    );
    const row = indicationRes.rows[0];

    let calculated = null;
    let dosePerKg = null;
    let maxSingle = null;
    let maxDaily = null;

    if (row?.dose_per_kg) {
      const dose = Number(row.dose_per_kg);
      const total = dose * Number(weight_kg);
      calculated = total;
      dosePerKg = `${dose} ${row.dose_unit || 'mg'}/kg`;

      if (row.max_single_dose && total > Number(row.max_single_dose)) {
        warnings.push(`⚠️ Calculated (${total.toFixed(1)}) exceeds max single (${Number(row.max_single_dose).toFixed(1)})`);
        calculated = Number(row.max_single_dose);
      }
      maxSingle = row.max_single_dose ? `${row.max_single_dose} ${row.dose_unit || 'mg'}` : null;
      maxDaily = row.max_daily_dose ? `${row.max_daily_dose} ${row.dose_unit || 'mg'}/day` : null;
    }

    return NextResponse.json({
      drug_name: drug.name,
      indication: indication || row?.indication || null,
      route,
      weight_kg: Number(weight_kg),
      age_months: age_months ? Number(age_months) : null,
      calculated_dose: calculated ? `${Number(calculated).toFixed(1)} ${row?.dose_unit || 'mg'}` : null,
      dose_per_kg: dosePerKg,
      frequency: row?.dose_frequency || null,
      max_single_dose: maxSingle,
      max_daily_dose: maxDaily,
      warnings: warnings.length ? warnings : ['ℹ️ No dosing data found'],
      source_text: row?.source_text || null,
      disclaimer: '⚠️ This is a reference tool. Always verify dosing with current clinical guidelines.',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}