import { expect, test } from '@playwright/test';
import { listPatients, menuButton, menuOf, openPatients, PATIENTS } from '../../../support/app.ts';

/** Words of a query: none of them belongs in what a user reads. */
const SQL = /insert into|delete from|select |update |constraint|query:|"patients"|sqlite/i;

/** A new patient with the e-mail of Ana: its CPF is valid and nobody has it, so only the e-mail is taken. */
const DUPLICATE = { name: 'Another Ana', cpf: '52998224725', phone: '(11) 90000-1111', healthPlan: 'Private', email: 'ana.costa@example.com' };

test.describe('Ticket back-4: an error of the database reaches the user as a plain message', () => {
  test('registering an e-mail twice answers 409 and says that the record already exists', async ({ request }) => {
    const response = await request.post('/api/patients', { data: DUPLICATE });

    expect(response.status(), 'POST /api/patients with an e-mail already registered').toBe(409);
    expect(await response.json()).toEqual({ error: 'This record already exists' });
    expect((await listPatients(request)).map((patient) => patient.name)).not.toContain(DUPLICATE.name);
  });

  test('the same e-mail in capital letters is the same e-mail', async ({ request }) => {
    const response = await request.post('/api/patients', { data: { ...DUPLICATE, email: 'ANA.COSTA@EXAMPLE.COM' } });

    expect(response.status()).toBe(409);
    expect(await response.text()).not.toMatch(SQL);
  });

  test('removing a patient who has appointments answers 409 and says that the record is in use', async ({ request }) => {
    const response = await request.delete(`/api/patients/${PATIENTS.ana.id}`);

    expect(response.status(), `DELETE /api/patients/${PATIENTS.ana.id}`).toBe(409);
    expect(await response.json()).toEqual({ error: 'This record is in use and cannot be removed' });
    expect((await request.get(`/api/patients/${PATIENTS.ana.id}`)).status(), 'the patient is still there').toBe(200);
  });

  test('no answer carries the query, the table or the name of the database', async ({ request }) => {
    const answers = [
      await request.post('/api/patients', { data: DUPLICATE }),
      await request.delete(`/api/patients/${PATIENTS.bruno.id}`),
      await request.delete(`/api/patients/${PATIENTS.camila.id}`),
    ];

    for (const answer of answers) {
      expect(await answer.text(), `${answer.url()} answered ${answer.status()}`).not.toMatch(SQL);
    }
  });

  test('the answers that were already right stay the same', async ({ request }) => {
    const invalid = await request.post('/api/patients', { data: { name: 'No Phone' } });
    expect(invalid.status(), 'a patient without a phone').toBe(400);
    expect(((await invalid.json()) as { fields?: object }).fields).toHaveProperty('phone');

    const missing = await request.get('/api/patients/999');
    expect(missing.status()).toBe(404);
    expect(await missing.json()).toEqual({ error: 'Patient not found' });

    const notJson = await request.post('/api/patients', { headers: { 'content-type': 'application/json' }, data: '{ "name": ' });
    expect(notJson.status(), 'a body that is not JSON').toBe(400);

    const rule = await request.post('/api/appointments', { data: { patientId: 1, doctorId: 1, day: '2026-03-06', time: '09:00' } });
    expect(rule.status(), 'a booking in the past').toBe(400);
    expect(((await rule.json()) as { error: string }).error).toBe('An appointment cannot be booked in the past');

    const created = await request.post('/api/patients', { data: { name: 'Passing By', cpf: '11144477735', phone: '11 90000-0000', healthPlan: 'Private' } });
    expect(created.status(), 'a new patient').toBe(201);
    expect((await request.delete(`/api/patients/${((await created.json()) as { id: number }).id}`)).status()).toBe(204);
  });

  test('the form of a new patient shows the plain message', async ({ page }) => {
    await openPatients(page);
    await page.getByRole('button', { name: 'New patient' }).click();
    const form = page.getByRole('form', { name: 'New patient' });

    await form.getByLabel('Name').fill(DUPLICATE.name);
    await form.getByLabel('CPF').fill(DUPLICATE.cpf);
    await form.getByLabel('Phone').fill(DUPLICATE.phone);
    await form.getByLabel('Health plan').fill(DUPLICATE.healthPlan);
    await form.getByLabel('E-mail (optional)').fill(DUPLICATE.email);
    await form.getByRole('button', { name: 'Register' }).click();

    await expect(page.getByRole('alert')).toHaveText('This record already exists');
    await expect(page.getByRole('main')).not.toContainText(SQL);
  });

  test('removing a patient with appointments shows the plain message', async ({ page }) => {
    await openPatients(page);

    await menuButton(page, PATIENTS.heitor).click();
    await menuOf(page, PATIENTS.heitor).getByRole('menuitem', { name: 'Remove patient' }).click();
    await page.getByRole('alertdialog', { name: 'Remove patient' }).getByRole('button', { name: 'Remove' }).click();

    await expect(page.getByRole('alert')).toHaveText(`${PATIENTS.heitor.name}: This record is in use and cannot be removed`);
    await expect(page.getByRole('main')).not.toContainText(SQL);
    await expect(page.getByTestId(`patient-${PATIENTS.heitor.id}`)).toBeVisible();
  });
});
