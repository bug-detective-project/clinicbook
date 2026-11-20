import { expect, test } from '@playwright/test';
import { PATIENTS } from '../../../support/app.ts';

interface Patient {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  birthDate: string | null;
  healthPlan: string;
}

test.describe('Ticket back-11: a change of a patient keeps the fields it does not send', () => {
  test('changing only the health plan keeps the e-mail and the birth date', async ({ request }) => {
    const before = (await (await request.get(`/api/patients/${PATIENTS.ana.id}`)).json()) as Patient;

    const response = await request.patch(`/api/patients/${PATIENTS.ana.id}`, { data: { healthPlan: 'Amparo Vida' } });

    expect(response.status()).toBe(200);
    const after = (await (await request.get(`/api/patients/${PATIENTS.ana.id}`)).json()) as Patient;
    expect(after).toEqual({ ...before, healthPlan: 'Amparo Vida' });
  });

  test('changing only the phone keeps everything else', async ({ request }) => {
    const before = (await (await request.get(`/api/patients/${PATIENTS.bruno.id}`)).json()) as Patient;

    const response = await request.patch(`/api/patients/${PATIENTS.bruno.id}`, { data: { phone: '11 97777-2099' } });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ...before, phone: '11 97777-2099' });
  });

  test('an e-mail sent as null is cleared, and the birth date stays', async ({ request }) => {
    const before = (await (await request.get(`/api/patients/${PATIENTS.davi.id}`)).json()) as Patient;

    const response = await request.patch(`/api/patients/${PATIENTS.davi.id}`, { data: { email: null } });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ...before, email: null });
  });
});
