import { describe, expect, it } from 'vitest';
import { isWorkingTime } from './schedule.ts';

const periods = [
  { startsAt: '08:00', endsAt: '12:00' },
  { startsAt: '14:00', endsAt: '17:00' },
];

describe('the working hours of a doctor', () => {
  it('accepts the start of every slot of a period', () => {
    expect(isWorkingTime(periods, '08:00')).toBe(true);
    expect(isWorkingTime(periods, '11:30')).toBe(true);
    expect(isWorkingTime(periods, '14:00')).toBe(true);
    expect(isWorkingTime(periods, '16:30')).toBe(true);
  });

  it('refuses a time when the appointment would end after the period', () => {
    expect(isWorkingTime(periods, '12:00')).toBe(false);
    expect(isWorkingTime(periods, '17:00')).toBe(false);
  });

  it('refuses a time outside the periods or in the middle of a slot', () => {
    expect(isWorkingTime(periods, '13:00')).toBe(false);
    expect(isWorkingTime(periods, '07:30')).toBe(false);
    expect(isWorkingTime(periods, '08:15')).toBe(false);
    expect(isWorkingTime([], '08:00')).toBe(false);
  });
});
