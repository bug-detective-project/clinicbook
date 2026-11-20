import Fastify from 'fastify';
import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Settings } from './config.ts';
import type { Context } from './context.ts';
import { systemToday } from './dates.ts';
import type { Db } from './db.ts';
import { HttpError } from './errors.ts';
import { appointmentRoutes } from './routes/appointments.ts';
import { doctorRoutes } from './routes/doctors.ts';
import { patientRoutes } from './routes/patients.ts';
import { reminderRoutes } from './routes/reminders.ts';
import { scheduleRoutes } from './routes/schedule.ts';
import { fieldsOf } from './schemas.ts';

export interface AppOptions {
  /** Whether the server writes its log to the terminal; the tests keep it quiet. */
  logger?: boolean;
}

export function createApp(db: Db, settings: Settings, options: AppOptions = {}): FastifyInstance {
  const app = Fastify({
    logger: options.logger ? { level: 'warn' } : false,
    // Every field that does not fit its schema is reported, not only the first one.
    ajv: { customOptions: { allErrors: true } },
  });
  // The server owns the date: the client asks for it instead of reading its own clock.
  const context: Context = { db, settings, today: () => settings.today ?? systemToday() };

  app.addHook('onRequest', allowedHost);
  app.setErrorHandler(handleError);
  app.setNotFoundHandler((_request, reply) => reply.status(404).send({ error: 'Not found' }));

  app.get('/api/today', () => ({ today: context.today() }));
  appointmentRoutes(app, context);
  doctorRoutes(app, context);
  patientRoutes(app, context);
  reminderRoutes(app, context);
  scheduleRoutes(app, context);

  return app;
}

/** Hosts the API answers; the port is ignored. */
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/**
 * The app runs on the player's computer and only the local client talks to it: a page on the
 * internet that reaches the API through the browser sends another Host, and gets 403.
 */
async function allowedHost(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const host = request.headers.host ?? '';
  const name = host.startsWith('[') ? host.slice(0, host.indexOf(']') + 1) : host.replace(/:\d+$/, '');
  if (!LOCAL_HOSTS.has(name.toLowerCase())) {
    await reply.status(403).send({ error: 'Forbidden host' });
  }
}

/** Turns what a route threw into an answer. */
function handleError(error: FastifyError | Error, _request: FastifyRequest, reply: FastifyReply): FastifyReply {
  // A request that does not fit the schema of its route.
  if ('validation' in error && error.validation) {
    return reply.status(400).send({ error: 'Some fields are not valid', fields: fieldsOf(error.validation) });
  }
  // An answer a rule of the clinic gave on purpose.
  if (error instanceof HttpError) {
    return reply.status(error.status).send({ error: error.message, fields: error.fields });
  }
  // Anything else: the status the error brings, or 500, with its message.
  const status = 'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : 500;
  return reply.status(status).send({ error: error.message });
}
