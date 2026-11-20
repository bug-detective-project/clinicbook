import { DEFAULT_DATABASE_PATH } from './db.ts';

export interface Settings {
  /** A fixed "today" (YYYY-MM-DD) for tests and demos; without it the server uses the real date. */
  today?: string;
  /** Whether the clinic sends reminders to the patients of the next day. */
  remindersEnabled: boolean;
}

type Environment = Record<string, string | undefined>;

/**
 * An on/off option of the environment. Every value of the environment is a text, so the text is
 * compared: "true" and "1" turn the option on, "false" and "0" turn it off.
 */
export function readFlag(name: string, value: string | undefined, fallback: boolean): boolean {
  const text = (value ?? '').trim().toLowerCase();
  if (text === '') {
    return fallback;
  }
  if (text === 'true' || text === '1') {
    return true;
  }
  if (text === 'false' || text === '0') {
    return false;
  }
  throw new Error(`${name} must be "true" or "false", and it is "${value}"`);
}

export function readSettings(env: Environment): Settings {
  return {
    today: env.CLINICBOOK_TODAY || undefined,
    remindersEnabled: readFlag('REMINDERS_ENABLED', env.REMINDERS_ENABLED, true),
  };
}

export const port = Number(process.env.PORT ?? 3001);
export const databasePath = process.env.DATABASE_PATH ?? DEFAULT_DATABASE_PATH;
