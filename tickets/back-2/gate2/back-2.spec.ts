import { expect, test } from '@playwright/test';
import { listPatients, openPatients } from '../../../support/app.ts';

const MESSAGE = 'Use only digits, spaces, dashes and parentheses (8 to 20 characters)';

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
      const response = await request.post('/api/patients', { data: { name: 'Vera Xavier', phone } });

      expect(response.status(), `POST /api/patients with the phone "${phone}"`).toBe(400);
      const body = (await response.json()) as { fields?: Record<string, string> };
      expect(body.fields).toEqual({ phone: MESSAGE });
      expect((await listPatients(request)).map((patient) => patient.name)).not.toContain('Vera Xavier');
    });
  }

  test('the formats the clinic uses are still accepted', async ({ request }) => {
    for (const phone of ['11988887777', '(11) 98888-7777', '+55 11 98888-7777', '3555-4004', '11 3555 4004']) {
      const response = await request.post('/api/patients', { data: { name: 'Wagner Zanetti', phone } });

      expect(response.status(), `POST /api/patients with the phone "${phone}"`).toBe(201);
      expect(((await response.json()) as { phone: string }).phone).toBe(phone);
    }
  });

  test('a phone that is too short is still refused', async ({ request }) => {
    const response = await request.post('/api/patients', { data: { name: 'Vera Xavier', phone: '1234' } });

    expect(response.status()).toBe(400);
  });

  test('the form says what is wrong next to the phone, and registers nobody', async ({ page, request }) => {
    await openPatients(page);
    const form = page.getByRole('form', { name: 'New patient' });

    await form.getByLabel('Name').fill('Vera Xavier');
    await form.getByLabel('Phone').fill('11 9888-77AB');
    await form.getByRole('button', { name: 'Register' }).click();

    await expect(form.getByText(MESSAGE)).toBeVisible();
    await expect(form.getByLabel('Phone')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('list', { name: 'Patients' }).getByText('Vera Xavier')).toHaveCount(0);
    expect((await listPatients(request)).map((patient) => patient.name)).not.toContain('Vera Xavier');
  });
});
