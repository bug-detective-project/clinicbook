import { expect, test } from '@playwright/test';
import { DOCTORS, openAgenda, PATIENTS, TODAY, TOMORROW } from '../../../support/app.ts';

test.describe('Ticket front-3: a day is shown as the day it is, on the computers of the clinic', () => {
  // The clinic is in São Paulo, three hours behind UTC.
  test.use({ timezoneId: 'America/Sao_Paulo' });

  test('the agenda of today has the date of today as its title', async ({ page }) => {
    await openAgenda(page, TODAY);

    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Monday, March 9');
  });

  test('the agenda of the 10th says the 10th', async ({ page }) => {
    await openAgenda(page, TOMORROW);

    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Tuesday, March 10');
  });

  test('"Next day" goes from the title of one day to the title of the next', async ({ page }) => {
    await openAgenda(page, TODAY);

    await page.getByRole('link', { name: 'Next day' }).click();

    await expect(page).toHaveURL(/day=2026-03-10/);
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Tuesday, March 10');
  });

  test('the first day of a month stays in its month', async ({ page }) => {
    await openAgenda(page, '2026-04-01');

    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Wednesday, April 1');
  });

  test('an appointment booked for the 10th shows on the 10th', async ({ page }) => {
    await page.goto(`/appointments/new?patient=${PATIENTS.camila.id}&doctor=${DOCTORS.prado.id}&day=${TOMORROW}&time=10:30`);
    await expect(page.getByRole('radio', { name: '10:30' })).toBeChecked();

    await page.getByRole('button', { name: 'Book' }).click();

    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Tuesday, March 10');
    await expect(page.getByRole('list', { name: 'Appointments' }).getByText(PATIENTS.camila.name)).toBeVisible();
  });

  test('the record of a patient shows the days of the appointments and the birth date', async ({ page }) => {
    await page.goto(`/patients/${PATIENTS.ana.id}/appointments`);
    const list = page.getByRole('list', { name: `Appointments of ${PATIENTS.ana.name}` });

    await expect(list.getByText('Tuesday, March 10 at 15:30')).toBeVisible();
    await expect(list.getByText('Monday, March 9 at 08:00')).toBeVisible();

    await page.goto(`/patients/${PATIENTS.ana.id}`);
    await expect(page.getByText('Apr 12, 1988')).toBeVisible();
  });
});

test.describe('Ticket front-3: the day is right ahead of UTC too', () => {
  test.use({ timezoneId: 'Asia/Tokyo' });

  test('the agenda of the 10th says the 10th in Tokyo', async ({ page }) => {
    await openAgenda(page, TOMORROW);

    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Tuesday, March 10');
  });
});
