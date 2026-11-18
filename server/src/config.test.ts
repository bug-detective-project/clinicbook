import { describe, expect, it } from 'vitest';
import { createApp } from './app.ts';
import { readSettings } from './config.ts';
import { openDatabase, seedDatabase } from './db.ts';
import { TODAY } from './test/api.ts';

describe('the REMINDERS_ENABLED option', () => {
  it('is on when the environment does not set it', () => {
    expect(readSettings({}).remindersEnabled).toBe(true);
    expect(readSettings({ REMINDERS_ENABLED: '' }).remindersEnabled).toBe(true);
  });

  it.each(['false', 'FALSE', 'False', '0', ' false '])('is off with "%s"', (value) => {
    expect(readSettings({ REMINDERS_ENABLED: value }).remindersEnabled).toBe(false);
  });

  it.each(['true', 'TRUE', '1'])('is on with "%s"', (value) => {
    expect(readSettings({ REMINDERS_ENABLED: value }).remindersEnabled).toBe(true);
  });

  it('sends no reminder when the server starts with REMINDERS_ENABLED=false', async () => {
    const db = openDatabase(':memory:');
    await seedDatabase(db, TODAY);
    const app = createApp(db, readSettings({ CLINICBOOK_TODAY: TODAY, REMINDERS_ENABLED: 'false' }));
    const headers = { host: 'localhost:3001' };

    const run = await app.inject({ method: 'POST', url: '/api/reminders/run', headers });
    const outbox = await app.inject({ method: 'GET', url: '/api/reminders', headers });

    expect(run.json()).toEqual({ enabled: false, sent: 0 });
    expect(outbox.json()).toEqual({ enabled: false, reminders: [] });
  });
});

describe('the CLINICBOOK_TODAY option', () => {
  it('fixes the date, and is left out when it is not set', () => {
    expect(readSettings({ CLINICBOOK_TODAY: '2026-03-09' }).today).toBe('2026-03-09');
    expect(readSettings({}).today).toBeUndefined();
  });
});
