import type { FastifyInstance } from 'fastify';
import type { Context } from '../context.ts';
import { isDay, weekdayOf } from '../dates.ts';
import { InvalidError, NotFoundError } from '../errors.ts';
import { bookedTimes, findDoctor, listDoctors, workingPeriods } from '../repository.ts';
import { requiredDayQuery } from '../schemas.ts';
import { freeSlots } from '../slots.ts';

export function doctorRoutes(app: FastifyInstance, { db, today }: Context): void {
  app.get('/api/doctors', () => listDoctors(db));

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
