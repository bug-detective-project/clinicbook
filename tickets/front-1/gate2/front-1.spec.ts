import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { appointmentsOf, countRequests, DOCTORS, NEXT_MONDAY, PATIENTS } from '../../../support/app.ts';

/** The booking form, filled by its address: only the Book button is left to click. */
async function openFilledForm(page: Page, patientId: number, time: string): Promise<void> {
  await page.goto(`/appointments/new?patient=${patientId}&doctor=${DOCTORS.prado.id}&day=${NEXT_MONDAY}&time=${time}`);
  await expect(page.getByRole('radio', { name: time })).toBeChecked();
  await expect(page.getByLabel('Patient')).toHaveValue(String(patientId));
}

/** Holds every booking request for a moment, the way a slow network does. */
async function slowBookings(page: Page): Promise<void> {
  await page.route('**/api/appointments', async (route) => {
    if (route.request().method() === 'POST') {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    await route.continue();
  });
}

async function bookedAt(page: Page, time: string): Promise<number> {
  const day = await appointmentsOf(page.request, NEXT_MONDAY);
  return day.filter((item) => item.doctorId === DOCTORS.prado.id && item.time === time).length;
}

test.describe('Ticket front-1: Book books one appointment, however many times it is clicked', () => {
  test('a double click on Book sends one request and books one appointment', async ({ page }) => {
    await slowBookings(page);
    const posts = countRequests(page, '/api/appointments', 'POST');
    await openFilledForm(page, PATIENTS.davi.id, '10:30');

    await page.getByRole('button', { name: 'Book' }).dblclick();

    await expect(page.getByRole('heading', { level: 2, name: 'Monday, March 16' })).toBeVisible();
    await page.waitForLoadState('networkidle');
    expect(posts(), 'booking requests sent by a double click').toBe(1);
    expect(await bookedAt(page, '10:30'), 'appointments at 10:30 after a double click').toBe(1);
  });

  test('clicking again while the first request is still in the air books nothing more', async ({ page }) => {
    await slowBookings(page);
    const posts = countRequests(page, '/api/appointments', 'POST');
    await openFilledForm(page, PATIENTS.elisa.id, '11:00');
    const button = page.getByRole('button', { name: 'Book' });

    await button.click();
    for (let extra = 0; extra < 3; extra += 1) {
      // The button may be disabled by now: a click that is not possible is not an error here.
      await button.click({ timeout: 100, force: true }).catch(() => {});
    }

    await expect(page.getByRole('heading', { level: 2, name: 'Monday, March 16' })).toBeVisible();
    await page.waitForLoadState('networkidle');
    expect(posts(), 'booking requests sent by four clicks').toBe(1);
    expect(await bookedAt(page, '11:00'), 'appointments at 11:00 after four clicks').toBe(1);
  });

  test('after the server refuses a booking, the user can send the form again', async ({ page }) => {
    let refused = false;
    await page.route('**/api/appointments', async (route) => {
      if (route.request().method() === 'POST' && !refused) {
        refused = true;
        await route.fulfill({ status: 400, json: { error: 'The doctor does not see patients at this time' } });
        return;
      }
      await route.continue();
    });
    await openFilledForm(page, PATIENTS.fabio.id, '15:00');
    const button = page.getByRole('button', { name: 'Book' });

    await button.click();
    await expect(page.getByRole('alert')).toHaveText('The doctor does not see patients at this time');
    await button.click();

    await expect(page.getByRole('heading', { level: 2, name: 'Monday, March 16' })).toBeVisible();
    expect(await bookedAt(page, '15:00'), 'appointments at 15:00 after the second try').toBe(1);
  });
});
