import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

function calcScore(drug: any): number {
  const fields: Record<string, number> = {
    name: 1, drug_class: 1, uses_summary: 2, dosing_summary: 2, dosing_raw: 2,
    contraindications_raw: 1, interactions_raw: 1,
    neonatal_safe: 0.5, is_pediatric_approved: 0.5,
  };
  let score = 0;
  let max = 0;
  for (const [k, w] of Object.entries(fields)) {
    max += w;
    if (drug[k] && drug[k] !== '' && drug[k] !== 0) score += w;
  }
  return Math.round((score / max) * 1000) / 10;
}

// Lazy pool — recreate per cold start to avoid stale connections in serverless
let _pool: Pool | null = null;
function getPool() {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 2,
      idleTimeoutMillis: 5000,
    });
    _pool.on('error', () => { _pool = null; }); // auto-recreate on error
  }
  return _pool;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '20'), 50);

  if (!q.trim()) {
    return NextResponse.json({ results: [], total: 0 });
  }

  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT id, name, drug_class, is_pediatric_approved, neonatal_safe, is_discontinued, quality_score,
              substr(uses_summary, 1, 150) as uses_preview
       FROM micromedex_drugs
       WHERE LOWER(name) ILIKE LOWER($1)
          OR LOWER(drug_class) ILIKE LOWER($1)
          OR LOWER(uses_summary) ILIKE LOWER($1)
       ORDER BY
         CASE WHEN LOWER(name) = LOWER($1) THEN 0
              WHEN LOWER(name) LIKE LOWER($1) || '%' THEN 1
              ELSE 2 END,
         LENGTH(name) ASC
       LIMIT $2`,
      [`%${q}%`, limit]
    );

    const results = result.rows.map((r) => ({ ...r, completeness_score: calcScore(r) }));
    return NextResponse.json({ query: q, results, total: results.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, results: [], total: 0 }, { status: 500 });
  }
}