import { describe, expect, it } from 'vitest';
import type { Patient } from './repository.ts';
import { testApi } from './test/api.ts';

interface Failure {
  error: string;
  fields?: Record<string, string>;
}

describe('the phone of a patient', () => {
  it.each([
    ['letters instead of digits', '11 9888-77AB'],
    ['words before the number', 'call 11 98888-7777'],
    ['words after the number', '(11) 98888-7777 ext. 2'],
    ['a note in parentheses', '11 98888-7777 (mom)'],
    ['two numbers', '11 98888-7777 / 11 3555-4004'],
    ['more than 20 characters', '+55 (11) 98888-7777 0000'],
  ])('refuses a phone with %s', async (_what, phone) => {
    const { get, post } = await testApi();

    const { status, body } = await post<Failure>('/api/patients', { name: 'Someone New', phone });

    expect(status).toBe(400);
    expect(body.fields).toEqual({ phone: 'Use only digits, spaces, dashes and parentheses (8 to 20 characters)' });
    expect((await get<Patient[]>('/api/patients')).body).toHaveLength(8);
  });

  it('still accepts the formats the clinic uses', async () => {
    const { post } = await testApi();

    for (const phone of ['11988887777', '(11) 98888-7777', '+55 11 98888-7777', '3555-4004']) {
      expect((await post('/api/patients', { name: 'Someone New', phone })).status, phone).toBe(201);
    }
  });

  it('never stops the reminders of the other patients', async () => {
    const { post } = await testApi();
    const refused = await post('/api/patients', { name: 'Vera Xavier', phone: '11 9888-77AB' });
    if (refused.status === 201) {
      // Only when the phone was accepted: an appointment tomorrow, so that she is due a reminder.
      await post('/api/appointments', { patientId: (refused.body as Patient).id, doctorId: 1, day: '2026-03-10', time: '10:00' });
    }

    const run = await post('/api/reminders/run');

    expect(run).toEqual({ status: 200, body: { enabled: true, sent: 3 } });
  });
});
