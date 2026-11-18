import { minutesOf } from './dates.ts';

/** Every appointment takes one slot of this many minutes. */
export const SLOT_MINUTES = 30;

/** A stretch of a day in which a doctor sees patients: from `startsAt` until `endsAt`, both HH:MM. */
export interface Period {
  startsAt: string;
  endsAt: string;
}

/**
 * True when an appointment may start at `time`: the time is the start of a slot, and the whole
 * slot fits in one of the periods.
 */
export function isWorkingTime(periods: Period[], time: string): boolean {
  const start = minutesOf(time);
  return periods.some((period) => {
    const from = minutesOf(period.startsAt);
    const until = minutesOf(period.endsAt);
    return start >= from && start + SLOT_MINUTES <= until && (start - from) % SLOT_MINUTES === 0;
  });
}
