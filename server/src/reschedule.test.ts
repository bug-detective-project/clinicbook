import { describe, expect, it } from 'vitest';
import type { Appointment } from './repository.ts';
import { testApi, TODAY, TOMORROW } from './test/api.ts';

interface Failure {
  error: string;
  fields?: Record<string, string>;
}

// In the sample data of today, appointment 7 is scheduled and 6 is confirmed, both with
// Dr. Helena Prado (Monday to Friday, 08:00 to 12:00 and 14:00 to 17:00); 9 is cancelled.
describe('PATCH /api/appointments/:id', () => {
  it('moves a scheduled appointment to another day and time', async () => {
    const { get, patch } = await testApi();

    const { status, body } = await patch<Appointment>('/api/appointments/7', { day: TOMORROW, time: '15:00' });

    expect(status).toBe(200);
    expect(body).toMatchObject({ id: 7, day: TOMORROW, time: '15:00', status: 'scheduled', patientName: 'Bruno Carvalho' });
    expect((await get<Appointment[]>(`/api/appointments?day=${TODAY}`)).body.map((item) => item.id)).not.toContain(7);
    expect((await get<Appointment[]>(`/api/appointments?day=${TOMORROW}`)).body.map((item) => item.id)).toContain(7);
  });

  it('sends a confirmed appointment back to scheduled, because the patient confirms the new time', async () => {
    const { patch } = await testApi();

    const { status, body } = await patch<Appointment>('/api/appointments/6', { day: TODAY, time: '16:30' });

    expect(status).toBe(200);
    expect(body).toMatchObject({ id: 6, day: TODAY, time: '16:30', status: 'scheduled' });
  });

  it('keeps the patient, the doctor and the reason', async () => {
    const { patch } = await testApi();

    const { body } = await patch<Appointment>('/api/appointments/7', { day: TOMORROW, time: '15:00' });

    expect(body).toMatchObject({ patientId: 2, doctorId: 1, doctorName: 'Dr. Helena Prado', reason: 'Back pain' });
  });

  it('refuses a cancelled appointment, and leaves it where it was', async () => {
    const { get, patch } = await testApi();

    const { status, body } = await patch<Failure>('/api/appointments/9', { day: '2026-03-11', time: '10:30' });

    expect(status).toBe(409);
    expect(body.error).toBe('A cancelled appointment cannot be rescheduled');
    expect((await get<Appointment>('/api/appointments/9')).body).toMatchObject({ day: TODAY, time: '09:30', status: 'cancelled' });
  });

  it('refuses a time outside the working hours of the doctor, like a booking', async () => {
    const { get, patch } = await testApi();

    const lunch = await patch<Failure>('/api/appointments/7', { day: TOMORROW, time: '12:30' });
    const saturday = await patch<Failure>('/api/appointments/7', { day: '2026-03-14', time: '09:00' });
    const halfSlot = await patch<Failure>('/api/appointments/7', { day: TOMORROW, time: '09:15' });

    expect(lunch.status).toBe(400);
    expect(lunch.body.error).toBe('The doctor does not see patients at this time');
    expect(saturday.status).toBe(400);
    expect(halfSlot.status).toBe(400);
    expect((await get<Appointment>('/api/appointments/7')).body).toMatchObject({ day: TODAY, time: '08:30' });
  });

  it('refuses a day in the past, like a booking', async () => {
    const { patch } = await testApi();

    const { status, body } = await patch<Failure>('/api/appointments/7', { day: '2026-03-06', time: '09:00' });

    expect(status).toBe(400);
    expect(body.error).toBe('An appointment cannot be booked in the past');
  });

  it('refuses a request without the day or the time, naming the fields', async () => {
    const { patch } = await testApi();

    const { status, body } = await patch<Failure>('/api/appointments/7', {});

    expect(status).toBe(400);
    expect(Object.keys(body.fields ?? {}).sort()).toEqual(['day', 'time']);
    expect((await patch('/api/appointments/7', { day: '2026-02-30', time: '09:00' })).status).toBe(400);
  });

  it('answers 404 for an appointment that does not exist', async () => {
    const { patch } = await testApi();

    expect(await patch('/api/appointments/999', { day: TOMORROW, time: '15:00' })).toEqual({
      status: 404,
      body: { error: 'Appointment not found' },
    });
  });
});
