import { request } from './http.ts';
import type { Doctor, DoctorWithHours, Hours } from './types.ts';

export function listDoctors(): Promise<Doctor[]> {
  return request('/api/doctors');
}

/** The times a doctor is free on a day, as HH:MM, in order. */
export async function listSlots(doctorId: number, day: string): Promise<string[]> {
  const answer = await request<{ slots: string[] }>(`/api/doctors/${doctorId}/slots?day=${day}`);
  return answer.slots;
}

export function getDoctor(id: number): Promise<DoctorWithHours> {
  return request(`/api/doctors/${id}`);
}

/** Changes the name, the specialty and the whole week of hours of a doctor. */
export function updateDoctor(id: number, doctor: { name: string; specialty: string; hours: Hours[] }): Promise<DoctorWithHours> {
  return request(`/api/doctors/${id}`, { method: 'PATCH', body: doctor });
}
