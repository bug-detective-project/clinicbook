import { expect, test } from '@playwright/test';
import type { APIRequestContext, APIResponse } from '@playwright/test';
import { appointment, appointmentsOf, rowOf, TODAY, TODAY_APPOINTMENTS, TOMORROW } from '../../../support/app.ts';

const { ana, bruno, elisa, camila, fabio } = TODAY_APPOINTMENTS;

function reschedule(request: APIRequestContext, id: number, data: object): Promise<APIResponse> {
  return request.patch(`/api/appointments/${id}`, { data });
}

async function errorOf(response: APIResponse): Promise<string | undefined> {
  return ((await response.json()) as { error?: string }).error;
}

// Every appointment used here is with Dr. Helena Prado: Monday to Friday, 08:00 to 12:00 and 14:00 to 17:00.
test.describe('Ticket back-6: rescheduling an appointment', () => {
  test('a scheduled appointment moves to the new day and time', async ({ request }) => {
    const response = await reschedule(request, bruno.id, { day: TOMORROW, time: '15:00' });

    expect(response.status(), `PATCH /api/appointments/${bruno.id}`).toBe(200);
    expect(await response.json()).toMatchObject({
      id: bruno.id,
      day: TOMORROW,
      time: '15:00',
      status: 'scheduled',
      patientId: bruno.patient.id,
      patientName: bruno.patient.name,
      doctorId: 1,
      reason: 'Back pain',
    });
    expect((await appointmentsOf(request, TODAY)).map((item) => item.id)).not.toContain(bruno.id);
    expect((await appointmentsOf(request, TOMORROW)).map((item) => item.id)).toContain(bruno.id);
  });

  test('a confirmed appointment goes back to scheduled when it is moved', async ({ request }) => {
    const response = await reschedule(request, ana.id, { day: TODAY, time: '16:30' });

    expect(response.status()).toBe(200);
    expect(await appointment(request, ana.id)).toMatchObject({ day: TODAY, time: '16:30', status: 'scheduled' });
  });

  test('a cancelled appointment cannot be rescheduled', async ({ request }) => {
    const response = await reschedule(request, elisa.id, { day: '2026-03-11', time: '10:30' });

    expect(response.status()).toBe(409);
    expect(await errorOf(response)).toBe('A cancelled appointment cannot be rescheduled');
    expect(await appointment(request, elisa.id)).toMatchObject({ day: TODAY, time: elisa.time, status: 'cancelled' });
  });

  test('the new time has to be in the working hours of the doctor, as in a booking', async ({ request }) => {
    const lunch = await reschedule(request, camila.id, { day: TOMORROW, time: '12:30' });
    const saturday = await reschedule(request, camila.id, { day: '2026-03-14', time: '09:00' });
    const halfSlot = await reschedule(request, camila.id, { day: TOMORROW, time: '09:15' });

    expect(lunch.status(), '12:30, in the lunch break').toBe(400);
    expect(await errorOf(lunch)).toBe('The doctor does not see patients at this time');
    expect(saturday.status(), 'a Saturday').toBe(400);
    expect(halfSlot.status(), '09:15, in the middle of a slot').toBe(400);
    expect(await appointment(request, camila.id)).toMatchObject({ day: TODAY, time: camila.time, status: 'scheduled' });
  });

  test('the new day cannot be in the past, as in a booking', async ({ request }) => {
    const response = await reschedule(request, camila.id, { day: '2026-03-06', time: '09:00' });

    expect(response.status()).toBe(400);
    expect(await errorOf(response)).toBe('An appointment cannot be booked in the past');
    expect((await appointment(request, camila.id)).day).toBe(TODAY);
  });

  test('a request without the day or the time, or with a day that is not a date, is answered with 400', async ({ request }) => {
    const empty = await reschedule(request, camila.id, {});
    expect(empty.status(), 'an empty request').toBe(400);
    expect(Object.keys(((await empty.json()) as { fields?: object }).fields ?? {}).sort()).toEqual(['day', 'time']);

    expect((await reschedule(request, camila.id, { day: '2026-02-30', time: '09:00' })).status(), 'February 30').toBe(400);
    expect((await reschedule(request, camila.id, { day: TOMORROW, time: '9am' })).status(), 'the time "9am"').toBe(400);
  });

  test('an appointment that does not exist is answered with 404', async ({ request }) => {
    const response = await reschedule(request, 999, { day: TOMORROW, time: '15:00' });

    expect(response.status()).toBe(404);
    expect(await errorOf(response)).toBe('Appointment not found');
  });

  test('the Reschedule form of the agenda moves the appointment', async ({ page, request }) => {
    await page.goto('/');
    await page.getByRole('link', { name: `Reschedule ${fabio.patient.name} at ${fabio.time}` }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'Reschedule appointment' })).toBeVisible();

    // The day is picked in the calendar of the form.
    await page.getByRole('button', { name: /^Day, / }).click();
    await page.getByRole('button', { name: 'Wednesday, March 11, 2026' }).click();
    await page.getByRole('radiogroup', { name: 'Time' }).getByRole('radio', { name: '15:30' }).check();
    await page.getByRole('button', { name: 'Reschedule' }).click();

    await expect(page.getByRole('heading', { level: 2, name: 'Wednesday, March 11' })).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(rowOf(page, fabio.id).getByText('15:30')).toBeVisible();
    await expect(rowOf(page, fabio.id).getByText('Scheduled')).toBeVisible();
    expect(await appointment(request, fabio.id)).toMatchObject({ day: '2026-03-11', time: '15:30', status: 'scheduled' });
  });
});
