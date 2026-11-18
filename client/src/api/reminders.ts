import { request } from './http.ts';
import type { Reminder } from './types.ts';

export interface Outbox {
  /** Whether the clinic sends reminders at all (the REMINDERS_ENABLED option of the server). */
  enabled: boolean;
  reminders: Reminder[];
}

export function getOutbox(): Promise<Outbox> {
  return request('/api/reminders');
}

export function sendReminders(): Promise<{ enabled: boolean; sent: number }> {
  return request('/api/reminders/run', { method: 'POST' });
}
