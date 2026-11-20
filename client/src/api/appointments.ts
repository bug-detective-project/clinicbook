import { request } from './http.ts';
import type { Appointment } from './types.ts';

export interface Booking {
  patientId: number;
  doctorId: number;
  day: string;
  time: string;
  reason: string;
}

export function listToday(day: string): Promise<Appointment[]> {
  return request(`/api/appointments?day=${day}`);
}

export function getAppointment(id: number): Promise<Appointment> {
  return request(`/api/appointments/${id}`);
}

export function bookAppointment(booking: Booking): Promise<Appointment> {
  return request('/api/appointments', { method: 'POST', body: booking });
}

export function confirmAppointment(id: number): Promise<Appointment> {
  return request(`/api/appointments/${id}/confirm`, { method: 'POST' });
}

export function cancelAppointment(id: number): Promise<Appointment> {
  return request(`/api/appointments/${id}/cancel`, { method: 'POST' });
}

export function rescheduleAppointment(id: number, day: string, time: string): Promise<Appointment> {
  return request(`/api/appointments/${id}`, { method: 'PATCH', body: { day, time } });
}

/** The appointments from `from` to `to` (of one doctor, or of every one), the earliest first. */
export function listSchedule(from: string, to: string, doctorId?: number): Promise<Appointment[]> {
  const query = new URLSearchParams({ from, to });
  if (doctorId !== undefined) {
    query.set('doctor', String(doctorId));
  }
  return request(`/api/schedule?${query.toString()}`);
}
