import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { formatDay, formatShortDay } from './dates.ts';

// The other tests run in UTC. These run where the clinic is: three hours behind UTC.
describe('days on a computer in São Paulo', () => {
  const zone = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = 'America/Sao_Paulo';
  });

  afterAll(() => {
    process.env.TZ = zone;
  });

  it('really runs in the time zone of the clinic', () => {
    expect(new Date('2026-03-10T12:00:00Z').getHours()).toBe(9);
  });

  it('writes the day it was given, not the day before', () => {
    expect(formatDay('2026-03-10')).toBe('Tuesday, March 10');
    expect(formatShortDay('2026-03-10')).toBe('Mar 10, 2026');
  });

  it('keeps the first day of a month and of a year in their month and year', () => {
    expect(formatDay('2026-03-01')).toBe('Sunday, March 1');
    expect(formatShortDay('2026-01-01')).toBe('Jan 1, 2026');
  });
});

describe('days on a computer ahead of UTC', () => {
  const zone = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = 'Asia/Tokyo';
  });

  afterAll(() => {
    process.env.TZ = zone;
  });

  it('writes the day it was given', () => {
    expect(formatDay('2026-03-10')).toBe('Tuesday, March 10');
    expect(formatShortDay('2026-12-31')).toBe('Dec 31, 2026');
  });
});
