import { expect, test } from '@playwright/test';

test.describe('Ticket front-10: a week opened on a Sunday is the week that ends on it', () => {
  test('the week of Sunday, March 15, starts on Monday, March 9', async ({ page }) => {
    await page.goto('/week?day=2026-03-15');

    await expect(page.getByRole('heading', { level: 2, name: 'Mar 9 – Mar 15, 2026' })).toBeVisible();
    await expect(page.getByTestId('day-2026-03-09')).toBeVisible();
    await expect(page.getByTestId('day-2026-03-16')).toHaveCount(0);
  });

  test('"Previous week" from that Sunday goes to the week of March 2', async ({ page }) => {
    await page.goto('/week?day=2026-03-15');
    await page.getByRole('link', { name: 'Previous week' }).click();

    await expect(page.getByRole('heading', { level: 2, name: 'Mar 2 – Mar 8, 2026' })).toBeVisible();
  });

  test('March 2026, which begins on a Sunday, shows its first day', async ({ page }) => {
    await page.goto('/month?day=2026-03-20');

    await expect(page.getByRole('heading', { level: 2, name: 'March 2026' })).toBeVisible();
    await expect(page.getByTestId('month-2026-03-01')).toBeVisible();
    await expect(page.getByTestId('month-2026-02-23')).toBeVisible();
  });

  test('a Sunday picked in "Go to a day" keeps the week of that Sunday', async ({ page }) => {
    await page.goto('/week?day=2026-03-11');

    await page.getByRole('button', { name: /^Go to a day, / }).click();
    await page.getByRole('button', { name: 'Sunday, March 15, 2026' }).click();

    await expect(page.getByRole('heading', { level: 2, name: 'Mar 9 – Mar 15, 2026' })).toBeVisible();
  });
});
