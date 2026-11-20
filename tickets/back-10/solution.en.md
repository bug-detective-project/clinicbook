# Solution: The last day of a period is in the period

**Root cause.** `listAppointmentsBetween` in `server/src/repository.ts` keeps the days `>= from` and `< to`. The API says both days are included, and the screens ask for whole weeks (Monday to Sunday): the last day was always left out.

## Step by step

1. **Reproduce it**: `GET /api/schedule?from=2026-03-09&to=2026-03-09` is empty, while the agenda of the 9th has appointments.
2. **Read the condition** of the query on `appointments.day`.
3. **Include the last day:**

   ```ts
   let query = appointments(db).where('appointments.day', '>=', from).where('appointments.day', '<=', to);
   ```

   Days written as `YYYY-MM-DD` compare as texts in the order of the calendar, so `<=` on the text is `<=` on the date.

The reference also adds a regression test, `server/src/schedule-last-day.test.ts`: a schedule of one day, of a whole week, and of one doctor, each compared with the appointments of its days.

Then run `npm test`, open the week of a day with an appointment on its Sunday, and move the card to **In QA**.
