import type { FastifyInstance } from 'fastify';
import type { Context } from '../context.ts';
import { isDay, weekdayOf } from '../dates.ts';
import { InvalidError, NotFoundError } from '../errors.ts';
import { bookedTimes, findDoctor, findDoctorWithHours, listDoctors, updateDoctor, workingPeriods } from '../repository.ts';
import type { Hours } from '../repository.ts';
import { doctorBody, requiredDayQuery } from '../schemas.ts';
import { freeSlots } from '../slots.ts';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** Why a week of hours cannot be kept, or null: each period ends after it starts, and the periods of a day do not overlap. */
function hoursProblem(hours: Hours[]): string | null {
  for (const period of hours) {
    if (period.endsAt <= period.startsAt) {
      return `${WEEKDAYS[period.weekday - 1]}: a period must end after it starts`;
    }
  }
  const sorted = [...hours].sort((a, b) => a.weekday - b.weekday || a.startsAt.localeCompare(b.startsAt));
  for (let index = 1; index < sorted.length; index += 1) {
    const before = sorted[index - 1]!;
    const period = sorted[index]!;
    if (period.weekday === before.weekday && period.startsAt < before.endsAt) {
      return `${WEEKDAYS[period.weekday - 1]}: two periods overlap`;
    }
  }
  return null;
}

export function doctorRoutes(app: FastifyInstance, { db, today }: Context): void {
  app.get('/api/doctors', () => listDoctors(db));

  app.get<{ Params: { id: string } }>('/api/doctors/:id', async (request) => {
    const doctor = await findDoctorWithHours(db, Number(request.params.id));
    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }
    return doctor;
  });

  // The name, the specialty and the whole week of hours, in one change.
  app.patch<{ Params: { id: string }; Body: { name: string; specialty: string; hours: Hours[] } }>(
    '/api/doctors/:id',
    { schema: { body: doctorBody } },
    async (request) => {
      const id = Number(request.params.id);
      if (!Number.isInteger(id) || !(await findDoctor(db, id))) {
        throw new NotFoundError('Doctor not found');
      }
      const problem = hoursProblem(request.body.hours);
      if (problem !== null) {
        throw new InvalidError('Some fields are not valid', { hours: problem });
      }
      return updateDoctor(db, id, { name: request.body.name.trim(), specialty: request.body.specialty.trim() }, request.body.hours);
    },
  );

  // The times a doctor is free on a day. A day that is over has none.
  app.get<{ Params: { id: string }; Querystring: { day: string } }>(
    '/api/doctors/:id/slots',
    { schema: { querystring: requiredDayQuery } },
    async (request) => {
      const id = Number(request.params.id);
      const { day } = request.query;
      if (!Number.isInteger(id) || !(await findDoctor(db, id))) {
        throw new NotFoundError('Doctor not found');
      }
      if (!isDay(day)) {
        throw new InvalidError('The day must be a date, as YYYY-MM-DD', { day: 'Not a date' });
      }
      if (day < today()) {
        return { day, slots: [] };
      }
      const periods = await workingPeriods(db, id, weekdayOf(day));
      return { day, slots: freeSlots(periods, await bookedTimes(db, id, day)) };
    },
  );
}
