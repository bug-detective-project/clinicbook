import type { FastifyInstance } from 'fastify';
import type { Context } from '../context.ts';
import { listDoctors } from '../repository.ts';

export function doctorRoutes(app: FastifyInstance, { db }: Context): void {
  app.get('/api/doctors', () => listDoctors(db));
}
