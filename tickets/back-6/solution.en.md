# Solution: Finishing the reschedule

**What was missing.** `PATCH /api/appointments/:id` existed only as a shell: Fastify checked the body, the route found the appointment, and the answer was 501. Nothing decided whether the appointment may move to the new day and time, and nothing called `moveAppointment`, the write that was ready in the repository.

## Step by step

1. **Read the three layers.** The route (`server/src/routes/appointments.ts`) stops at a comment; `bookAppointment` (`server/src/appointments.ts`) shows the pattern "check, then write" and the checks of a booking, `assertBookable`; `moveAppointment` (`server/src/repository.ts`) writes the day, the time and the status `scheduled`.
2. **Write the rule**, in `server/src/appointments.ts` (add `ConflictError` and `moveAppointment` to the imports):

   ```ts
   export async function rescheduleAppointment(db: Db, today: string, id: number, day: string, time: string): Promise<Appointment> {
     const appointment = await requireAppointment(db, id);
     if (appointment.status === 'cancelled') {
       throw new ConflictError('A cancelled appointment cannot be rescheduled');
     }
     await assertBookable(db, today, appointment.doctorId, day, time);
     return moveAppointment(db, id, day, time);
   }
   ```

3. **Call it from the route**, in place of the 501:

   ```ts
   app.patch<{ Params: Id; Body: { day: string; time: string } }>(
     '/api/appointments/:id',
     { schema: { body: rescheduleBody } },
     (request) => {
       return rescheduleAppointment(db, today(), Number(request.params.id), request.body.day, request.body.time);
     },
   );
   ```

4. **Check the cases of the ticket.** A scheduled appointment moves; a confirmed one moves and becomes scheduled; a cancelled one answers 409; 12:30, a Saturday and last week answer 400 for Dr. Helena Prado; and the **Reschedule** form of the agenda ends on the new day with the appointment in it.

The reference also adds a regression test, `server/src/reschedule.test.ts`, with those cases.

Then run `npm test` and move the card to **In QA**.
