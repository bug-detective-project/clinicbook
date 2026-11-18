import { describe, expect, it } from 'vitest';
import type { Appointment } from './repository.ts';
import { testApi } from './test/api.ts';

interface Failure {
  error: string;
}

// In the sample data of today, appointment 7 is scheduled, 6 is confirmed and 9 is cancelled.
describe('confirming an appointment', () => {
  it('refuses to confirm a cancelled appointment, which stays cancelled', async () => {
    const { get, post } = await testApi();

    const { status, body } = await post<Failure>('/api/appointments/9/confirm');

    expect(status).toBe(409);
    expect(body.error).toBe('A cancelled appointment cannot be confirmed');
    expect((await get<Appointment>('/api/appointments/9')).body.status).toBe('cancelled');
  });

  it('refuses to confirm an appointment that was cancelled a moment ago', async () => {
    const { get, post } = await testApi();
    await post('/api/appointments/7/cancel');

    expect((await post('/api/appointments/7/confirm')).status).toBe(409);
    expect((await get<Appointment>('/api/appointments/7')).body.status).toBe('cancelled');
  });

  it('says that a confirmed appointment is already confirmed', async () => {
    const { post } = await testApi();

    const { status, body } = await post<Failure>('/api/appointments/6/confirm');

    expect(status).toBe(409);
    expect(body.error).toBe('This appointment is already confirmed');
  });

  it('still confirms a scheduled appointment', async () => {
    const { post } = await testApi();

    expect((await post<Appointment>('/api/appointments/7/confirm')).body.status).toBe('confirmed');
  });
});
