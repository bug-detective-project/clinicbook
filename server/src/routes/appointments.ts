import type { FastifyInstance } from 'fastify';
import {
  bookAppointment,
  cancelAppointment,
  confirmAppointment,
  requireAppointment,
  rescheduleAppointment,
} from '../appointments.ts';
import type { Context } from '../context.ts';
import { listAppointmentsOfDay } from '../repository.ts';
import { appointmentBody, dayQuery, rescheduleBody } from '../schemas.ts';

interface Id {
  id: string;
}

interface AppointmentBody {
  patientId: number;
  doctorId: number;
  day: string;
  time: string;
  reason?: string;
}

export function appointmentRoutes(app: FastifyInstance, { db, today }: Context): void {
  // The appointments of a day; without a day, the ones of today.
  app.get<{ Querystring: { day?: string } }>('/api/appointments', { schema: { querystring: dayQuery } }, (request) => {
    return listAppointmentsOfDay(db, request.query.day ?? today());
  });

  app.post<{ Body: AppointmentBody }>('/api/appointments', { schema: { body: appointmentBody } }, async (request, reply) => {
    const { reason = '', ...input } = request.body;
    const appointment = await bookAppointment(db, today(), { ...input, reason: reason.trim() });
    return reply.status(201).send(appointment);
  });

  app.get<{ Params: Id }>('/api/appointments/:id', (request) => {
    return requireAppointment(db, Number(request.params.id));
  });

  app.post<{ Params: Id }>('/api/appointments/:id/confirm', (request) => {
    return confirmAppointment(db, Number(request.params.id));
  });

  app.post<{ Params: Id }>('/api/appointments/:id/cancel', (request) => {
    return cancelAppointment(db, Number(request.params.id));
  });

  app.patch<{ Params: Id; Body: { day: string; time: string } }>(
    '/api/appointments/:id',
    { schema: { body: rescheduleBody } },
    (request) => {
      return rescheduleAppointment(db, today(), Number(request.params.id), request.body.day, request.body.time);
    },
  );
}
