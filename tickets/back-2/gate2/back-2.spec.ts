import { expect, test } from '@playwright/test';
import { listPatients, openPatients } from '../../../support/app.ts';

const MESSAGE = 'Use only digits, spaces, dashes and parentheses (8 to 20 characters)';

/** Valid CPFs that no sample patient has: each patient registered here needs one of its own. */
const CPFS = ['52998224725', '11144477735', '98765432100', '12345678909', '31415926590', '27182818205'];

const NOT_PHONES = [
  '11 9888-77AB',
  'call 11 98888-7777',
  '(11) 98888-7777 ext. 2',
  '11 98888-7777 (mom)',
  '11 98888-7777 / 11 3555-4004',
  '+55 (11) 98888-7777 0000',
];

test.describe('Ticket back-2: the phone of a patient is a phone', () => {
  for (const phone of NOT_PHONES) {
    test(`"${phone}" is refused`, async ({ request }) => {
      const response = await request.post('/api/patients', { data: { name: 'Vera Xavier', cpf: CPFS[0], phone, healthPlan: 'Private' } });

      expect(response.status(), `POST /api/patients with the phone "${phone}"`).toBe(400);
      const body = (await response.json()) as { fields?: Record<string, string> };
      expect(body.fields).toEqual({ phone: MESSAGE });
      expect((await listPatients(request)).map((patient) => patient.name)).not.toContain('Vera Xavier');
    });
  }

  test('the formats the clinic uses are still accepted', async ({ request }) => {
    const phones = ['11988887777', '(11) 98888-7777', '+55 11 98888-7777', '3555-4004', '11 3555 4004'];
    for (const [index, phone] of phones.entries()) {
      const response = await request.post('/api/patients', { data: { name: 'Wagner Zanetti', cpf: CPFS[index + 1], phone, healthPlan: 'Private' } });

      expect(response.status(), `POST /api/patients with the phone "${phone}"`).toBe(201);
      expect(((await response.json()) as { phone: string }).phone).toBe(phone);
    }
  });

  test('a phone that is too short is still refused', async ({ request }) => {
    const response = await request.post('/api/patients', { data: { name: 'Vera Xavier', cpf: CPFS[0], phone: '1234', healthPlan: 'Private' } });

    expect(response.status()).toBe(400);
  });

  // The phone field of the screen takes digits only, so letters come from the API alone; a phone
  // that is too short still shows how the form answers.
  test('the form says what is wrong next to the phone, and registers nobody', async ({ page, request }) => {
    await openPatients(page);
    await page.getByRole('button', { name: 'New patient' }).click();
    const form = page.getByRole('form', { name: 'New patient' });

    await form.getByLabel('Name').fill('Vera Xavier');
    await form.getByLabel('CPF').fill(CPFS[0]);
    await form.getByLabel('Phone').fill('1234');
    await form.getByLabel('Health plan').fill('Private');
    await form.getByRole('button', { name: 'Register' }).click();

    await expect(form.getByText(MESSAGE)).toBeVisible();
    await expect(form.getByLabel('Phone')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('list', { name: 'Patients' }).getByText('Vera Xavier')).toHaveCount(0);
    expect((await listPatients(request)).map((patient) => patient.name)).not.toContain('Vera Xavier');
  });
});
