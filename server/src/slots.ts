import { minutesOf, timeOf } from './dates.ts';
import { SLOT_MINUTES } from './schedule.ts';
import type { Period } from './schedule.ts';

/**
 * The times a doctor is free on a day, in order: every slot of the working periods whose time is
 * not in `booked`.
 */
export function freeSlots(periods: Period[], booked: string[]): string[] {
  const taken = new Set(booked);
  const slots: string[] = [];
  for (const period of periods) {
    const until = minutesOf(period.endsAt);
    for (let start = minutesOf(period.startsAt); start + SLOT_MINUTES <= until; start += SLOT_MINUTES) {
      const time = timeOf(start);
      if (!taken.has(time)) {
        slots.push(time);
      }
    }
  }
  return slots.sort();
}
