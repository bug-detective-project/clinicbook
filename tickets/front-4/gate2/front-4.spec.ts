import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { openAgenda, settle } from '../../../support/app.ts';

/** Records the day of every request the page makes for the appointments of a day. */
function agendaRequests(page: Page): string[] {
  const days: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.pathname === '/api/appointments' && request.method() === 'GET') {
      days.push(url.searchParams.get('day') ?? '');
    }
  });
  return days;
}

test.describe('Ticket front-4: the agenda refreshes itself only while it is on the screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
  });

  test('while the agenda is open, it asks the server again every 15 seconds', async ({ page }) => {
    const requests = agendaRequests(page);
    await openAgenda(page);
    const opened = requests.length;

    await page.clock.runFor(31_000);
    await settle(page);

    expect(requests.length - opened, 'requests for the agenda in 31 seconds with the agenda open').toBe(2);
  });

  test('after the user goes to another screen, no request for the agenda is made', async ({ page }) => {
    const requests = agendaRequests(page);
    await openAgenda(page);
    await page.getByRole('link', { name: 'Patients' }).click();
    await expect(page.getByRole('list', { name: 'Patients' })).toBeVisible();
    await settle(page);
    const left = requests.length;

    await page.clock.runFor(60_000);
    await settle(page);

    expect(requests.length - left, 'requests for the agenda in the minute after leaving it').toBe(0);
  });

  test('changing the day keeps one refresh, of the day on the screen', async ({ page }) => {
    const requests = agendaRequests(page);
    await openAgenda(page);
    for (const title of ['Tuesday, March 10', 'Wednesday, March 11', 'Thursday, March 12']) {
      await page.getByRole('link', { name: 'Next day' }).click();
      await expect(page.getByRole('heading', { level: 2 })).toHaveText(title);
      await expect(page.getByTestId('day-total')).toBeVisible();
    }
    await settle(page);
    const before = requests.length;

    await page.clock.runFor(15_500);
    await settle(page);

    expect(requests.slice(before), 'requests for the agenda in 15 seconds, after three changes of day').toEqual(['2026-03-12']);
  });

  test('leaving the agenda and coming back does not pile up refreshes', async ({ page }) => {
    const requests = agendaRequests(page);
    await openAgenda(page);
    for (let round = 0; round < 3; round += 1) {
      await page.getByRole('link', { name: 'Reminders' }).click();
      await expect(page.getByRole('heading', { level: 2, name: 'Reminders' })).toBeVisible();
      await page.getByRole('link', { name: 'Agenda' }).click();
      await expect(page.getByTestId('day-total')).toBeVisible();
    }
    await settle(page);
    const before = requests.length;

    await page.clock.runFor(30_500);
    await settle(page);

    expect(requests.length - before, 'requests for the agenda in 30 seconds, after coming back three times').toBe(2);
  });
});
