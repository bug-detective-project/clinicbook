import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { CamelCasePlugin, Kysely, SqliteDialect } from 'kysely';
import type { Generated } from 'kysely';
import { QueryError } from './errors.ts';
import { seedAppointments, seedDoctors, seedPatients, seedWorkingHours } from './seed.ts';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled';

interface DoctorsTable {
  id: Generated<number>;
  name: string;
  specialty: string;
}

/** A period a doctor works on a day of the week (1 is Monday, 7 is Sunday). A day may have two. */
interface WorkingHoursTable {
  id: Generated<number>;
  doctorId: number;
  weekday: number;
  startsAt: string;
  endsAt: string;
}

interface PatientsTable {
  id: Generated<number>;
  name: string;
  phone: string;
  email: string | null;
  birthDate: string | null;
  createdAt: string;
}

interface AppointmentsTable {
  id: Generated<number>;
  patientId: number;
  doctorId: number;
  day: string;
  time: string;
  status: AppointmentStatus;
  reason: string;
  createdAt: string;
}

/** The outbox: one row per reminder the clinic sent. */
interface RemindersTable {
  id: Generated<number>;
  appointmentId: number;
  phone: string;
  message: string;
  createdAt: string;
}

export interface Tables {
  doctors: DoctorsTable;
  workingHours: WorkingHoursTable;
  patients: PatientsTable;
  appointments: AppointmentsTable;
  reminders: RemindersTable;
}

/** The query builder: the columns are snake_case in the database and camelCase in the code. */
export type Db = Kysely<Tables>;

export const DEFAULT_DATABASE_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '../data/clinicbook.db');

const schema = `
  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS working_hours (
    id INTEGER PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id),
    weekday INTEGER NOT NULL CHECK (weekday BETWEEN 1 AND 7),
    starts_at TEXT NOT NULL,
    ends_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    birth_date TEXT,
    created_at TEXT NOT NULL
  );

  -- Two patients never share an e-mail; a patient may have none.
  CREATE UNIQUE INDEX IF NOT EXISTS patients_email ON patients (email);

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    doctor_id INTEGER NOT NULL REFERENCES doctors(id),
    day TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'cancelled')),
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS appointments_day ON appointments (day, time);

  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`;

export function openDatabase(path: string): Db {
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true });
  }
  const sqlite = new Database(path);
  sqlite.pragma('foreign_keys = ON');
  sqlite.exec(schema);
  return new Kysely<Tables>({
    dialect: new SqliteDialect({ database: sqlite }),
    plugins: [new CamelCasePlugin()],
  });
}

interface Runnable<Row> {
  compile(): { sql: string };
  execute(): Promise<Row[]>;
}

/** Runs a query and gives its rows. A query the database refuses is thrown as a QueryError. */
export async function rows<Row>(query: Runnable<Row>): Promise<Row[]> {
  try {
    return await query.execute();
  } catch (cause) {
    throw new QueryError(query.compile().sql, cause);
  }
}

/** Runs a query and gives its first row, or undefined when there is none. */
export async function first<Row>(query: Runnable<Row>): Promise<Row | undefined> {
  return (await rows(query))[0];
}

/** Empties the database and puts the sample data back, with the appointments around `today`. */
export async function seedDatabase(db: Db, today: string): Promise<void> {
  const createdAt = `${today}T08:00:00.000Z`;
  await db.transaction().execute(async (trx) => {
    for (const table of ['reminders', 'appointments', 'patients', 'workingHours', 'doctors'] as const) {
      await trx.deleteFrom(table).execute();
    }
    await trx.insertInto('doctors').values(seedDoctors).execute();
    await trx.insertInto('workingHours').values(seedWorkingHours).execute();
    await trx.insertInto('patients').values(seedPatients.map((patient) => ({ ...patient, createdAt }))).execute();
    await trx.insertInto('appointments').values(seedAppointments(today).map((appointment) => ({ ...appointment, createdAt }))).execute();
  });
}

/** True for a database that never had a doctor (a new installation). */
export async function isEmpty(db: Db): Promise<boolean> {
  return (await first(db.selectFrom('doctors').select('id').limit(1))) === undefined;
}
