import { first, rows } from './db.ts';
import type { AppointmentStatus, Db } from './db.ts';
import type { Period } from './schedule.ts';

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
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

/** True when a patient already has this CPF (its 11 digits). */
export async function cpfInUse(db: Db, cpf: string): Promise<boolean> {
  return (await first(db.selectFrom('patients').select('id').where('cpf', '=', cpf))) !== undefined;
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
