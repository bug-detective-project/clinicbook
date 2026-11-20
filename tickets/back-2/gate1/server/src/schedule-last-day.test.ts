import { describe, expect, it } from 'vitest';
import type { Appointment } from './repository.ts';
import { testApi, TODAY } from './test/api.ts';

/** The days from `from` to `to`, both included. */
function daysBetween(from: string, to: string): string[] {
  const days: string[] = [];
  for (let day = new Date(`${from}T00:00:00Z`); day <= new Date(`${to}T00:00:00Z`); day.setUTCDate(day.getUTCDate() + 1)) {
    days.push(day.toISOString().slice(0, 10));
  }
  return days;
}

describe('the schedule from one day to another', () => {
  it('has the appointments of the last day', async () => {
    const { get } = await testApi();

    const schedule = (await get<Appointment[]>(`/api/schedule?from=${TODAY}&to=${TODAY}`)).body;
    const ofDay = (await get<Appointment[]>(`/api/appointments?day=${TODAY}`)).body;

    expect(ofDay.length).toBeGreaterThan(0);
    expect(schedule.map((item) => item.id).sort()).toEqual(ofDay.map((item) => item.id).sort());
  });

  it('has every appointment of a whole week, the Sunday included', async () => {
    const { get } = await testApi();
    const days = daysBetween('2026-03-09', '2026-03-15');

    const schedule = (await get<Appointment[]>('/api/schedule?from=2026-03-09&to=2026-03-15')).body;
    const ofDays = (await Promise.all(days.map((day) => get<Appointment[]>(`/api/appointments?day=${day}`)))).flatMap((answer) => answer.body);

    expect(schedule.map((item) => item.id).sort()).toEqual(ofDays.map((item) => item.id).sort());
  });

  it('has the appointments of the last day for one doctor too', async () => {
    const { get } = await testApi();
    const ofDay = (await get<Appointment[]>(`/api/appointments?day=${TODAY}`)).body.filter((item) => item.doctorId === 1);

    const schedule = (await get<Appointment[]>(`/api/schedule?from=${TODAY}&to=${TODAY}&doctor=1`)).body;

    expect(ofDay.length).toBeGreaterThan(0);
    expect(schedule.map((item) => item.id).sort()).toEqual(ofDay.map((item) => item.id).sort());
  });
});
