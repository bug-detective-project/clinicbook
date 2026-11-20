import { expect, test } from '@playwright/test';
import { PATIENTS } from '../../../support/app.ts';

async function openRecord(page: import('@playwright/test').Page, id: number): Promise<void> {
  await page.goto(`/patients/${id}`);
  await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
}

test.describe('Ticket front-9: cancelling the edit of a patient changes nothing', () => {
  test('a patient without an e-mail still has none after a cancelled edit', async ({ page, request }) => {
    const before = await (await request.get(`/api/patients/${PATIENTS.elisa.id}`)).json();
    await openRecord(page, PATIENTS.elisa.id);
    await expect(page.getByText('No e-mail')).toBeVisible();

    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('form', { name: 'Edit patient' }).getByLabel('Name').fill('Elisa Gomes Changed');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByText('No e-mail')).toBeVisible();
    expect(await (await request.get(`/api/patients/${PATIENTS.elisa.id}`)).json()).toEqual(before);
  });

  test('a patient without a birth date still has none after a cancelled edit', async ({ page, request }) => {
    expect((await request.patch(`/api/patients/${PATIENTS.giovana.id}`, { data: { birthDate: null } })).status()).toBe(200);
    await openRecord(page, PATIENTS.giovana.id);
    await expect(page.getByText('Not informed')).toBeVisible();

    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByText('Not informed')).toBeVisible();
  });

  test('the form opens again with the data of the patient, not with what was typed before', async ({ page }) => {
    await openRecord(page, PATIENTS.bruno.id);

    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('form', { name: 'Edit patient' }).getByLabel('Health plan').fill('Something Else');
    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('button', { name: 'Edit' }).click();

    await expect(page.getByRole('form', { name: 'Edit patient' }).getByLabel('Health plan')).toHaveValue('Amparo Vida');
    await expect(page.getByRole('form', { name: 'Edit patient' }).getByLabel('Name')).toHaveValue(PATIENTS.bruno.name);
  });
});
