import { expect, test } from '@playwright/test';
import type { APIRequestContext, Page } from '@playwright/test';
import { appointmentsOf, DOCTORS, NEXT_MONDAY, PATIENTS, TODAY_APPOINTMENTS, TOMORROW } from '../../../support/app.ts';

async function freeTimes(request: APIRequestContext, doctorId: number, day: string): Promise<string[]> {
  const response = await request.get(`/api/doctors/${doctorId}/slots?day=${day}`);
  expect(response.status(), `GET /api/doctors/${doctorId}/slots?day=${day}`).toBe(200);
  return ((await response.json()) as { slots: string[] }).slots;
}

function bookingForm(doctorId: number, day: string, extra = ''): string {
  return `/appointments/new?patient=${PATIENTS.davi.id}&doctor=${doctorId}&day=${day}${extra}`;
}

async function offeredTimes(page: Page): Promise<string[]> {
  const group = page.getByRole('radiogroup', { name: 'Time' });
  await expect(group).toBeVisible();
  return group.getByRole('radio').evaluateAll((options) => options.map((option) => (option as HTMLInputElement).value));
}

test.describe('Ticket front-6: the time of an appointment is chosen among the free times', () => {
  test('the form offers one option per free time of the doctor on the day, in order', async ({ page, request }) => {
    const free = await freeTimes(request, DOCTORS.prado.id, TOMORROW);
    await page.goto(bookingForm(DOCTORS.prado.id, TOMORROW));

    expect(await offeredTimes(page)).toEqual(free);
    const group = page.getByRole('radiogroup', { name: 'Time' });
    // Tomorrow Dr. Helena Prado already sees patients at 09:00 and at 11:00.
    await expect(group.getByRole('radio', { name: '09:00' })).toHaveCount(0);
    await expect(group.getByRole('radio', { name: '11:00' })).toHaveCount(0);
    await expect(group.getByRole('radio', { name: '08:00' })).toBeVisible();
    await expect(group.getByRole('radio', { checked: true })).toHaveCount(0);
  });

  test('each option is labelled with its time, and choosing one marks only that one', async ({ page }) => {
    await page.goto(bookingForm(DOCTORS.prado.id, TOMORROW));
    const group = page.getByRole('radiogroup', { name: 'Time' });

    await group.getByRole('radio', { name: '15:00' }).check();
    await expect(group.getByRole('radio', { name: '15:00' })).toBeChecked();

    await group.getByRole('radio', { name: '16:30' }).check();
    await expect(group.getByRole('radio', { name: '16:30' })).toBeChecked();
    await expect(group.getByRole('radio', { checked: true })).toHaveCount(1);
  });

  test('the chosen time is the one that is booked', async ({ page, request }) => {
    await page.goto(bookingForm(DOCTORS.prado.id, TOMORROW));
    await page.getByRole('radiogroup', { name: 'Time' }).getByRole('radio', { name: '15:00' }).check();

    await page.getByRole('button', { name: 'Book' }).click();

    await expect(page.getByRole('heading', { level: 2, name: 'Tuesday, March 10' })).toBeVisible();
    const booked = (await appointmentsOf(request, TOMORROW)).filter((item) => item.patientId === PATIENTS.davi.id);
    expect(booked.map((item) => item.time)).toEqual(['15:00']);
    // The time just booked is not offered any more.
    await page.goto(bookingForm(DOCTORS.prado.id, TOMORROW));
    expect(await offeredTimes(page)).not.toContain('15:00');
  });

  test('a time that comes in the address is already chosen', async ({ page }) => {
    await page.goto(bookingForm(DOCTORS.prado.id, NEXT_MONDAY, '&time=10:30'));

    await expect(page.getByRole('radiogroup', { name: 'Time' }).getByRole('radio', { name: '10:30' })).toBeChecked();
  });

  test('the options can be chosen with the keyboard', async ({ page }) => {
    await page.goto(bookingForm(DOCTORS.prado.id, NEXT_MONDAY));
    const group = page.getByRole('radiogroup', { name: 'Time' });
    const [first, second] = await offeredTimes(page);

    await group.getByRole('radio', { name: first }).focus();
    await page.keyboard.press('Space');
    await expect(group.getByRole('radio', { name: first })).toBeChecked();

    await page.keyboard.press('ArrowRight');
    await expect(group.getByRole('radio', { name: second })).toBeChecked();
    await expect(group.getByRole('radio', { name: second })).toBeFocused();
  });

  test('a day the doctor does not work says so, and offers nothing', async ({ page }) => {
    // Dr. Marcos Oliveira does not work on Tuesdays.
    await page.goto(bookingForm(DOCTORS.oliveira.id, TOMORROW));

    await expect(page.getByText('No free times on this day.')).toBeVisible();
    await expect(page.getByRole('radiogroup')).toHaveCount(0);
    await expect(page.getByRole('radio')).toHaveCount(0);
  });

  test('changing the doctor changes the options', async ({ page, request }) => {
    await page.goto(bookingForm(DOCTORS.prado.id, NEXT_MONDAY));
    expect(await offeredTimes(page)).toEqual(await freeTimes(request, DOCTORS.prado.id, NEXT_MONDAY));

    await page.getByLabel('Doctor').selectOption(String(DOCTORS.oliveira.id));

    const free = await freeTimes(request, DOCTORS.oliveira.id, NEXT_MONDAY);
    await expect(page.getByRole('radiogroup', { name: 'Time' }).getByRole('radio')).toHaveCount(free.length);
    expect(await offeredTimes(page)).toEqual(free);
  });

  test('rescheduling uses the same options', async ({ page, request }) => {
    const { bruno } = TODAY_APPOINTMENTS;
    await page.goto(`/appointments/${bruno.id}/reschedule`);
    const group = page.getByRole('radiogroup', { name: 'Time' });
    await expect(group).toBeVisible();

    await group.getByRole('radio', { name: '16:00' }).check();
    await page.getByRole('button', { name: 'Reschedule' }).click();

    await expect(page.getByRole('heading', { level: 2, name: 'Monday, March 9' })).toBeVisible();
    const moved = (await appointmentsOf(request, '2026-03-09')).find((item) => item.id === bruno.id);
    expect(moved?.time).toBe('16:00');
  });
});
