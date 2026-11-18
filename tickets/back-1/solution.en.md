# Solution: A cancelled appointment stays cancelled

**Root cause.** `confirmAppointment` in `server/src/appointments.ts` checks that the appointment exists and writes the status `confirmed` without looking at the status it had. The rule that forbids it exists (`assertTransition` in `server/src/rules.ts`: nothing follows `cancelled`), and `cancelAppointment` uses it; `confirmAppointment` never calls it.

## Step by step

1. **Reproduce it without the screen.** `POST /api/appointments/9/confirm` answers 200 for a cancelled appointment.
2. **Compare the two siblings.** `cancelAppointment` calls `assertTransition(appointment.status, 'cancelled')` before it writes.
3. **Ask the rule before confirming.**

   ```ts
   export async function confirmAppointment(db: Db, id: number): Promise<Appointment> {
     const appointment = await requireAppointment(db, id);
     assertTransition(appointment.status, 'confirmed');
     return setAppointmentStatus(db, id, 'confirmed');
   }
   ```

   For a cancelled appointment `assertTransition` throws a `ConflictError`, and the error handler answers 409 with "A cancelled appointment cannot be confirmed".

The reference also adds a regression test, `server/src/confirm-rules.test.ts`: a cancelled appointment, one cancelled a moment before, one already confirmed, and a scheduled one that is still confirmed.

Then run `npm test`, repeat the `curl` of the ticket, and move the card to **In QA**.
