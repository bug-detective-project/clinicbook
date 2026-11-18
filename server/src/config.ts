import { DEFAULT_DATABASE_PATH } from './db.ts';

export interface Settings {
  /** A fixed "today" (YYYY-MM-DD) for tests and demos; without it the server uses the real date. */
  today?: string;
  /** Whether the clinic sends reminders to the patients of the next day. */
  remindersEnabled: boolean;
}

type Environment = Record<string, string | undefined>;

export function readSettings(env: Environment): Settings {
  return {
    today: env.CLINICBOOK_TODAY || undefined,
    remindersEnabled: Boolean(env.REMINDERS_ENABLED ?? true),
  };
}

export const port = Number(process.env.PORT ?? 3001);
export const databasePath = process.env.DATABASE_PATH ?? DEFAULT_DATABASE_PATH;
