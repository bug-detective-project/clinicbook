import type { FastifyInstance } from 'fastify';
import type { Context } from '../context.ts';
import { addDays, isDay } from '../dates.ts';
import { InvalidError } from '../errors.ts';
import { listAppointmentsBetween } from '../repository.ts';
import { scheduleQuery } from '../schemas.ts';

/** The most days one request for a schedule may cover: six weeks, enough for a month on a calendar. */
const MAX_SCHEDULE_DAYS = 42;

export function scheduleRoutes(app: FastifyInstance, { db }: Context): void {
  // The appointments of the clinic (or of one doctor) from one day to another, for a week or a month.
  app.get<{ Querystring: { from: string; to: string; doctor?: number } }>('/api/schedule', { schema: { querystring: scheduleQuery } }, async (request) => {
    const { from, to, doctor } = request.query;
    if (!isDay(from) || !isDay(to)) {
      throw new InvalidError('The days must be dates, as YYYY-MM-DD', { from: 'Not a date' });
    }
    if (from > to) {
      throw new InvalidError('The first day must come before the last', { from: 'After the last day' });
    }
    if (addDays(from, MAX_SCHEDULE_DAYS) < to) {
      throw new InvalidError(`A schedule covers ${MAX_SCHEDULE_DAYS} days at most`, { to: 'Too far from the first day' });
    }
    return listAppointmentsBetween(db, from, to, doctor);
  });
}
