import type { FastifyInstance } from 'fastify';
import type { Context } from '../context.ts';
import { listReminders, sendReminders } from '../reminders.ts';

export function reminderRoutes(app: FastifyInstance, { db, settings, today }: Context): void {
  app.get('/api/reminders', async () => {
    return { enabled: settings.remindersEnabled, reminders: await listReminders(db) };
  });

  // Sends the reminders of the appointments of tomorrow. With the option off, nothing goes out.
  app.post('/api/reminders/run', async () => {
    if (!settings.remindersEnabled) {
      return { enabled: false, sent: 0 };
    }
    return { enabled: true, sent: await sendReminders(db, today()) };
  });
}
