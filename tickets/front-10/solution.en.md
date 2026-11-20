# Solution: The week of a Sunday ends on that Sunday

**Root cause.** `mondayOf` in `client/src/calendar.ts` moved the day back by `getUTCDay()` days, plus one. `getUTCDay()` counts from Sunday (0) to Saturday (6), so for a Sunday it moved one day **forward**, to the next Monday. The week of a Sunday showed the next week, and a month that begins on a Sunday lost its first day.

## Step by step

1. **Reproduce it**: `/week?day=2026-03-15` shows "Mar 16 – Mar 22, 2026".
2. **Check the numbering**: `getUTCDay()` gives 0 for a Sunday. The clinic's week needs Sunday to be the 7th day.
3. **Use the numbering of the clinic**, which `calendar.ts` already has:

   ```ts
   export function mondayOf(day: string): string {
     return addDays(day, 1 - weekdayOf(day));
   }
   ```

   `weekdayOf` is 1 for Monday and 7 for Sunday, so a Sunday goes back six days.

The reference also adds a regression test, `client/src/calendar.sunday.test.tsx`: the week of a Sunday, the same appointments as its Monday, and **Previous week** from it.

Then run `npm test`, open the week of a Sunday and the month of March 2026, and move the card to **In QA**.
