# Solution: The endpoint of the free times of a doctor

**What was missing.** The client asks `GET /api/doctors/:id/slots?day=` and the server had no such route: the answer was the 404 of an unknown address, and the booking form could offer nothing. The pieces were there (the working periods, the booked times, the helpers for minutes); the computation and the route were not.

## Step by step

1. **Write the computation alone**, in `server/src/slots.ts`:

   ```ts
   import { minutesOf, timeOf } from './dates.ts';
   import { SLOT_MINUTES } from './schedule.ts';
   import type { Period } from './schedule.ts';

   export function freeSlots(periods: Period[], booked: string[]): string[] {
     const taken = new Set(booked);
     const slots: string[] = [];
     for (const period of periods) {
       const until = minutesOf(period.endsAt);
       for (let start = minutesOf(period.startsAt); start + SLOT_MINUTES <= until; start += SLOT_MINUTES) {
         const time = timeOf(start);
         if (!taken.has(time)) {
           slots.push(time);
         }
       }
     }
     return slots.sort();
   }
   ```

2. **Add the route**, in `server/src/routes/doctors.ts` (the function now also takes `today` from the context):

   ```ts
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
   ```

3. **Check the cases of the ticket** with `curl http://localhost:3001/api/doctors/1/slots?day=<a day>`: a weekday has the two periods without the lunch break, a Sunday is empty, yesterday is empty, doctor 999 is a 404, and no `day` is a 400.
4. **Check the form.** **Book appointment** now shows the times, and a booked time is gone when the form is opened again.

The reference also adds a regression test, `server/src/slots.test.ts`, with those cases and one more: every time the endpoint offers is accepted by a booking.

Then run `npm test` and move the card to **In QA**.
