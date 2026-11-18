import { expect } from '@playwright/test';
import type { APIRequestContext, Locator, Page } from '@playwright/test';

/** The day the QA run gives the app as today (CLINICBOOK_TODAY in run.ts), a Monday. */
export const TODAY = '2026-03-09';
export const TOMORROW = '2026-03-10';
/** The Monday of the week after: every doctor's day is still empty or almost empty. */
export const NEXT_MONDAY = '2026-03-16';

/** The sample doctors by id (server/src/seed.ts of the app). */
export const DOCTORS = {
  /** Monday to Friday, 08:00 to 12:00 and 14:00 to 17:00. */
  prado: { id: 1, name: 'Dr. Helena Prado' },
  /** Monday, Wednesday and Friday, 09:00 to 13:00. */
  oliveira: { id: 2, name: 'Dr. Marcos Oliveira' },
  /** Tuesday and Thursday, 13:00 to 18:00; Saturday, 08:00 to 12:00. */
  tanabe: { id: 3, name: 'Dr. Yuki Tanabe' },
} as const;

/** The sample patients by id. */
export const PATIENTS = {
  ana: { id: 1, name: 'Ana Beatriz Costa' },
  bruno: { id: 2, name: 'Bruno Carvalho' },
  camila: { id: 3, name: 'Camila Duarte' },
  davi: { id: 4, name: 'Davi Fernandes' },
  elisa: { id: 5, name: 'Elisa Gomes' },
  fabio: { id: 6, name: 'Fábio Henrique Lima' },
  giovana: { id: 7, name: 'Giovana Martins' },
  heitor: { id: 8, name: 'Heitor Nogueira' },
} as const;

/** The sample appointments of today, by id. */
export const TODAY_APPOINTMENTS = {
  ana: { id: 6, time: '08:00', status: 'confirmed', patient: PATIENTS.ana },
  bruno: { id: 7, time: '08:30', status: 'scheduled', patient: PATIENTS.bruno },
  davi: { id: 8, time: '09:00', status: 'scheduled', patient: PATIENTS.davi },
  elisa: { id: 9, time: '09:30', status: 'cancelled', patient: PATIENTS.elisa },
  camila: { id: 10, time: '10:00', status: 'scheduled', patient: PATIENTS.camila },
  fabio: { id: 11, time: '14:00', status: 'scheduled', patient: PATIENTS.fabio },
} as const;

export type Status = 'scheduled' | 'confirmed' | 'cancelled';

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  day: string;
  time: string;
  status: Status;
  reason: string;
}

export interface Patient {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  birthDate: string | null;
}

export async function appointmentsOf(request: APIRequestContext, day: string): Promise<Appointment[]> {
  const response = await request.get(`/api/appointments?day=${day}`);
  expect(response.status(), `GET /api/appointments?day=${day}`).toBe(200);
  return response.json();
}

export async function appointment(request: APIRequestContext, id: number): Promise<Appointment> {
  const response = await request.get(`/api/appointments/${id}`);
  expect(response.status(), `GET /api/appointments/${id}`).toBe(200);
  return response.json();
}

export interface Booking {
  patientId: number;
  doctorId: number;
  day: string;
  time: string;
  reason?: string;
}

/** Books an appointment through the API and gives it back. */
export async function book(request: APIRequestContext, booking: Booking): Promise<Appointment> {
  const response = await request.post('/api/appointments', { data: booking });
  expect(response.status(), `POST /api/appointments ${JSON.stringify(booking)}`).toBe(201);
  return response.json();
}

export async function listPatients(request: APIRequestContext): Promise<Patient[]> {
  const response = await request.get('/api/patients');
  expect(response.status(), 'GET /api/patients').toBe(200);
  return response.json();
}

/** Opens the agenda of a day and waits until its appointments are loaded (a day may have none). */
export async function openAgenda(page: Page, day: string = TODAY): Promise<void> {
  await page.goto(day === TODAY ? '/' : `/?day=${day}`);
  await expect(page.getByTestId('day-total')).toBeVisible();
}

/** The row of an appointment in the agenda. */
export function rowOf(page: Page, id: number): Locator {
  return page.getByTestId(`appointment-${id}`);
}

/** The line of the agenda that says how many appointments the day has. */
export function dayTotal(page: Page): Locator {
  return page.getByTestId('day-total');
}

/** Opens the list of patients and waits for it. */
export async function openPatients(page: Page): Promise<void> {
  await page.goto('/patients');
  await expect(page.getByRole('list', { name: 'Patients' })).toBeVisible();
}

/** The "..." button of a patient in the list of patients. */
export function menuButton(page: Page, patient: { name: string }): Locator {
  return page.getByRole('button', { name: `Actions for ${patient.name}` });
}

/** The open menu of a patient. */
export function menuOf(page: Page, patient: { name: string }): Locator {
  return page.getByRole('menu', { name: `Actions for ${patient.name}` });
}

/** Counts the requests the page makes to a path of the API (with an optional method). */
export function countRequests(page: Page, path: string, method?: string): () => number {
  let count = 0;
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === path && (method === undefined || request.method() === method)) {
      count += 1;
    }
  });
  return () => count;
}

/** Collects uncaught page errors (for example a TypeError that blanks the page). */
export function collectPageErrors(page: Page): Error[] {
  const errors: Error[] = [];
  page.on('pageerror', (error) => errors.push(error));
  return errors;
}

/** Waits until the browser has rendered at least two more frames. */
export async function settle(page: Page): Promise<void> {
  await page.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
  );
}
