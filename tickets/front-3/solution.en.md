# Solution: A day is shown as the day it is

**Root cause.** `toDate` in `client/src/dates.ts` turns the text of a day into a `Date` with `new Date(day)`. For a text with only a date, JavaScript means midnight in UTC. `formatDay` and `formatShortDay` then write that instant in the time zone of the computer: in São Paulo (UTC-3) it is 21:00 of the day before, so every date is shown one day early. The data never changes; only its reading does.

## Step by step

1. **Trust the data, then follow it.** The API answers `2026-03-10` (Network tab). The title of the agenda comes from `formatDay(day)`, and every other date on the screens from `formatShortDay` or `formatDay` too.
2. **Reproduce it.** With the DevTools pretending to be in São Paulo, `new Date('2026-03-10').toString()` in the console says "Mon Mar 09 2026 21:00:00".
3. **Build the date on the calendar of the computer.** In `client/src/dates.ts`:

   ```ts
   /** The day as a date of this computer's calendar, at midnight. */
   function toDate(day: string): Date {
     const [year, month, date] = day.split('-').map(Number);
     return new Date(year, month - 1, date);
   }
   ```

   Months start at 0 in this constructor, hence `month - 1`. Both formatting functions use `toDate`, so both are fixed.

The reference also adds a regression test, `client/src/dates.timezone.test.ts`, which sets `process.env.TZ` to São Paulo and to Tokyo before formatting: the project's other tests run in UTC (see `vitest.config.ts`), where the bug cannot be seen.

Then run `npm test`, open the agenda of the 10th with the DevTools in São Paulo, and move the card to **In QA**.
