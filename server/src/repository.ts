import { first, rows } from './db.ts';
import type { AppointmentStatus, Db } from './db.ts';
import type { Period } from './schedule.ts';

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
}

/** A period a doctor works on a day of the week (1 is Monday, 7 is Sunday). */
export interface Hours {
  weekday: number;
  startsAt: string;
  endsAt: string;
}

export interface DoctorWithHours extends Doctor {
  hours: Hours[];
}

export interface Patient {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  birthDate: string | null;
  /** The 11 digits of the patient's CPF. */
  cpf: string;
  /** The health plan, as the front desk writes it ("Private" for none). */
  healthPlan: string;
}

export interface PatientInput {
  name: string;
  phone: string;
  email: string | null;
  birthDate: string | null;
  cpf: string;
  healthPlan: string;
}

/** An appointment as the API answers it: with the names the screen shows. */
export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  day: string;
  time: string;
  status: AppointmentStatus;
  reason: string;
}

export interface AppointmentInput {
  patientId: number;
  doctorId: number;
  day: string;
  time: string;
  reason: string;
}

export function listDoctors(db: Db): Promise<Doctor[]> {
  return rows(db.selectFrom('doctors').select(['id', 'name', 'specialty']).orderBy('id'));
}

export function findDoctor(db: Db, id: number): Promise<Doctor | undefined> {
  return first(db.selectFrom('doctors').select(['id', 'name', 'specialty']).where('id', '=', id));
}

/** The periods a doctor works on a day of the week (1 is Monday), the earliest first. */
/** A doctor with every period of the week, by day and then by start. */
export async function findDoctorWithHours(db: Db, id: number): Promise<DoctorWithHours | undefined> {
  const doctor = await findDoctor(db, id);
  if (!doctor) {
    return undefined;
  }
  const hours = await rows(
    db
      .selectFrom('workingHours')
      .select(['weekday', 'startsAt', 'endsAt'])
      .where('doctorId', '=', id)
      .orderBy('weekday')
      .orderBy('startsAt'),
  );
  return { ...doctor, hours };
}

/** Registers a doctor with its week of hours, all or nothing. */
export async function createDoctor(db: Db, doctor: { name: string; specialty: string }, hours: Hours[]): Promise<DoctorWithHours> {
  const id = await db.transaction().execute(async (trx) => {
    const created = await first(trx.insertInto('doctors').values(doctor).returning('id'));
    if (hours.length > 0) {
      await rows(trx.insertInto('workingHours').values(hours.map((period) => ({ doctorId: created!.id, ...period }))));
    }
    return created!.id;
  });
  return (await findDoctorWithHours(db, id))!;
}

/** Changes the name and the specialty of a doctor, and puts `hours` in place of the old ones, all or nothing. */
export async function updateDoctor(db: Db, id: number, doctor: { name: string; specialty: string }, hours: Hours[]): Promise<DoctorWithHours> {
  await db.transaction().execute(async (trx) => {
    await rows(trx.updateTable('doctors').set(doctor).where('id', '=', id));
    await rows(trx.deleteFrom('workingHours').where('doctorId', '=', id));
    if (hours.length > 0) {
      await rows(trx.insertInto('workingHours').values(hours.map((period) => ({ doctorId: id, ...period }))));
    }
  });
  return (await findDoctorWithHours(db, id))!;
}

export function workingPeriods(db: Db, doctorId: number, weekday: number): Promise<Period[]> {
  return rows(
    db
      .selectFrom('workingHours')
      .select(['startsAt', 'endsAt'])
      .where('doctorId', '=', doctorId)
      .where('weekday', '=', weekday)
      .orderBy('startsAt'),
  );
}

const PATIENT_COLUMNS = ['id', 'name', 'phone', 'email', 'birthDate', 'cpf', 'healthPlan'] as const;

export function listPatients(db: Db): Promise<Patient[]> {
  return rows(db.selectFrom('patients').select(PATIENT_COLUMNS).orderBy('name'));
}

