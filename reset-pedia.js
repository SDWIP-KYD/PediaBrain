const { Client } = require('pg');
const fs = require('fs');
const c = new Client({
  connectionString: 'postgresql://neondb_owner:npg_gFbK8SXINTE7@ep-misty-unit-apvlk7bh.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: true }
});

(async () => {
  try {
    await c.connect();
    console.log('Connected');

    // 1) Backup
    console.log('=== STEP 1: BACKUP ===');
    const backup = {};
    for (const t of ['patients', 'patient_visits', 'patient_lab_results', 'patient_medications', 'sticky_notes', 'notes', 'note_versions']) {
      const r = await c.query(`SELECT * FROM "${t}"`);
      backup[t] = r.rows;
      console.log(`  ${t}: ${r.rows.length} rows backed up`);
    }
    const backupPath = `/home/lenovo/Sync/Seno/Hermes-Outputs/pediabrain-backup-${new Date().toISOString().slice(0,10)}.json`;
    fs.mkdirSync('/home/lenovo/Sync/Seno/Hermes-Outputs', { recursive: true });
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    console.log(`  Backup saved: ${backupPath}`);
    console.log(`  Size: ${(fs.statSync(backupPath).size / 1024).toFixed(1)} KB`);

    // 2) Pre-delete
    console.log('\n=== STEP 2: PRE-DELETE COUNTS ===');
    const before = {};
    for (const t of ['patients','patient_visits','patient_lab_results','patient_medications','sticky_notes','notes','note_versions']) {
      const r = await c.query(`SELECT COUNT(*) FROM "${t}"`);
      before[t] = parseInt(r.rows[0].count);
      console.log(`  ${t.padEnd(22)} ${before[t]}`);
    }

    // 3) DELETE
    console.log('\n=== STEP 3: DELETE ===');
    await c.query('BEGIN');
    try {
      await c.query(`TRUNCATE TABLE
        "patient_medications",
        "patient_lab_results",
        "patient_visits",
        "patients",
        "sticky_notes"
      CASCADE`);
      await c.query('COMMIT');
      console.log('  TRUNCATE + CASCADE committed');
    } catch (e) {
      await c.query('ROLLBACK');
      console.log('  ROLLBACK:', e.message);
      throw e;
    }

    // 4) Verify
    console.log('\n=== STEP 4: POST-DELETE ===');
    for (const t of ['patients','patient_visits','patient_lab_results','patient_medications','sticky_notes','notes','note_versions','follow_ups','micromedex_drugs','micromedex_indications','micromedex_drug_interactions','micromedex_dose_adjustments']) {
      const r = await c.query(`SELECT COUNT(*) FROM "${t}"`);
      const after = parseInt(r.rows[0].count);
      const was = before[t] !== undefined ? before[t] : '?';
      const flag = (before[t] && after === 0) ? 'DELETED' : ((t === 'notes' || t === 'note_versions' || t.startsWith('micromedex_') || t === 'follow_ups') ? 'KEPT' : '');
      console.log(`  ${flag.padEnd(8)} ${t.padEnd(30)} ${String(after).padStart(4)} (was ${was})`);
    }

    // 5) Notes check
    console.log('\n=== STEP 5: NOTES SURVIVED ===');
    const nc = await c.query("SELECT title, is_pinned FROM notes ORDER BY is_pinned DESC, updated_at DESC LIMIT 15");
    nc.rows.forEach((r, i) => console.log(`  ${r.is_pinned ? '📌' : '  '} ${i+1}. ${r.title}`));

    await c.end();
    console.log('\nDONE');
  } catch (e) {
    try { await c.query('ROLLBACK'); } catch {}
    console.error('ERROR:', e.message || JSON.stringify(e));
    console.error('NO DATA DELETED (rolled back)');
    process.exit(1);
  }
})();
