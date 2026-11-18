import { createApp } from './app.ts';
import { databasePath, port, readSettings } from './config.ts';
import { systemToday } from './dates.ts';
import { isEmpty, openDatabase, seedDatabase } from './db.ts';

const settings = readSettings(process.env);
const db = openDatabase(databasePath);
if (await isEmpty(db)) {
  await seedDatabase(db, settings.today ?? systemToday());
}

const app = createApp(db, settings, { logger: true });

await app.listen({ port, host: '0.0.0.0' });
console.log(`ClinicBook API listening on http://localhost:${port}`);
