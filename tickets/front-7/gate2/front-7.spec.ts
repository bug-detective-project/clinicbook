import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { menuButton, menuOf, openAgenda, openPatients, PATIENTS, TODAY_APPOINTMENTS } from '../../../support/app.ts';

const { ana, bruno, elisa } = PATIENTS;

function tab(page: Page, name: string): Locator {
  return page.getByRole('navigation', { name: 'Patient record' }).getByRole('link', { name, exact: true });
}

function appointmentsList(page: Page, patient: { name: string }): Locator {
  return page.getByRole('list', { name: `Appointments of ${patient.name}` });
}

test.describe('Ticket front-7: the record of a patient, with one address per tab', () => {
  test('/patients/:id opens the record on the Details tab', async ({ page }) => {
    await page.goto(`/patients/${ana.id}`);

    await expect(page.getByRole('heading', { level: 2, name: ana.name })).toBeVisible();
    await expect(page.getByText('(11) 98888-1001')).toBeVisible();
    await expect(page.getByText('ana.costa@example.com')).toBeVisible();
    await expect(tab(page, 'Details')).toHaveAttribute('aria-current', 'page');
    await expect(tab(page, 'Appointments')).not.toHaveAttribute('aria-current', 'page');
  });

  test('the Appointments tab has its own address and shows the appointments of the patient', async ({ page }) => {
    await page.goto(`/patients/${ana.id}`);

    await tab(page, 'Appointments').click();

    await expect(page).toHaveURL(new RegExp(`/patients/${ana.id}/appointments$`));
    await expect(appointmentsList(page, ana).getByRole('listitem')).toHaveCount(5);
    await expect(tab(page, 'Appointments')).toHaveAttribute('aria-current', 'page');
    await expect(tab(page, 'Details')).not.toHaveAttribute('aria-current', 'page');
    await expect(page.getByText('ana.costa@example.com')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 2, name: ana.name })).toBeVisible();
  });

  test('the address of the Appointments tab opens straight on it', async ({ page }) => {
    await page.goto(`/patients/${bruno.id}/appointments`);

    await expect(page.getByRole('heading', { level: 2, name: bruno.name })).toBeVisible();
    await expect(appointmentsList(page, bruno).getByRole('listitem')).toHaveCount(4);
    await expect(tab(page, 'Appointments')).toHaveAttribute('aria-current', 'page');

    await page.reload();
    await expect(appointmentsList(page, bruno)).toBeVisible();
  });

  test('Back and Forward of the browser move between the tabs', async ({ page }) => {
    await page.goto(`/patients/${ana.id}`);
    await tab(page, 'Appointments').click();
    await expect(appointmentsList(page, ana)).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`/patients/${ana.id}$`));
    await expect(page.getByText('ana.costa@example.com')).toBeVisible();
    await expect(tab(page, 'Details')).toHaveAttribute('aria-current', 'page');

    await page.goForward();
    await expect(appointmentsList(page, ana)).toBeVisible();
    await expect(tab(page, 'Appointments')).toHaveAttribute('aria-current', 'page');
  });

  test('the record changes with the patient of the address', async ({ page }) => {
    await page.goto(`/patients/${elisa.id}`);

    await expect(page.getByRole('heading', { level: 2, name: elisa.name })).toBeVisible();
    await expect(page.getByText('No e-mail')).toBeVisible();
    await expect(tab(page, 'Appointments')).toHaveAttribute('href', `/patients/${elisa.id}/appointments`);
  });

  test('a patient that does not exist gets a message, on either tab', async ({ page }) => {
    for (const address of ['/patients/999', '/patients/999/appointments']) {
      await page.goto(address);

      await expect(page.getByRole('heading', { level: 2, name: 'Patient not found' })).toBeVisible();
      await expect(page.getByRole('navigation', { name: 'Patient record' })).toHaveCount(0);
      await expect(page.getByRole('link', { name: 'Back to the patients' })).toHaveAttribute('href', '/patients');
    }
  });

  test('"Open record" of the list of patients and the name in the agenda lead to the record', async ({ page }) => {
    await openPatients(page);
    await menuButton(page, bruno).click();
    await menuOf(page, bruno).getByRole('menuitem', { name: 'Open record' }).click();
    await expect(page.getByRole('heading', { level: 2, name: bruno.name })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Page not found' })).toHaveCount(0);

    await openAgenda(page);
    await page.getByTestId(`appointment-${TODAY_APPOINTMENTS.ana.id}`).getByRole('link', { name: ana.name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/patients/${ana.id}$`));
    await expect(page.getByRole('heading', { level: 2, name: ana.name })).toBeVisible();
  });

  test('the other addresses of the app still work', async ({ page }) => {
    await page.goto('/patients');
    await expect(page.getByRole('list', { name: 'Patients' })).toBeVisible();

    await page.goto('/nowhere');
    await expect(page.getByRole('heading', { level: 2, name: 'Page not found' })).toBeVisible();
  });
});
