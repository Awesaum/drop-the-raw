import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const migrationsDir = resolve(process.cwd(), 'migrations');

if (!existsSync(migrationsDir)) {
  console.log('ℹ No migrations directory found. Migration replay gate passed (clean baseline).');
  process.exit(0);
}

const files = readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

if (files.length === 0) {
  console.log('ℹ No SQL migrations present in migrations/. Clean baseline.');
  process.exit(0);
}

console.log(`▶ Replaying ${files.length} migration(s) into in-memory SQLite database...`);
const db = new DatabaseSync(':memory:');

for (const file of files) {
  const filePath = resolve(migrationsDir, file);
  const sql = readFileSync(filePath, 'utf8');
  console.log(`  Executing: ${file}`);
  db.exec(sql);
}

console.log('✔ All migrations replayed successfully with zero errors.');
db.close();
