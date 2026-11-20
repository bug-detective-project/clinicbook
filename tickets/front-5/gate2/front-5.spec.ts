import { expect, test } from '@playwright/test';
import { menuButton, menuOf, openPatients, PATIENTS } from '../../../support/app.ts';

const { ana, bruno, davi } = PATIENTS;

test.describe('Ticket front-5: the menu of a patient closes like a menu', () => {
  test.beforeEach(async ({ page }) => {
    await openPatients(page);
    await menuButton(page, bruno).click();
    await expect(menuOf(page, bruno)).toBeVisible();
  });

  test('a click somewhere else on the page closes it', async ({ page }) => {
    await page.getByRole('heading', { level: 2, name: 'Patients' }).click();

    await expect(menuOf(page, bruno)).toHaveCount(0);
    await expect(menuButton(page, bruno)).toHaveAttribute('aria-expanded', 'false');
  });

  test('a click on an empty part of the page closes it', async ({ page }) => {
    await page.mouse.click(8, 400);

    await expect(menuOf(page, bruno)).toHaveCount(0);
  });

  test('Escape closes it and gives the focus back to its button', async ({ page }) => {
    await page.keyboard.press('Tab');
    await expect(menuOf(page, bruno).getByRole('menuitem', { name: 'Open record' })).toBeFocused();

    await page.keyboard.press('Escape');

    await expect(menuOf(page, bruno)).toHaveCount(0);
    await expect(menuButton(page, bruno)).toBeFocused();
    await expect(menuButton(page, bruno)).toHaveAttribute('aria-expanded', 'false');
  });

  test('opening the menu of another patient closes it', async ({ page }) => {
    // The patient of the row above: the open menu hangs over the rows below it.
    await menuButton(page, ana).click();

    await expect(menuOf(page, ana)).toBeVisible();
    await expect(menuOf(page, bruno)).toHaveCount(0);
    await expect(page.getByRole('menu')).toHaveCount(1);
  });

  test('a click inside the menu leaves it open, and its button still closes it', async ({ page }) => {
    // The padding of the menu, next to its first item.
    await menuOf(page, bruno).click({ position: { x: 2, y: 2 } });
    await expect(menuOf(page, bruno)).toBeVisible();

    await menuButton(page, bruno).click();
    await expect(menuOf(page, bruno)).toHaveCount(0);
  });

  test('the items of the menu still do their job', async ({ page }) => {
    await menuOf(page, bruno).getByRole('menuitem', { name: 'Book appointment' }).click();
    await expect(page).toHaveURL(new RegExp(`/appointments/new\\?patient=${bruno.id}$`));

    await openPatients(page);
    await menuButton(page, davi).click();
    await menuOf(page, davi).getByRole('menuitem', { name: 'Remove patient' }).click();
    await page.getByRole('alertdialog', { name: 'Remove patient' }).getByRole('button', { name: 'Remove' }).click();
    // Davi has appointments, so he stays; the menu closes anyway.
    await expect(page.getByRole('alert')).toContainText(davi.name);
    await expect(menuOf(page, davi)).toHaveCount(0);
  });

  test('Escape with every menu closed changes nothing', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expect(menuOf(page, bruno)).toHaveCount(0);
    const patients = page.getByRole('list', { name: 'Patients' }).getByRole('listitem');
    const before = await patients.count();
    const first = menuButton(page, ana);
    await first.focus();

    await page.keyboard.press('Escape');

    await expect(first).toBeFocused();
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(patients).toHaveCount(before);
    await expect(page.getByRole('alert')).toHaveCount(0);
  });
});
