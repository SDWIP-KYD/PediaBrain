import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(process.cwd(), '.env');
const env = fs.readFileSync(envPath, 'utf8');
const databaseUrl = env.match(/^DATABASE_URL="?(.*?)"?$/m)?.[1];
if (!databaseUrl) throw new Error('DATABASE_URL not found');
const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

function splitSql(sql) {
  const statements = [];
  let current = '';
  let inDollar = false;
  let dollarTag = '';
  for (let i = 0; i < sql.length; i++) {
    current += sql[i];
    if (!inDollar && sql.slice(i, i + 2) === '$$') {
      inDollar = true; dollarTag = '$$';
    } else if (inDollar && sql.slice(i, i + dollarTag.length) === dollarTag) {
      inDollar = false;
    }
    if (sql[i] === ';' && !inDollar) {
      const s = current.trim();
      if (s) statements.push(s);
      current = '';
    }
  }
  const s = current.trim();
  if (s) statements.push(s);
  return statements;
}

async function batchInsert(table, columns, rows, batchSize = 300) {
  if (!rows.length) return;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const values = [];
    const tuples = [];
    let p = 1;
    for (const row of batch) {
      tuples.push('(' + row.map(() => `$${p++}`).join(', ') + ')');
      values.push(...row);
    }
    await pool.query(`INSERT INTO ${table} (${columns.join(', ')}) VALUES ${tuples.join(', ')}`, values);
  }
}

async function main() {
  const migration = fs.readFileSync(path.join(__dirname, 'micromedex_neon_migration.sql'), 'utf8');
  for (const statement of splitSql(migration)) await pool.query(statement);

  await pool.query('TRUNCATE TABLE micromedex_dose_adjustments, micromedex_drug_interactions, micromedex_indications, micromedex_drugs RESTART IDENTITY CASCADE');

  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/drug-index.json'), 'utf8'));
  const idMap = new Map();

  const drugRows = data.drugs.map(d => [
    d.name, d.drug_class, Boolean(d.is_pediatric_approved), Boolean(d.neonatal_safe), Boolean(d.is_discontinued),
    d.quality_score, d.uses_summary, d.dosing_summary, d.dosing_raw, d.uses_raw, d.contraindications_summary,
    d.contraindications_raw, d.interactions_summary, d.interactions_raw, d.pharmacokinetics_summary, d.pharmacokinetics_raw
  ]);

  const res = await pool.query(
    `INSERT INTO micromedex_drugs (name, drug_class, is_pediatric_approved, neonatal_safe, is_discontinued, quality_score, uses_summary, dosing_summary, dosing_raw, uses_raw, contraindications_summary, contraindications_raw, interactions_summary, interactions_raw, pharmacokinetics_summary, pharmacokinetics_raw)
     VALUES ${data.drugs.map((_, i) => `($${i * 16 + 1}, $${i * 16 + 2}, $${i * 16 + 3}, $${i * 16 + 4}, $${i * 16 + 5}, $${i * 16 + 6}, $${i * 16 + 7}, $${i * 16 + 8}, $${i * 16 + 9}, $${i * 16 + 10}, $${i * 16 + 11}, $${i * 16 + 12}, $${i * 16 + 13}, $${i * 16 + 14}, $${i * 16 + 15}, $${i * 16 + 16})`).join(', ')}
     RETURNING id`,
    drugRows.flat()
  );
  data.drugs.forEach((d, i) => idMap.set(d.id, res.rows[i].id));
  console.log(`Inserted drugs: ${res.rows.length}`);

  const indRows = data.indications
    .map(i => idMap.get(i.drug_id) ? [idMap.get(i.drug_id), i.indication, i.route, i.dose_per_kg, i.dose_unit, i.dose_frequency, i.max_single_dose, i.max_daily_dose, i.source_text] : null)
    .filter(Boolean);
  await batchInsert('micromedex_indications', ['drug_id', 'indication', 'route', 'dose_per_kg', 'dose_unit', 'dose_frequency', 'max_single_dose', 'max_daily_dose', 'source_text'], indRows, 500);
  console.log(`Inserted indications: ${indRows.length}`);

  const ixRows = data.interactions
    .map(i => idMap.get(i.drug_id) ? [idMap.get(i.drug_id), i.interacting_drug_name, i.severity, i.mechanism, i.clinical_effect] : null)
    .filter(Boolean);
  await batchInsert('micromedex_drug_interactions', ['drug_id', 'interacting_drug_name', 'severity', 'mechanism', 'clinical_effect'], ixRows, 500);
  console.log(`Inserted interactions: ${ixRows.length}`);

  const adjRows = data.adjustments
    .map(a => idMap.get(a.drug_id) ? [idMap.get(a.drug_id), a.adjustment_type, a.criteria, a.adjustment, a.age_group, a.source_text] : null)
    .filter(Boolean);
  await batchInsert('micromedex_dose_adjustments', ['drug_id', 'adjustment_type', 'criteria', 'adjustment', 'age_group', 'source_text'], adjRows, 500);
  console.log(`Inserted adjustments: ${adjRows.length}`);

  const counts = await pool.query(`SELECT
    (SELECT COUNT(*) FROM micromedex_drugs) AS drugs,
    (SELECT COUNT(*) FROM micromedex_indications) AS indications,
    (SELECT COUNT(*) FROM micromedex_drug_interactions) AS interactions,
    (SELECT COUNT(*) FROM micromedex_dose_adjustments) AS adjustments`);
  console.log(JSON.stringify(counts.rows[0], null, 2));
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});