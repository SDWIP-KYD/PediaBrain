# Archived Scripts

These scripts were used for one-time data sync and verification operations during
the PediaBrain development phase (June 2026).

## Files

| File               | Purpose                                                                    | Date      |
| ------------------ | -------------------------------------------------------------------------- | --------- |
| `sync-pasien-*.ts` | Manual patient data sync from SIMRS sensus to PediaBrain DB (4 dated runs) | June 2026 |
| `verify-kanban.ts` | Verification of kanban patient board state after sync                      | June 2026 |

## Why archived?

Per the "My Patients" rework plan, patient data is now pulled **live** from SIMRS
via Lab Lookup → "Tambah ke Pasien" button, instead of bulk-sync scripts.
These scripts are kept for reference but are no longer needed for the new workflow.

## Running

```bash
# These scripts require DATABASE_URL env var
DATABASE_URL="your_neon_url" npx tsx scripts/archive/verify-kanban.ts
```
