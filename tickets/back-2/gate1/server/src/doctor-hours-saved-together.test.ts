import { describe, expect, it } from 'vitest';
import { testApi } from './test/api.ts';

interface DoctorWithHours {
  id: number;
  name: string;
  specialty: string;
  hours: { weekday: number; startsAt: string; endsAt: string }[];
}

describe('saving a doctor whose hours the database refuses', () => {
  it('keeps the name, the specialty and every period the doctor had', async () => {
    const { get, patch } = await testApi();
    const before = (await get<DoctorWithHours>('/api/doctors/3')).body;

    // The clinic opens at 06:00: the database refuses a period that starts at 05:00.
    const { status } = await patch('/api/doctors/3', {
      name: 'Dr. Yuki Tanabe Mori',
      specialty: 'Dermatology and allergy',
      hours: [
        { weekday: 2, startsAt: '08:00', endsAt: '12:00' },
        { weekday: 4, startsAt: '05:00', endsAt: '09:00' },
      ],
    });

    expect(status).toBeGreaterThanOrEqual(400);
    expect((await get<DoctorWithHours>('/api/doctors/3')).body).toEqual(before);
  });
});
