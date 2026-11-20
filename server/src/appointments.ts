import { isDay, weekdayOf } from './dates.ts';
import type { Db } from './db.ts';
import { InvalidError, NotFoundError } from './errors.ts';
import {
  createAppointment,
  findAppointment,
  findDoctor,
  findPatient,
  setAppointmentStatus,
  workingPeriods,
} from './repository.ts';
import type { Appointment, AppointmentInput } from './repository.ts';
import { assertTransition } from './rules.ts';
import { isWorkingTime } from './schedule.ts';

// The rules of the clinic about appointments. The routes call these functions and never write to
// the database themselves.

export async function requireAppointment(db: Db, id: number): Promise<Appointment> {
  const appointment = Number.isInteger(id) ? await findAppointment(db, id) : undefined;
  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }
  return appointment;
}

/** Throws a 400 unless the doctor exists and sees patients on that day, at that time, from today on. */
async function assertBookable(db: Db, today: string, doctorId: number, day: string, time: string): Promise<void> {
  if (!(await findDoctor(db, doctorId))) {
    throw new InvalidError('Choose a doctor of the clinic', { doctorId: 'Unknown doctor' });
  }
  if (!isDay(day)) {
    throw new InvalidError('The day must be a date, as YYYY-MM-DD', { day: 'Not a date' });
  }
  if (day < today) {
    throw new InvalidError('An appointment cannot be booked in the past', { day: 'In the past' });
  }
  const periods = await workingPeriods(db, doctorId, weekdayOf(day));
  if (!isWorkingTime(periods, time)) {
    throw new InvalidError('The doctor does not see patients at this time', { time: 'Outside the working hours' });
  }
}

export async function bookAppointment(db: Db, today: string, input: AppointmentInput): Promise<Appointment> {
  if (!(await findPatient(db, input.patientId))) {
    throw new InvalidError('Choose a patient of the clinic', { patientId: 'Unknown patient' });
  }
  await assertBookable(db, today, input.doctorId, input.day, input.time);
  return createAppointment(db, input);
}

export async function confirmAppointment(db: Db, id: number): Promise<Appointment> {
  const appointment = await requireAppointment(db, id);
  assertTransition(appointment.status, 'confirmed');
  return setAppointmentStatus(db, id, 'confirmed');
}

export async function cancelAppointment(db: Db, id: number): Promise<Appointment> {
  const appointment = await requireAppointment(db, id);
  assertTransition(appointment.status, 'cancelled');
  return setAppointmentStatus(db, id, 'cancelled');
}
