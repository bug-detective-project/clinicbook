import type { FastifyInstance } from 'fastify';
import type { Context } from '../context.ts';
import { dueReminders, listReminders, reminderDay, sendReminders } from '../reminders.ts';

export function reminderRoutes(app: FastifyInstance, { db, settings, today }: Context): void {
  // What was sent, and what the next run will send: the appointments of tomorrow not reminded yet.
  app.get('/api/reminders', async () => {
    const day = reminderDay(today());
    // With the option off nothing will go out, so nothing is due.
    const due = settings.remindersEnabled ? await dueReminders(db, day) : [];
    return { enabled: settings.remindersEnabled, day, due, reminders: await listReminders(db) };
  });

  // Sends the reminders of the appointments of tomorrow. With the option off, nothing goes out.
  app.post('/api/reminders/run', async () => {
    if (!settings.remindersEnabled) {
      return { enabled: false, sent: 0 };
    }
    return { enabled: true, sent: await sendReminders(db, today()) };
  });
}
