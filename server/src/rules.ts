import type { AppointmentStatus } from './db.ts';
import { ConflictError } from './errors.ts';

/** The states an appointment may go to from each state. A cancelled appointment stays cancelled. */
const NEXT: Record<AppointmentStatus, AppointmentStatus[]> = {
  scheduled: ['confirmed', 'cancelled'],
  confirmed: ['cancelled'],
  cancelled: [],
};

/** Throws a 409 when an appointment in the state `from` may not go to the state `to`. */
export function assertTransition(from: AppointmentStatus, to: AppointmentStatus): void {
  if (from === to) {
    throw new ConflictError(`This appointment is already ${to}`);
  }
  if (!NEXT[from].includes(to)) {
    throw new ConflictError(`A ${from} appointment cannot be ${to}`);
  }
}
