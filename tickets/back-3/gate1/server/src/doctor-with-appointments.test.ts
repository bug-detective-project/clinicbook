import { describe, expect, it } from 'vitest';
import type { Appointment } from './repository.ts';
import { testApi, TODAY } from './test/api.ts';

describe('removing a doctor who has appointments', () => {
  it('is refused, and the doctor, the hours and the appointments stay', async () => {
    const { delete: remove, get } = await testApi();
    const doctor = (await get('/api/doctors/1')).body;
    const appointments = (await get<Appointment[]>(`/api/appointments?day=${TODAY}`)).body.filter((item) => item.doctorId === 1);
    expect(appointments.length).toBeGreaterThan(0);

    const { status } = await remove('/api/doctors/1');

    expect(status).toBeGreaterThanOrEqual(400);
    expect((await get('/api/doctors/1')).body).toEqual(doctor);
    expect((await get<Appointment[]>(`/api/appointments?day=${TODAY}`)).body.filter((item) => item.doctorId === 1)).toEqual(appointments);
  });

  it('keeps the doctor on the list', async () => {
    const { delete: remove, get } = await testApi();

    await remove('/api/doctors/2');

    expect((await get<{ id: number }[]>('/api/doctors')).body.map((doctor) => doctor.id)).toContain(2);
  });
});
