import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

function calcScore(drug: any): number {
  const fields: Record<string, number> = {
    name: 1, drug_class: 1, uses_summary: 2, dosing_summary: 2, dosing_raw: 2,
    contraindications_raw: 1, interactions_raw: 1, neonatal_safe: 0.5, is_pediatric_approved: 0.5,
  };
  let score = 0;
  let max = 0;
  for (const [k, w] of Object.entries(fields)) {
    max += w;
    if (drug[k] && drug[k] !== '' && drug[k] !== 0) score += w;
  }
  return Math.round((score / max) * 1000) / 10;
}

function formatText(text: string | null): string {
  if (!text) return '';
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).slice(0, 10).map(p => `• ${p.slice(0, 500)}`).join('\n');
}

let _pool: Pool | null = null;
function getPool() {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 2,
      idleTimeoutMillis: 5000,
    });
    _pool.on('error', () => { _pool = null; });
  }
  return _pool;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  const pool = getPool();

  try {
    const drugRes = await pool.query(
      `SELECT * FROM micromedex_drugs WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [decoded]
    );
    if (!drugRes.rows.length) {
      return NextResponse.json({ error: `Drug '${decoded}' not found`, suggestions: [] }, { status: 404 });
    }
    const drug = drugRes.rows[0];

    const [indications, interactions, adjustments] = await Promise.all([
      pool.query('SELECT * FROM micromedex_indications WHERE drug_id = $1 ORDER BY indication', [drug.id]),
      pool.query('SELECT * FROM micromedex_drug_interactions WHERE drug_id = $1 ORDER BY severity', [drug.id]),
      pool.query('SELECT * FROM micromedex_dose_adjustments WHERE drug_id = $1 ORDER BY adjustment_type', [drug.id]),
    ]);

    const interactionCount = interactions.rowCount ?? 0;
    const adjustmentCount = adjustments.rowCount ?? 0;
    const kidsListRisk = ['antibiotic', 'antifungal', 'anticonvulsant', 'antipsychotic'].includes((drug.drug_class || '').toLowerCase());
    const monitoring: Record<string, string> = {
      vancomycin: 'AUC/MIC 400-600',
      gentamicin: 'Peak/Trough levels',
      amikacin: 'Peak/Trough levels',
      theophylline: 'Serum levels 5-15 mcg/mL',
      phenytoin: 'Free/total levels',
      lithium: 'Serum levels',
      digoxin: 'Levels 0.5-2 ng/mL',
    };

    return NextResponse.json({
      ...drug,
      indications_structured: indications.rows,
      interactions_structured: interactions.rows,
      dose_adjustments_structured: adjustments.rows,
      interactions_coverage: interactionCount > 0 ? 'partial' : 'not available',
      completeness_score: calcScore(drug),
      clinical_context: {
        kids_list_risk: kidsListRisk,
        interaction_count: interactionCount,
        neonatal_safe: Boolean(drug.neonatal_safe),
        pediatric_approved: Boolean(drug.is_pediatric_approved),
        has_adjustments: adjustmentCount > 0,
        contra_summary_length: (drug.contraindications_raw || '').length,
        requires_monitoring: monitoring[String(drug.name).toLowerCase()],
      },
      dosing_formatted: formatText(drug.dosing_raw),
      uses_formatted: formatText(drug.uses_raw),
      disclaimer: '⚠️ This is a reference tool. Always verify dosing with current clinical guidelines.',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}