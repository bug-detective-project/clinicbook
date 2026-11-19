import { request } from './http.ts';
import type { Appointment, Patient } from './types.ts';

export interface NewPatient {
  name: string;
  phone: string;
  email: string | null;
  birthDate: string | null;
  /** With or without the dots and the dash: the API keeps the digits. */
  cpf: string;
  healthPlan: string;
}

export function listPatients(): Promise<Patient[]> {
  return request('/api/patients');
}

export function getPatient(id: number): Promise<Patient> {
  return request(`/api/patients/${id}`);
}

export function createPatient(patient: NewPatient): Promise<Patient> {
  return request('/api/patients', { method: 'POST', body: patient });
}

export function removePatient(id: number): Promise<void> {
  return request(`/api/patients/${id}`, { method: 'DELETE' });
}

/** Every appointment of a patient, the most recent first. */
export function listPatientAppointments(id: number): Promise<Appointment[]> {
  return request(`/api/patients/${id}/appointments`);
}
