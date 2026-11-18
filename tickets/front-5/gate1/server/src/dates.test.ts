import { describe, expect, it } from 'vitest';
import { addDays, formatDay, isDay, isTime, minutesOf, mondayOf, timeOf, weekdayOf } from './dates.ts';

describe('days and times', () => {
  it('accepts only real dates as days', () => {
    expect(isDay('2026-03-09')).toBe(true);
    expect(isDay('2026-02-30')).toBe(false);
    expect(isDay('09/03/2026')).toBe(false);
    expect(isDay(20260309)).toBe(false);
  });

  it('accepts only HH:MM as times', () => {
    expect(isTime('08:30')).toBe(true);
    expect(isTime('8:30')).toBe(false);
    expect(isTime('24:00')).toBe(false);
  });

  it('adds days across months', () => {
    expect(addDays('2026-03-09', 1)).toBe('2026-03-10');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('numbers the days of the week from Monday (1) to Sunday (7)', () => {
    expect(weekdayOf('2026-03-09')).toBe(1);
    expect(weekdayOf('2026-03-14')).toBe(6);
    expect(weekdayOf('2026-03-15')).toBe(7);
    expect(mondayOf('2026-03-15')).toBe('2026-03-09');
  });

  it('writes a day the way a person reads it', () => {
    expect(formatDay('2026-03-10')).toBe('Tuesday, March 10');
  });

  it('turns times into minutes and back', () => {
    expect(minutesOf('08:30')).toBe(510);
    expect(timeOf(510)).toBe('08:30');
  });
});
