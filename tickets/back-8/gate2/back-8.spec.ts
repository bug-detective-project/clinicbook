import { expect, test } from '@playwright/test';
import { DOCTORS, TOMORROW } from '../../../support/app.ts';

interface DoctorWithHours {
  id: number;
  name: string;
  specialty: string;
  hours: { weekday: number; startsAt: string; endsAt: string }[];
}

async function doctor(request: import('@playwright/test').APIRequestContext, id: number): Promise<DoctorWithHours> {
  const response = await request.get(`/api/doctors/${id}`);
  expect(response.status(), `GET /api/doctors/${id}`).toBe(200);
  return response.json();
}

test.describe('Ticket back-8: a change the database refuses changes nothing of the doctor', () => {
  test('hours outside the day of the clinic are refused, and the doctor keeps every period it had', async ({ request }) => {
    const before = await doctor(request, DOCTORS.tanabe.id);

    // The clinic opens at 06:00: a period from 05:00 cannot be kept.
    const response = await request.patch(`/api/doctors/${DOCTORS.tanabe.id}`, {
      data: {
        name: 'Dr. Yuki Tanabe Mori',
        specialty: before.specialty,
        hours: [
          { weekday: 2, startsAt: '08:00', endsAt: '12:00' },
          { weekday: 4, startsAt: '05:00', endsAt: '09:00' },
        ],
      },
    });

    expect(response.status(), 'PATCH with a period from 05:00').toBeGreaterThanOrEqual(400);
    expect(await doctor(request, DOCTORS.tanabe.id)).toEqual(before);
  });

  test('after a refused change, the doctor still has free times to book', async ({ request }) => {
    const slots = async () => ((await (await request.get(`/api/doctors/${DOCTORS.prado.id}/slots?day=${TOMORROW}`)).json()) as { slots: string[] }).slots;
    const before = await slots();
    const current = await doctor(request, DOCTORS.prado.id);

    await request.patch(`/api/doctors/${DOCTORS.prado.id}`, {
      data: { name: current.name, specialty: current.specialty, hours: [{ weekday: 2, startsAt: '21:00', endsAt: '23:00' }] },
    });

    expect(before.length).toBeGreaterThan(0);
    expect(await slots()).toEqual(before);
  });
});
