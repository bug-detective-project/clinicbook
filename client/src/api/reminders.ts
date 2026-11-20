import { request } from './http.ts';
import type { Reminder } from './types.ts';

export interface Outbox {
  /** Whether the clinic sends reminders at all (the REMINDERS_ENABLED option of the server). */
  enabled: boolean;
  /** The day the next run reminds: tomorrow. */
  day: string;
  /** The appointments of that day that the next run will remind (none while the option is off). */
  due: DueReminder[];
  reminders: Reminder[];
}

export interface DueReminder {
  appointmentId: number;
  time: string;
  patientName: string;
  phone: string;
  doctorName: string;
}

export function getOutbox(): Promise<Outbox> {
  return request('/api/reminders');
}

export function sendReminders(): Promise<{ enabled: boolean; sent: number }> {
  return request('/api/reminders/run', { method: 'POST' });
}
