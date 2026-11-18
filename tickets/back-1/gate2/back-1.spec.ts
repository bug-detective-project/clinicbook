import { expect, test } from '@playwright/test';
import { appointment, dayTotal, openAgenda, rowOf, TODAY_APPOINTMENTS } from '../../../support/app.ts';

const { bruno, davi, elisa, camila } = TODAY_APPOINTMENTS;

test.describe('Ticket back-1: a cancelled appointment stays cancelled', () => {
  test('confirming a cancelled appointment is refused with 409', async ({ request }) => {
    const response = await request.post(`/api/appointments/${elisa.id}/confirm`);

    expect(response.status(), `POST /api/appointments/${elisa.id}/confirm`).toBe(409);
    expect(((await response.json()) as { error?: string }).error).toBe('A cancelled appointment cannot be confirmed');
    expect((await appointment(request, elisa.id)).status).toBe('cancelled');
  });

  test('an appointment cancelled a moment ago cannot be confirmed either', async ({ request }) => {
    expect((await request.post(`/api/appointments/${davi.id}/cancel`)).status(), 'cancel').toBe(200);

    const response = await request.post(`/api/appointments/${davi.id}/confirm`);

    expect(response.status(), 'confirm after cancel').toBe(409);
    expect((await appointment(request, davi.id)).status).toBe('cancelled');
  });

  test('the time of the cancelled appointment stays free', async ({ request }) => {
    await request.post(`/api/appointments/${davi.id}/confirm`);

    const response = await request.get('/api/doctors/2/slots?day=2026-03-09');
    const { slots } = (await response.json()) as { slots: string[] };

    expect(slots).toContain(davi.time);
    expect(slots).toContain(elisa.time);
  });

  test('a scheduled appointment is still confirmed', async ({ request }) => {
    const response = await request.post(`/api/appointments/${bruno.id}/confirm`);

    expect(response.status(), 'confirm a scheduled appointment').toBe(200);
    expect((await appointment(request, bruno.id)).status).toBe('confirmed');
  });

  test('a screen that still shows Confirm gets the refusal, and then shows the appointment as cancelled', async ({ page, request }) => {
    // With the clock of the page under control the agenda does not refresh itself: the screen
    // keeps showing the appointment as it was before the other receptionist cancelled it.
    await page.clock.install();
    await openAgenda(page);
    const confirm = page.getByRole('button', { name: `Confirm ${camila.patient.name} at ${camila.time}` });
    await expect(confirm).toBeVisible();
    expect((await request.post(`/api/appointments/${camila.id}/cancel`)).status(), 'cancel from another computer').toBe(200);

    await confirm.click();

    await expect(page.getByRole('alert')).toHaveText('A cancelled appointment cannot be confirmed');
    await expect(rowOf(page, camila.id).getByText('Cancelled')).toBeVisible();
    await expect(dayTotal(page)).toBeVisible();
    expect((await appointment(request, camila.id)).status).toBe('cancelled');
  });
});
