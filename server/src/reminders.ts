import { addDays, formatDay } from './dates.ts';
import { rows } from './db.ts';
import type { Db } from './db.ts';

export interface Reminder {
  id: number;
  appointmentId: number;
  patientName: string;
  phone: string;
  message: string;
  createdAt: string;
}

/** The name of the clinic in the messages the patients get. */
const CLINIC = 'Vila Clara Clinic';

/**
 * A phone the way the message service dials it, without spaces, dashes or parentheses:
 * "(11) 98888-7777" is "11988887777".
 */
export function toDial(phone: string): string {
  const dial = phone.replace(/[\s()-]/g, '');
  if (!/^\+?\d+$/.test(dial)) {
    throw new Error(`A reminder cannot be sent to the phone "${phone}"`);
  }
  return dial;
}

export function reminderMessage(patientName: string, doctorName: string, day: string, time: string): string {
  const firstName = patientName.split(' ')[0];
  return `Hi ${firstName}, this is ${CLINIC}. You have an appointment with ${doctorName} on ${formatDay(day)} at ${time}. Reply C to confirm.`;
}

/** The reminders the clinic sent, the most recent first. */
export function listReminders(db: Db): Promise<Reminder[]> {
  return rows(
    db
      .selectFrom('reminders')
      .innerJoin('appointments', 'appointments.id', 'reminders.appointmentId')
      .innerJoin('patients', 'patients.id', 'appointments.patientId')
      .select([
        'reminders.id',
        'reminders.appointmentId',
        'patients.name as patientName',
        'reminders.phone',
        'reminders.message',
        'reminders.createdAt',
      ])
      .orderBy('reminders.id', 'desc'),
  );
}

/**
 * Sends the reminders that are due and gives how many went out. An appointment gets one reminder
 * only, and a cancelled appointment gets none. Either every reminder of the run is sent or none is.
 */
export async function sendReminders(db: Db, today: string): Promise<number> {
  // Reminders go out two days before the appointment.
  const day = addDays(today, 1);
  const due = await rows(
    db
      .selectFrom('appointments')
      .innerJoin('patients', 'patients.id', 'appointments.patientId')
      .innerJoin('doctors', 'doctors.id', 'appointments.doctorId')
      .leftJoin('reminders', 'reminders.appointmentId', 'appointments.id')
      .select([
        'appointments.id',
        'appointments.time',
        'patients.name as patientName',
        'patients.phone',
        'doctors.name as doctorName',
      ])
      .where('appointments.day', '=', day)
      .where('appointments.status', '!=', 'cancelled')
      .where('reminders.id', 'is', null)
      .orderBy('appointments.time'),
  );

  const createdAt = new Date().toISOString();
  const outgoing = due.map((appointment) => ({
    appointmentId: appointment.id,
    phone: toDial(appointment.phone),
    message: reminderMessage(appointment.patientName, appointment.doctorName, day, appointment.time),
    createdAt,
  }));
  if (outgoing.length > 0) {
    await rows(db.insertInto('reminders').values(outgoing));
  }
  return outgoing.length;
}