/** True when a patient (other than `exceptId`) already has this CPF (its 11 digits). */
export async function cpfInUse(db: Db, cpf: string, exceptId?: number): Promise<boolean> {
  const owner = await first(db.selectFrom('patients').select('id').where('cpf', '=', cpf));
  return owner !== undefined && owner.id !== exceptId;
}

export function findPatient(db: Db, id: number): Promise<Patient | undefined> {
  return first(db.selectFrom('patients').select(PATIENT_COLUMNS).where('id', '=', id));
}

export async function createPatient(db: Db, input: PatientInput): Promise<Patient> {
  const created = await first(
    db
      .insertInto('patients')
      .values({ ...input, createdAt: new Date().toISOString() })
      .returning(PATIENT_COLUMNS),
  );
  return created!;
}

export async function updatePatient(db: Db, id: number, input: PatientInput): Promise<Patient> {
  const updated = await first(db.updateTable('patients').set(input).where('id', '=', id).returning(PATIENT_COLUMNS));
  return updated!;
}

export async function deletePatient(db: Db, id: number): Promise<void> {
  await rows(db.deleteFrom('patients').where('id', '=', id));
}

function appointments(db: Db) {
  return db
    .selectFrom('appointments')
    .innerJoin('patients', 'patients.id', 'appointments.patientId')
    .innerJoin('doctors', 'doctors.id', 'appointments.doctorId')
    .select([
      'appointments.id',
      'appointments.patientId',
      'patients.name as patientName',
      'appointments.doctorId',
      'doctors.name as doctorName',
      'appointments.day',
      'appointments.time',
      'appointments.status',
      'appointments.reason',
    ]);
}

/** The appointments of a day, the earliest first. */
export function listAppointmentsOfDay(db: Db, day: string): Promise<Appointment[]> {
  return rows(appointments(db).where('appointments.day', '=', day).orderBy('appointments.time').orderBy('appointments.id'));
}

/** The appointments from `from` to `to` (of one doctor, or of all), the earliest first. */
export function listAppointmentsBetween(db: Db, from: string, to: string, doctorId?: number): Promise<Appointment[]> {
  let query = appointments(db).where('appointments.day', '>=', from).where('appointments.day', '<=', to);
  if (doctorId !== undefined) {
    query = query.where('appointments.doctorId', '=', doctorId);
  }
  return rows(query.orderBy('appointments.day').orderBy('appointments.time').orderBy('appointments.id'));
}

/** Every appointment of a patient, the most recent first. */
export function listAppointmentsOfPatient(db: Db, patientId: number): Promise<Appointment[]> {
  return rows(
    appointments(db)
      .where('appointments.patientId', '=', patientId)
      .orderBy('appointments.day', 'desc')
      .orderBy('appointments.time', 'desc'),
  );
}

export function findAppointment(db: Db, id: number): Promise<Appointment | undefined> {
  return first(appointments(db).where('appointments.id', '=', id));
}

export async function createAppointment(db: Db, input: AppointmentInput): Promise<Appointment> {
  const created = await first(
    db
      .insertInto('appointments')
      .values({ ...input, status: 'scheduled', createdAt: new Date().toISOString() })
      .returning('id'),
  );
  return (await findAppointment(db, created!.id))!;
}

export async function setAppointmentStatus(db: Db, id: number, status: AppointmentStatus): Promise<Appointment> {
  await rows(db.updateTable('appointments').set({ status }).where('id', '=', id));
  return (await findAppointment(db, id))!;
}

/** Moves an appointment to another day and time. It waits for a new confirmation of the patient. */
export async function moveAppointment(db: Db, id: number, day: string, time: string): Promise<Appointment> {
  await rows(db.updateTable('appointments').set({ day, time, status: 'scheduled' }).where('id', '=', id));
  return (await findAppointment(db, id))!;
}

/** The times of a doctor's day that an appointment holds; a cancelled appointment holds none. */
export async function bookedTimes(db: Db, doctorId: number, day: string): Promise<string[]> {
  const booked = await rows(
    db
      .selectFrom('appointments')
      .select('time')
      .where('doctorId', '=', doctorId)
      .where('day', '=', day)
      .where('status', '!=', 'cancelled'),
  );
  return booked.map((row) => row.time);
}
