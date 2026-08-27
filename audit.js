const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_gFbK8SXINTE7@ep-misty-unit-apvlk7bh.c-7.us-east-1.aws.neon.tech/neondb',
  ssl: { rejectUnauthorized: true }
});

(async () => {
  try {
    await client.connect();
    const tables = ['patients', 'patient_visits', 'patient_lab_results', 'patient_medications',
                     'notes', 'note_versions', 'sticky_notes', 'follow_ups',
                     'micromedex_drugs', 'micromedex_indications', 'micromedex_drug_interactions',
                     'micromedex_dose_adjustments'];
    console.log("=== TABLE AUDIT ===\n");
    for (const t of tables) {
      const r = await client.query(`SELECT COUNT(*) FROM "${t}"`);
      let flag = '⚪';
      if (['patients','patient_visits','patient_lab_results','patient_medications'].includes(t)) flag = '🔴 PATIENT';
      else if (['notes','note_versions','sticky_notes'].includes(t)) flag = '🟡 NOTES';
      else if (t.startsWith('micromedex_')) flag = '🟢 KEEP';
      console.log(`  ${flag.padEnd(12)} ${t.padEnd(35)} ${String(r.rows[0].count).padStart(5)} rows`);
    }

    console.log("\n=== STICKY NOTES ===");
    const sticky = await client.query("SELECT id, content FROM sticky_notes");
    for (const r of sticky.rows) console.log(`  [${r.id.slice(0,8)}] ${r.content}`);

    console.log("\n=== NOTES (25) ===");
    const notes = await client.query("SELECT title, is_pinned, substring(content, 1, 60) FROM notes ORDER BY updated_at DESC");
    notes.rows.forEach((r, i) => {
      const p = r.is_pinned ? '📌' : '  ';
      console.log(`  ${p} ${String(i+1).padStart(2)}. ${r.title.slice(0,48).padEnd(48)} | ${r.substring.slice(0,55)}`);
    });

    console.log("\n=== NOTES WITH 'AKADEMIS' ===");
    const ak = await client.query("SELECT title, substring(content, 1, 100) FROM notes WHERE content ILIKE '%akademis%' OR title ILIKE '%akademis%'");
    for (const r of ak.rows) console.log(`  ${r.title.slice(0,40).padEnd(40)} | ${r.substring.slice(0,90)}`);

    console.log("\n=== UNIQUE TAGS ===");
    const tags = await client.query("SELECT tags FROM notes");
    const tagSet = new Set();
    for (const r of tags.rows) {
      let t = r.tags;
      if (typeof t === 'string') { try { t = JSON.parse(t); } catch { t = []; } }
      if (Array.isArray(t)) for (const x of t) tagSet.add(x);
    }
    console.log("  " + Array.from(tagSet).join(', '));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.end();
  }
})();
