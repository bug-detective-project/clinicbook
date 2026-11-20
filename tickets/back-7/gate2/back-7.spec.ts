import { expect, test } from '@playwright/test';
import { listPatients, openPatients } from '../../../support/app.ts';

const patient = { name: 'Vera Xavier', phone: '11 90000-0000', healthPlan: 'Private' };

test.describe('Ticket back-7: a CPF is valid only when its check digits match', () => {
  for (const [what, cpf] of [
    ['the first check digit is wrong', '123.456.789-19'],
    ['the second check digit is wrong', '123.456.789-00'],
    ['both check digits are wrong', '529.982.247-00'],
    ['all the digits are the same', '111.111.111-11'],
    ['all the digits are zero', '000.000.000-00'],
  ]) {
    test(`a CPF is refused when ${what}`, async ({ request }) => {
      const response = await request.post('/api/patients', { data: { ...patient, cpf } });

      expect(response.status(), `POST /api/patients with the CPF ${cpf}`).toBe(400);
      expect(((await response.json()) as { fields?: object }).fields).toHaveProperty('cpf');
      expect((await listPatients(request)).map((item) => item.name)).not.toContain(patient.name);
    });
  }

  test('a real CPF is accepted, written with or without the dots and the dash', async ({ request }) => {
    for (const cpf of ['529.982.247-25', '11144477735']) {
      const response = await request.post('/api/patients', { data: { ...patient, name: 'Wagner Zanetti', cpf } });

      expect(response.status(), `POST /api/patients with the CPF ${cpf}`).toBe(201);
    }
  });

  test('a patient cannot be changed to a CPF whose check digits do not match', async ({ request }) => {
    const before = (await (await request.get('/api/patients/2')).json()) as { cpf: string };

    const response = await request.patch('/api/patients/2', { data: { cpf: '987.654.321-01' } });

    expect(response.status()).toBe(400);
    expect(((await (await request.get('/api/patients/2')).json()) as { cpf: string }).cpf).toBe(before.cpf);
  });

  test('the form says what is wrong next to the CPF, and registers nobody', async ({ page, request }) => {
    await openPatients(page);
    await page.getByRole('button', { name: 'New patient' }).click();
    const form = page.getByRole('form', { name: 'New patient' });

    await form.getByLabel('Name').fill('Yara Pinheiro');
    await form.getByLabel('CPF').fill('12345678900');
    await form.getByLabel('Phone').fill('11 90000-0000');
    await form.getByLabel('Health plan').fill('Private');
    await form.getByRole('button', { name: 'Register' }).click();

    await expect(form.getByLabel('CPF')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('list', { name: 'Patients' }).getByText('Yara Pinheiro')).toHaveCount(0);
    expect((await listPatients(request)).map((item) => item.name)).not.toContain('Yara Pinheiro');
  });
});
