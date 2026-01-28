import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pgPool } from '../database';

async function ensureMigrationsTable() {
  await pgPool.query(
    'CREATE TABLE IF NOT EXISTS schema_migrations (id text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())'
  );
}

async function getAppliedMigrationIds(): Promise<Set<string>> {
  const { rows } = await pgPool.query<{ id: string }>('SELECT id FROM schema_migrations');
  return new Set(rows.map((r) => r.id));
}

async function applyMigration(id: string, sql: string) {
  await pgPool.query('BEGIN');
  try {
    await pgPool.query(sql);
    await pgPool.query('INSERT INTO schema_migrations (id) VALUES ($1)', [id]);
    await pgPool.query('COMMIT');
  } catch (err) {
    await pgPool.query('ROLLBACK');
    throw err;
  }
}

async function main() {
  const migrationsDir = path.resolve(__dirname, '../database/migrations');

  await ensureMigrationsTable();
  const applied = await getAppliedMigrationIds();

  const files = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const id = file;
    if (applied.has(id)) continue;

    const sql = await readFile(path.join(migrationsDir, file), 'utf8');
    await applyMigration(id, sql);
  }

  await pgPool.end();
}

main().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  try {
    await pgPool.end();
  } catch {
    // ignore
  }
  process.exit(1);
});
