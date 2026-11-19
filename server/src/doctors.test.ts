import { describe, expect, it } from 'vitest';
import type { Appointment } from './repository.ts';
import { testApi, TODAY, TOMORROW } from './test/api.ts';

interface Hours {
  weekday: number;
  startsAt: string;
  endsAt: string;
}

interface DoctorWithHours {
  id: number;
  name: string;
  specialty: string;
  hours: Hours[];
}

interface Failure {
  error: string;
  fields?: Record<string, string>;
}

describe('a doctor', () => {
  it('answers the doctor with the hours of each day of the week', async () => {
    const { get } = await testApi();

    const { status, body } = await get<DoctorWithHours>('/api/doctors/3');

    expect(status).toBe(200);
    expect(body).toEqual({
      id: 3,
      name: 'Dr. Yuki Tanabe',
      specialty: 'Dermatology',
      hours: [
        { weekday: 2, startsAt: '13:00', endsAt: '18:00' },
        { weekday: 4, startsAt: '13:00', endsAt: '18:00' },
        { weekday: 6, startsAt: '08:00', endsAt: '12:00' },
      ],
    });
  });

  it('changes the name, the specialty and the hours, and the free times follow the new hours', async () => {
    const { get, patch } = await testApi();
    const hours = [
      { weekday: 2, startsAt: '08:00', endsAt: '10:00' },
      { weekday: 2, startsAt: '14:00', endsAt: '15:00' },
    ];

    const changed = await patch<DoctorWithHours>('/api/doctors/3', { name: ' Dr. Yuki Tanabe Mori ', specialty: 'Dermatology and allergy', hours });

    expect(changed.status).toBe(200);
    expect(changed.body).toEqual({ id: 3, name: 'Dr. Yuki Tanabe Mori', specialty: 'Dermatology and allergy', hours });
    // TOMORROW is a Tuesday: the free times are those of the new hours.
    const slots = (await get<{ slots: string[] }>(`/api/doctors/3/slots?day=${TOMORROW}`)).body.slots;
    expect(slots[0]).toBe('08:00');
    expect(slots).toContain('14:30');
    expect(slots).not.toContain('13:00');
  });

  it('refuses hours that end before they start, or that overlap on the same day', async () => {
    const { patch } = await testApi();
    const doctor = { name: 'Dr. Yuki Tanabe', specialty: 'Dermatology' };

    const backwards = await patch<Failure>('/api/doctors/3', { ...doctor, hours: [{ weekday: 2, startsAt: '18:00', endsAt: '13:00' }] });
    const overlapping = await patch<Failure>('/api/doctors/3', {
      ...doctor,
      hours: [
        { weekday: 2, startsAt: '08:00', endsAt: '12:00' },
        { weekday: 2, startsAt: '11:00', endsAt: '14:00' },
      ],
    });

    expect(backwards.status).toBe(400);
    expect(backwards.body.fields).toEqual({ hours: 'Tuesday: a period must end after it starts' });
    expect(overlapping.status).toBe(400);
    expect(overlapping.body.fields).toEqual({ hours: 'Tuesday: two periods overlap' });
  });

  it('refuses a doctor without a name or a specialty, and answers 404 for one that does not exist', async () => {
    const { patch } = await testApi();

    const empty = await patch<Failure>('/api/doctors/3', { name: '', specialty: '', hours: [] });
    const missing = await patch('/api/doctors/999', { name: 'Dr. Nobody', specialty: 'None', hours: [] });

    expect(empty.status).toBe(400);
    expect(Object.keys(empty.body.fields ?? {}).sort()).toEqual(['name', 'specialty']);
    expect(missing.status).toBe(404);
  });
});

describe('the schedule', () => {
  it('lists the appointments between two days, the earliest first', async () => {
    const { get } = await testApi();

    const { status, body } = await get<Appointment[]>(`/api/schedule?from=${TODAY}&to=${TOMORROW}`);

    expect(status).toBe(200);
    expect(body.length).toBeGreaterThan(0);
    expect(body.every((item) => item.day >= TODAY && item.day <= TOMORROW)).toBe(true);
    const keys = body.map((item) => `${item.day} ${item.time}`);
    expect(keys).toEqual([...keys].sort());
  });

  it('lists the appointments of one doctor', async () => {
    const { get } = await testApi();

    const { body } = await get<Appointment[]>(`/api/schedule?from=${TODAY}&to=${TOMORROW}&doctor=1`);

    expect(body.length).toBeGreaterThan(0);
    expect(body.every((item) => item.doctorId === 1)).toBe(true);
  });

  it('refuses days that are not dates, the wrong way round, or more than six weeks apart', async () => {
    const { get } = await testApi();

    expect((await get(`/api/schedule?from=nope&to=${TODAY}`)).status).toBe(400);
    expect((await get(`/api/schedule?from=${TOMORROW}&to=${TODAY}`)).status).toBe(400);
    expect((await get('/api/schedule?from=2026-01-01&to=2026-03-31')).status).toBe(400);
  });
});
