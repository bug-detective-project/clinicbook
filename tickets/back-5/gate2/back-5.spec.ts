import { expect, test } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { book, DOCTORS, PATIENTS, TODAY, TODAY_APPOINTMENTS, TOMORROW } from '../../../support/app.ts';

interface Slots {
  day: string;
  slots: string[];
}

async function slots(request: APIRequestContext, doctorId: number, day: string): Promise<Slots> {
  const response = await request.get(`/api/doctors/${doctorId}/slots?day=${day}`);
  expect(response.status(), `GET /api/doctors/${doctorId}/slots?day=${day}`).toBe(200);
  return response.json();
}

const { prado, oliveira, tanabe } = DOCTORS;

test.describe('Ticket back-5: the free times of a doctor', () => {
  test('a day without appointments has every slot of both periods, in order', async ({ request }) => {
    // Dr. Helena Prado works 08:00 to 12:00 and 14:00 to 17:00; Tuesday the 17th is empty.
    expect(await slots(request, prado.id, '2026-03-17')).toEqual({
      day: '2026-03-17',
      slots: [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
      ],
    });
  });

  test('the last slot of a period is the one that ends with it', async ({ request }) => {
    // Dr. Yuki Tanabe works 13:00 to 18:00 on Thursdays; the 19th is empty.
    const free = (await slots(request, tanabe.id, '2026-03-19')).slots;

    expect(free[0]).toBe('13:00');
    expect(free.at(-1)).toBe('17:30');
    expect(free).toHaveLength(10);
  });

  test('the times that have an appointment are left out', async ({ request }) => {
    // Tomorrow Dr. Helena Prado sees patients at 09:00 and at 11:00.
    expect((await slots(request, prado.id, TOMORROW)).slots).toEqual([
      '08:00', '08:30', '09:30', '10:00', '10:30', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    ]);
  });

  test('the time of a cancelled appointment is free', async ({ request }) => {
    // Today Dr. Marcos Oliveira has 09:00 scheduled and 09:30 cancelled.
    expect((await slots(request, oliveira.id, TODAY)).slots).toEqual(['09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30']);

    expect((await request.post(`/api/appointments/${TODAY_APPOINTMENTS.davi.id}/cancel`)).status(), 'cancel 09:00').toBe(200);

    expect((await slots(request, oliveira.id, TODAY)).slots).toEqual([
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    ]);
  });

  test('a time leaves the list when it is booked', async ({ request }) => {
    await book(request, { patientId: PATIENTS.camila.id, doctorId: tanabe.id, day: TOMORROW, time: '17:30' });

    // 13:00 was taken already; 15:30 belongs to a cancelled appointment.
    expect((await slots(request, tanabe.id, TOMORROW)).slots).toEqual([
      '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
    ]);
  });

  test('a day the doctor does not work has no free time', async ({ request }) => {
    expect(await slots(request, oliveira.id, TOMORROW)).toEqual({ day: TOMORROW, slots: [] });
    expect((await slots(request, prado.id, '2026-03-15')).slots).toEqual([]);
  });

  test('a day that is over has no free time', async ({ request }) => {
    expect(await slots(request, prado.id, '2026-03-06')).toEqual({ day: '2026-03-06', slots: [] });
  });

  test('a doctor the clinic does not have is answered with 404', async ({ request }) => {
    const response = await request.get(`/api/doctors/999/slots?day=${TODAY}`);

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ error: 'Doctor not found' });
  });

  test('a request without a day, or with a day that is not a date, is answered with 400', async ({ request }) => {
    expect((await request.get(`/api/doctors/${prado.id}/slots`)).status(), 'without day').toBe(400);
    expect((await request.get(`/api/doctors/${prado.id}/slots?day=tomorrow`)).status(), 'day=tomorrow').toBe(400);
    expect((await request.get(`/api/doctors/${prado.id}/slots?day=2026-02-30`)).status(), 'day=2026-02-30').toBe(400);
  });

  test('every time the endpoint offers can be booked, and then the day is full', async ({ request }) => {
    // Dr. Yuki Tanabe works 08:00 to 12:00 on Saturdays, and has one appointment at 08:00 on the 14th.
    const free = (await slots(request, tanabe.id, '2026-03-14')).slots;
    expect(free).toEqual(['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30']);

    for (const time of free) {
      await book(request, { patientId: PATIENTS.elisa.id, doctorId: tanabe.id, day: '2026-03-14', time });
    }

    expect((await slots(request, tanabe.id, '2026-03-14')).slots).toEqual([]);
  });

  test('the booking form offers the free times and books one', async ({ page }) => {
    await page.goto(`/appointments/new?patient=${PATIENTS.giovana.id}&doctor=${prado.id}&day=2026-03-17`);
    const group = page.getByRole('radiogroup', { name: 'Time' });

    await expect(group.getByRole('radio')).toHaveCount(14);
    await group.getByRole('radio', { name: '14:30' }).check();
    await page.getByRole('button', { name: 'Book' }).click();

    await expect(page.getByRole('heading', { level: 2, name: 'Tuesday, March 17' })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Appointments' }).getByText(PATIENTS.giovana.name)).toBeVisible();
    expect((await slots(page.request, prado.id, '2026-03-17')).slots).not.toContain('14:30');
  });
});
