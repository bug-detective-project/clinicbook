import { expect, test } from '@playwright/test';
import { appointment, DOCTORS, TODAY_APPOINTMENTS } from '../../../support/app.ts';

test.describe('Ticket back-12: a doctor with appointments cannot be removed', () => {
  test('the API refuses with 409, and the doctor, the hours and the appointments stay', async ({ request }) => {
    const doctor = await (await request.get(`/api/doctors/${DOCTORS.prado.id}`)).json();
    const ofDoctor = ((await (await request.get('/api/appointments?day=2026-03-09')).json()) as { id: number; doctorId: number }[]).filter(
      (item) => item.doctorId === DOCTORS.prado.id,
    );
    expect(ofDoctor.length).toBeGreaterThan(0);

    const response = await request.delete(`/api/doctors/${DOCTORS.prado.id}`);

    expect(response.status(), `DELETE /api/doctors/${DOCTORS.prado.id}`).toBe(409);
    expect(await response.json()).toEqual({ error: 'This record is in use and cannot be removed' });
    expect(await (await request.get(`/api/doctors/${DOCTORS.prado.id}`)).json()).toEqual(doctor);
    for (const item of ofDoctor) {
      expect((await request.get(`/api/appointments/${item.id}`)).status(), `appointment ${item.id}`).toBe(200);
    }
  });

  test('the edit screen says why the doctor stays, and the doctor is still on the list', async ({ page, request }) => {
    await page.goto(`/doctors/${DOCTORS.oliveira.id}/edit`);

    await page.getByRole('button', { name: 'Remove doctor' }).click();
    await page.getByRole('alertdialog', { name: 'Remove doctor' }).getByRole('button', { name: 'Remove' }).click();

    await expect(page.getByRole('alert')).toHaveText(`${DOCTORS.oliveira.name}: This record is in use and cannot be removed`);
    await expect(page.getByRole('form', { name: 'Edit doctor' })).toBeVisible();
    expect((await request.get(`/api/doctors/${DOCTORS.oliveira.id}`)).status()).toBe(200);
    await page.goto('/doctors');
    await expect(page.getByTestId(`doctor-${DOCTORS.oliveira.id}`)).toBeVisible();
  });

  test('the appointments of a doctor who stays still show on the agenda', async ({ page, request }) => {
    await request.delete(`/api/doctors/${DOCTORS.prado.id}`);

    await page.goto('/');

    await expect(page.getByTestId(`appointment-${TODAY_APPOINTMENTS.ana.id}`)).toBeVisible();
    expect((await appointment(request, TODAY_APPOINTMENTS.ana.id)).id).toBe(TODAY_APPOINTMENTS.ana.id);
  });

  test('a doctor without appointments can still be removed, with the hours', async ({ request }) => {
    const created = await request.post('/api/doctors', { data: { name: 'Dr. Ana Ribeiro', specialty: 'Cardiology', hours: [{ weekday: 2, startsAt: '09:00', endsAt: '11:00' }] } });
    const { id } = (await created.json()) as { id: number };

    expect((await request.delete(`/api/doctors/${id}`)).status()).toBe(204);
    expect((await request.get(`/api/doctors/${id}`)).status()).toBe(404);
  });
});
