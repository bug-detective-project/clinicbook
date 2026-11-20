// Calendars of the agenda and of a doctor: weeks from Monday and months, on plain days (YYYY-MM-DD),
// worked out in UTC so no time zone moves a day.

import type { Hours } from './api/types.ts';

const utc = (day: string) => new Date(`${day}T00:00:00Z`);
const iso = (date: Date) => date.toISOString().slice(0, 10);

export function addDays(day: string, amount: number): string {
  const date = utc(day);
  date.setUTCDate(date.getUTCDate() + amount);
  return iso(date);
}

/** 1 for a Monday, 7 for a Sunday. */
export function weekdayOf(day: string): number {
  return ((utc(day).getUTCDay() + 6) % 7) + 1;
}

export function mondayOf(day: string): string {
  return addDays(day, 1 - weekdayOf(day));
}

/** The first day of the month of `day`, moved by `months` months. */
export function monthStart(day: string, months = 0): string {
  const date = utc(`${day.slice(0, 7)}-01`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return iso(date);
}

export function monthEnd(day: string): string {
  return addDays(monthStart(day, 1), -1);
}

/** Every day from `from` to `to`, both included. */
export function daysFrom(from: string, to: string): string[] {
  const days: string[] = [];
  for (let day = from; day <= to; day = addDays(day, 1)) {
    days.push(day);
  }
  return days;
}

const SHORT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const WEEKDAY = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' });
const MONTH = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const YEAR = new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: 'UTC' });

/** "Mon" for a day. */
export const weekdayName = (day: string) => WEEKDAY.format(utc(day));
/** "March 2026" for any day of the month. */
export const monthName = (day: string) => MONTH.format(utc(day));
/** "Mar 9 – Mar 15, 2026" for a week. */
export const weekName = (from: string, to: string) => `${SHORT.format(utc(from))} – ${SHORT.format(utc(to))}, ${YEAR.format(utc(to))}`;

export const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHORT_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** The periods of one day of the week, as "08:00–12:00, 14:00–17:00". */
export function periodsOf(hours: Hours[], weekday: number): string {
  return hours
    .filter((period) => period.weekday === weekday)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map((period) => `${period.startsAt}–${period.endsAt}`)
    .join(', ');
}

/** A week of hours in a line: days with the same periods go together, "Mon–Fri 08:00–12:00, 14:00–17:00 · Sat 08:00–12:00". */
export function hoursSummary(hours: Hours[]): string {
  const groups: { days: number[]; periods: string }[] = [];
  for (let weekday = 1; weekday <= 7; weekday += 1) {
    const periods = periodsOf(hours, weekday);
    if (periods === '') {
      continue;
    }
    const last = groups.at(-1);
    if (last && last.periods === periods && last.days.at(-1) === weekday - 1) {
      last.days.push(weekday);
    } else {
      groups.push({ days: [weekday], periods });
    }
  }
  if (groups.length === 0) {
    return 'No working hours';
  }
  return groups
    .map(({ days, periods }) => {
      const first = SHORT_WEEKDAYS[days[0]! - 1];
      const label = days.length === 1 ? first : `${first}–${SHORT_WEEKDAYS[days.at(-1)! - 1]}`;
      return `${label} ${periods}`;
    })
    .join(' · ');
}
