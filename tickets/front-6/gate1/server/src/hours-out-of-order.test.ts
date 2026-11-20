import { describe, expect, it } from 'vitest';
import { testApi } from './test/api.ts';

interface Hours {
  weekday: number;
  startsAt: string;
  endsAt: string;
}

const doctor = { name: 'Dr. Yuki Tanabe', specialty: 'Dermatology' };

describe('periods that overlap, in any order', () => {
  it.each<[string, Hours[]]>([
    [
      'when a period between them does not overlap either',
      [
        { weekday: 2, startsAt: '11:00', endsAt: '15:00' },
        { weekday: 2, startsAt: '16:00', endsAt: '18:00' },
        { weekday: 2, startsAt: '08:00', endsAt: '12:00' },
      ],
    ],
    [
      'when a period of another day sits between them',
      [
        { weekday: 2, startsAt: '08:00', endsAt: '12:00' },
        { weekday: 4, startsAt: '08:00', endsAt: '12:00' },
        { weekday: 2, startsAt: '10:00', endsAt: '11:00' },
      ],
    ],
  ])('are refused %s, and the doctor keeps the hours it had', async (_when, hours) => {
    const { get, patch } = await testApi();
    const before = (await get<{ hours: Hours[] }>('/api/doctors/3')).body.hours;

    const { status } = await patch('/api/doctors/3', { ...doctor, hours });

    expect(status).toBe(400);
    expect((await get<{ hours: Hours[] }>('/api/doctors/3')).body.hours).toEqual(before);
  });

  it('are refused for a new doctor too, who is not registered', async () => {
    const { get, post } = await testApi();
    const count = (await get<unknown[]>('/api/doctors')).body.length;

    const { status } = await post('/api/doctors', {
      name: 'Dr. Ana Ribeiro',
      specialty: 'Cardiology',
      hours: [
        { weekday: 1, startsAt: '13:00', endsAt: '17:00' },
        { weekday: 1, startsAt: '18:00', endsAt: '20:00' },
        { weekday: 1, startsAt: '08:00', endsAt: '14:00' },
      ],
    });

    expect(status).toBe(400);
    expect((await get<unknown[]>('/api/doctors')).body).toHaveLength(count);
  });

  it('do not stop periods that only come out of order', async () => {
    const { patch } = await testApi();
    const hours = [
      { weekday: 2, startsAt: '14:00', endsAt: '18:00' },
      { weekday: 2, startsAt: '08:00', endsAt: '12:00' },
    ];

    expect((await patch('/api/doctors/3', { ...doctor, hours })).status).toBe(200);
  });
});
