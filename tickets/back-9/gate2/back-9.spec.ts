import { expect, test } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { DOCTORS } from '../../../support/app.ts';

interface Hours {
  weekday: number;
  startsAt: string;
  endsAt: string;
}

async function hoursOf(request: APIRequestContext, id: number): Promise<Hours[]> {
  return ((await (await request.get(`/api/doctors/${id}`)).json()) as { hours: Hours[] }).hours;
}

const tanabe = { name: 'Dr. Yuki Tanabe', specialty: 'Dermatology' };

test.describe('Ticket back-9: periods that overlap are refused in any order', () => {
  test('two periods of a day that overlap with another one between them are refused', async ({ request }) => {
    const before = await hoursOf(request, DOCTORS.tanabe.id);

    const response = await request.patch(`/api/doctors/${DOCTORS.tanabe.id}`, {
      data: {
        ...tanabe,
        hours: [
          { weekday: 2, startsAt: '11:00', endsAt: '15:00' },
          { weekday: 2, startsAt: '16:00', endsAt: '18:00' },
          { weekday: 2, startsAt: '08:00', endsAt: '12:00' },
        ],
      },
    });

    expect(response.status()).toBe(400);
    expect(((await response.json()) as { fields?: Record<string, string> }).fields).toEqual({ hours: 'Tuesday: two periods overlap' });
    expect(await hoursOf(request, DOCTORS.tanabe.id)).toEqual(before);
  });

  test('periods that overlap are refused when a period of another day comes between them', async ({ request }) => {
    const before = await hoursOf(request, DOCTORS.tanabe.id);

    const response = await request.patch(`/api/doctors/${DOCTORS.tanabe.id}`, {
      data: {
        ...tanabe,
        hours: [
          { weekday: 4, startsAt: '13:00', endsAt: '18:00' },
          { weekday: 6, startsAt: '08:00', endsAt: '12:00' },
          { weekday: 4, startsAt: '17:00', endsAt: '19:00' },
        ],
      },
    });

    expect(response.status()).toBe(400);
    expect(await hoursOf(request, DOCTORS.tanabe.id)).toEqual(before);
  });

  test('a new doctor whose periods overlap out of order is not registered', async ({ request }) => {
    const count = ((await (await request.get('/api/doctors')).json()) as unknown[]).length;

    const response = await request.post('/api/doctors', {
      data: {
        name: 'Dr. Ana Ribeiro',
        specialty: 'Cardiology',
        hours: [
          { weekday: 1, startsAt: '13:00', endsAt: '17:00' },
          { weekday: 1, startsAt: '18:00', endsAt: '20:00' },
          { weekday: 1, startsAt: '08:00', endsAt: '14:00' },
        ],
      },
    });

    expect(response.status()).toBe(400);
    expect((await (await request.get('/api/doctors')).json()) as unknown[]).toHaveLength(count);
  });

  test('periods that only come out of order, without overlapping, are still accepted', async ({ request }) => {
    const hours = [
      { weekday: 3, startsAt: '14:00', endsAt: '18:00' },
      { weekday: 3, startsAt: '08:00', endsAt: '12:00' },
    ];

    const response = await request.post('/api/doctors', { data: { name: 'Dr. Bruna Saraiva', specialty: 'Neurology', hours } });

    expect(response.status()).toBe(201);
  });
});
