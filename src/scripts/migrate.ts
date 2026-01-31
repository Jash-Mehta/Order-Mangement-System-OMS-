import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pgPool } from '../database';
import { TABLES } from '../database/table_name';

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

async function printTableSchema(tableName: string) {
  const { rows } = await pgPool.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position
  `, [tableName]);

  console.log(`\n📐 Schema for table: ${tableName}`);
  console.table(rows);
}

async function printTableData(tableName: string) {
  const { rows } = await pgPool.query(`SELECT * FROM ${tableName} LIMIT 10`);
  console.log(`\n📊 Data from table: ${tableName}`);
  console.table(rows);
}

async function main() {
  const migrationsDir = path.resolve(__dirname, '../database/migrations');

  await ensureMigrationsTable();
  const applied = await getAppliedMigrationIds();

  const files = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const id = file;
    if (applied.has(id)) {
      console.log(`⏭️  Skipping migration: ${id}`);
      continue;
    }

    console.log(`🚀 Applying migration: ${id}`);


    const sql = await readFile(path.join(migrationsDir, file), 'utf8');
    await applyMigration(id, sql);
    console.log(`✅ Migration applied: ${id}`);
  }
  // await printTableData(TABLES.ORDERS);
  // await printTableData(TABLES.ORDERS_ITEMS);

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
