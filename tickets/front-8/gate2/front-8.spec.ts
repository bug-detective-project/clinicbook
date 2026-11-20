import { expect, test } from '@playwright/test';
import { openAgenda, TODAY_APPOINTMENTS } from '../../../support/app.ts';

const confirmButton = (page: import('@playwright/test').Page, item: { time: string; patient: { name: string } }) =>
  page.getByRole('button', { name: `Confirm ${item.patient.name} at ${item.time}` });
const confirmed = (item: { time: string; patient: { name: string } }) => `The appointment of ${item.patient.name} at ${item.time} was confirmed.`;

test.describe('Ticket front-8: each toast keeps its own time', () => {
  test('a toast goes away after its 4 seconds, even when another one came in the meantime', async ({ page }) => {
    await page.clock.install();
    await openAgenda(page);

    await confirmButton(page, TODAY_APPOINTMENTS.bruno).click();
    await expect(page.getByText(confirmed(TODAY_APPOINTMENTS.bruno))).toBeVisible();
    await page.clock.runFor(3000);
    await confirmButton(page, TODAY_APPOINTMENTS.davi).click();
    await expect(page.getByText(confirmed(TODAY_APPOINTMENTS.davi))).toBeVisible();
    await page.clock.runFor(1500);

    await expect(page.getByText(confirmed(TODAY_APPOINTMENTS.bruno))).toHaveCount(0);
    await expect(page.getByText(confirmed(TODAY_APPOINTMENTS.davi))).toBeVisible();
  });

  test('two toasts in a row are both gone a few seconds later', async ({ page }) => {
    await page.clock.install();
    await openAgenda(page);

    await confirmButton(page, TODAY_APPOINTMENTS.camila).click();
    await expect(page.getByText(confirmed(TODAY_APPOINTMENTS.camila))).toBeVisible();
    await confirmButton(page, TODAY_APPOINTMENTS.fabio).click();
    await expect(page.getByText(confirmed(TODAY_APPOINTMENTS.fabio))).toBeVisible();
    await page.clock.runFor(5000);

    await expect(page.getByTestId('toast')).toHaveCount(0);
  });
});
