import { expect, test } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { book, DOCTORS, NEXT_MONDAY, PATIENTS } from '../../../support/app.ts';

const OUTSIDE = 'Outside the working hours';

/** The appointment of Dr. Helena Prado next Monday at `time`. */
async function nextMondayAt(request: APIRequestContext, time: string): Promise<number> {
  const list = (await (await request.get(`/api/appointments?day=${NEXT_MONDAY}`)).json()) as { id: number; doctorId: number; time: string }[];
  const found = list.find((item) => item.doctorId === DOCTORS.prado.id && item.time === time);
  expect(found, `an appointment of Dr. Helena Prado on ${NEXT_MONDAY} at ${time}`).toBeDefined();
  return found!.id;
}

test.describe('Ticket front-11: the edges of the working hours on the week of a doctor', () => {
  test('the first slot of a period is inside, and the time a period ends is outside', async ({ page, request }) => {
    // Next Monday, Dr. Helena Prado sees Heitor at 08:00, and Ana books 14:00; then the doctor's Monday ends at 14:00.
    await book(request, { patientId: PATIENTS.ana.id, doctorId: DOCTORS.prado.id, day: NEXT_MONDAY, time: '14:00', reason: 'Follow-up' });
    const start = await nextMondayAt(request, '08:00');
    const end = await nextMondayAt(request, '14:00');
    const current = (await (await request.get(`/api/doctors/${DOCTORS.prado.id}`)).json()) as { name: string; specialty: string; hours: { weekday: number }[] };
    const hours = [...current.hours.filter((period) => period.weekday !== 1), { weekday: 1, startsAt: '08:00', endsAt: '14:00' }];
    expect((await request.patch(`/api/doctors/${DOCTORS.prado.id}`, { data: { name: current.name, specialty: current.specialty, hours } })).status()).toBe(200);

    await page.goto(`/doctors/${DOCTORS.prado.id}`);
    await page.getByRole('button', { name: 'Next week' }).click();

    await expect(page.getByTestId(`week-appointment-${start}`)).toBeVisible();
    await expect(page.getByTestId(`week-appointment-${start}`)).not.toContainText(OUTSIDE);
    await expect(page.getByTestId(`week-appointment-${end}`)).toContainText(OUTSIDE);
  });

  test('an appointment in the middle of a period is inside', async ({ page, request }) => {
    const middle = await book(request, { patientId: PATIENTS.bruno.id, doctorId: DOCTORS.tanabe.id, day: '2026-03-17', time: '15:00', reason: 'Check' });

    await page.goto(`/doctors/${DOCTORS.tanabe.id}`);
    await page.getByRole('button', { name: 'Next week' }).click();

    await expect(page.getByTestId(`week-appointment-${middle.id}`)).toBeVisible();
    await expect(page.getByTestId(`week-appointment-${middle.id}`)).not.toContainText(OUTSIDE);
  });
});
