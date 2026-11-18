import { expect, test } from '@playwright/test';

interface Outbox {
  enabled: boolean;
  reminders: unknown[];
}

// QA starts the app with REMINDERS_ENABLED=false (APP_SETTINGS in run.ts).
test.describe('Ticket back-3: REMINDERS_ENABLED=false turns the reminders off', () => {
  test('the API says that the reminders are off', async ({ request }) => {
    const response = await request.get('/api/reminders');

    expect(response.status(), 'GET /api/reminders').toBe(200);
    expect(((await response.json()) as Outbox).enabled, 'enabled, with REMINDERS_ENABLED=false').toBe(false);
  });

  test('asking to send the reminders sends none', async ({ request }) => {
    const run = await request.post('/api/reminders/run');

    expect(run.status(), 'POST /api/reminders/run').toBe(200);
    expect(await run.json()).toEqual({ enabled: false, sent: 0 });
    const outbox = (await (await request.get('/api/reminders')).json()) as Outbox;
    expect(outbox.reminders, 'reminders in the outbox').toEqual([]);
  });

  test('asking again and again still sends none', async ({ request }) => {
    for (let round = 0; round < 3; round += 1) {
      await request.post('/api/reminders/run');
    }

    const outbox = (await (await request.get('/api/reminders')).json()) as Outbox;
    expect(outbox).toEqual({ enabled: false, reminders: [] });
  });

  test('the Reminders screen says that they are off, and has nothing to send', async ({ page }) => {
    await page.goto('/reminders');

    await expect(page.getByTestId('reminders-off')).toHaveText('Reminders are turned off for this clinic.');
    await expect(page.getByRole('button', { name: 'Send the reminders of tomorrow' })).toHaveCount(0);
    await expect(page.getByRole('list', { name: 'Sent reminders' })).toHaveCount(0);
  });

  test('the rest of the app is not affected', async ({ request }) => {
    expect((await request.get('/api/today')).status()).toBe(200);
    expect(await (await request.get('/api/today')).json()).toEqual({ today: '2026-03-09' });
  });
});
