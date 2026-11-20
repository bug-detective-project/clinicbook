import type { Settings } from './config.ts';
import type { Db } from './db.ts';

/** What every route needs: the database, the settings and the date the server calls today. */
export interface Context {
  db: Db;
  settings: Settings;
  today: () => string;
}
