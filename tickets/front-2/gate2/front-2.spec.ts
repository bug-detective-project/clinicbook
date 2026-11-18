import { expect, test } from '@playwright/test';
import { dayTotal, openAgenda, rowOf, TODAY_APPOINTMENTS } from '../../../support/app.ts';

const { bruno, davi, camila, fabio } = TODAY_APPOINTMENTS;

test.describe('Ticket front-2: the total of the day follows what the list shows', () => {
  // The agenda refreshes itself every 15 seconds. With the clock of the page under control, the
  // total has to be right at once, not at the next refresh.
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
  });

  test('cancelling an appointment lowers the total at once', async ({ page }) => {
    await openAgenda(page);
    await expect(dayTotal(page)).toHaveText('5 appointments');

    await page.getByRole('button', { name: `Cancel ${camila.patient.name} at ${camila.time}` }).click();

    await expect(rowOf(page, camila.id).getByText('Cancelled')).toBeVisible();
    await expect(dayTotal(page)).toHaveText('4 appointments');
  });

  test('every cancellation counts, one by one', async ({ page }) => {
    await openAgenda(page);
    await expect(dayTotal(page)).toHaveText('4 appointments');

    await page.getByRole('button', { name: `Cancel ${davi.patient.name} at ${davi.time}` }).click();
    await expect(rowOf(page, davi.id).getByText('Cancelled')).toBeVisible();
    await expect(dayTotal(page)).toHaveText('3 appointments');

    await page.getByRole('button', { name: `Cancel ${fabio.patient.name} at ${fabio.time}` }).click();
    await expect(rowOf(page, fabio.id).getByText('Cancelled')).toBeVisible();
    await expect(dayTotal(page)).toHaveText('2 appointments');
  });

  test('confirming an appointment leaves the total as it is', async ({ page }) => {
    await openAgenda(page);
    await expect(dayTotal(page)).toHaveText('2 appointments');

    await page.getByRole('button', { name: `Confirm ${bruno.patient.name} at ${bruno.time}` }).click();

    await expect(rowOf(page, bruno.id).getByText('Confirmed')).toBeVisible();
    await expect(dayTotal(page)).toHaveText('2 appointments');
  });

  test('the total on the screen is the one a reload shows', async ({ page }) => {
    await openAgenda(page);
    await page.getByRole('button', { name: `Cancel ${bruno.patient.name} at ${bruno.time}` }).click();
    await expect(rowOf(page, bruno.id).getByText('Cancelled')).toBeVisible();
    const before = await dayTotal(page).textContent();

    await page.reload();

    await expect(dayTotal(page)).toHaveText('1 appointment');
    expect(before, 'the total before the reload').toBe('1 appointment');
  });
});
