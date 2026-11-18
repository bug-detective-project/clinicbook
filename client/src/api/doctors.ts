import { request } from './http.ts';
import type { Doctor } from './types.ts';

export function listDoctors(): Promise<Doctor[]> {
  return request('/api/doctors');
}

/** The times a doctor is free on a day, as HH:MM, in order. */
export async function listSlots(doctorId: number, day: string): Promise<string[]> {
  const answer = await request<{ slots: string[] }>(`/api/doctors/${doctorId}/slots?day=${day}`);
  return answer.slots;
}
