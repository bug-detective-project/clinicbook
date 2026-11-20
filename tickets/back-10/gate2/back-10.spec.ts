import { expect, test } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { book, DOCTORS, PATIENTS, TODAY } from '../../../support/app.ts';

interface Item {
  id: number;
  day: string;
}

async function ids(request: APIRequestContext, url: string): Promise<number[]> {
  const response = await request.get(url);
  expect(response.status(), `GET ${url}`).toBe(200);
  return ((await response.json()) as Item[]).map((item) => item.id).sort((a, b) => a - b);
}

test.describe('Ticket back-10: the schedule has the appointments of its last day', () => {
  test('a schedule of one day has the appointments of that day', async ({ request }) => {
    const ofDay = await ids(request, `/api/appointments?day=${TODAY}`);

    expect(ofDay.length).toBeGreaterThan(0);
    expect(await ids(request, `/api/schedule?from=${TODAY}&to=${TODAY}`)).toEqual(ofDay);
  });

  test('a schedule of a week has the appointments of each of its days', async ({ request }) => {
    const days = ['2026-03-09', '2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13', '2026-03-14', '2026-03-15'];
    const ofDays = (await Promise.all(days.map((day) => ids(request, `/api/appointments?day=${day}`)))).flat().sort((a, b) => a - b);

    expect(await ids(request, '/api/schedule?from=2026-03-09&to=2026-03-14')).toEqual(
      (await Promise.all(days.slice(0, 6).map((day) => ids(request, `/api/appointments?day=${day}`)))).flat().sort((a, b) => a - b),
    );
    expect(await ids(request, '/api/schedule?from=2026-03-09&to=2026-03-15')).toEqual(ofDays);
  });

  test('the week of the agenda shows an appointment of its Sunday', async ({ page, request }) => {
    // Dr. Marcos Oliveira starts to work on Sundays, and Giovana books the first one of the week.
    const current = (await (await request.get(`/api/doctors/${DOCTORS.oliveira.id}`)).json()) as { name: string; specialty: string; hours: object[] };
    const changed = await request.patch(`/api/doctors/${DOCTORS.oliveira.id}`, {
      data: { name: current.name, specialty: current.specialty, hours: [...current.hours, { weekday: 7, startsAt: '09:00', endsAt: '13:00' }] },
    });
    expect(changed.status()).toBe(200);
    const sunday = await book(request, { patientId: PATIENTS.giovana.id, doctorId: DOCTORS.oliveira.id, day: '2026-03-15', time: '10:00', reason: 'Sunday visit' });

    await page.goto('/week?day=2026-03-11');

    await expect(page.getByTestId('day-2026-03-15')).toBeVisible();
    await expect(page.getByTestId(`week-appointment-${sunday.id}`)).toContainText(PATIENTS.giovana.name);
  });
});
