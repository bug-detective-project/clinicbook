import Fastify from 'fastify';
import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Settings } from './config.ts';
import type { Context } from './context.ts';
import { systemToday } from './dates.ts';
import type { Db } from './db.ts';
import { HttpError, QueryError } from './errors.ts';
import { appointmentRoutes } from './routes/appointments.ts';
import { doctorRoutes } from './routes/doctors.ts';
import { patientRoutes } from './routes/patients.ts';
import { reminderRoutes } from './routes/reminders.ts';
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

/**
 * Turns what a route threw into an answer. The user reads the body, so it never carries what only
 * the team should see: an error nobody planned for goes to the log, and the answer says only that
 * something went wrong.
 */
function handleError(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply): FastifyReply {
  // A request that does not fit the schema of its route.
  if ('validation' in error && error.validation) {
    return reply.status(400).send({ error: 'Some fields are not valid', fields: fieldsOf(error.validation) });
  }
  // An answer a rule of the clinic gave on purpose.
  if (error instanceof HttpError) {
    return reply.status(error.status).send({ error: error.message, fields: error.fields });
  }
  // The database refused the query to protect the data: the two cases a user can cause.
  if (error instanceof QueryError && error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return reply.status(409).send({ error: 'This record already exists' });
  }
  if (error instanceof QueryError && error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    return reply.status(409).send({ error: 'This record is in use and cannot be removed' });
  }
  // A request Fastify itself refused, such as a body that is not JSON.
  if ('statusCode' in error && typeof error.statusCode === 'number' && error.statusCode >= 400 && error.statusCode < 500) {
    return reply.status(error.statusCode).send({ error: error.message });
  }
  request.log.error(error);
  return reply.status(500).send({ error: 'Internal server error' });
}
