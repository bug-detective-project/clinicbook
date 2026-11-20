import { rmSync } from 'node:fs';
import { databasePath, readSettings } from '../config.ts';
import { systemToday } from '../dates.ts';
import { openDatabase, seedDatabase } from '../db.ts';

for (const suffix of ['', '-journal', '-wal', '-shm']) {
  rmSync(databasePath + suffix, { force: true });
}

const db = openDatabase(databasePath);
await seedDatabase(db, readSettings(process.env).today ?? systemToday());
await db.destroy();

console.log(`Database reset: ${databasePath}`);
