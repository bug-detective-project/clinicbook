# Solution: A period includes its start and excludes its end

**Root cause.** `insideHours` in `client/src/components/WeekGrid.tsx` checked `time > period.startsAt && time <= period.endsAt`. A period of the clinic starts at `startsAt` (the first slot is there) and ends at `endsAt` (nothing can start there). The comparisons were swapped at both edges.

## Step by step

1. **Reproduce it** with the steps of the ticket: 08:00 is marked, 14:00 is not.
2. **Write the range the way the server does** (a booking is accepted when it starts at or after the start and ends at or before the end):

   ```ts
   function insideHours(hours: Hours[], weekday: number, time: string): boolean {
     return hours.some((period) => period.weekday === weekday && time >= period.startsAt && time < period.endsAt);
   }
   ```

   The times are texts `HH:MM`, which compare in the order of the clock.

The reference also adds a regression test, `client/src/components/WeekGrid.edges.test.tsx`: the first slot of each period, the end of each period, the middle and the gap.

Then run `npm test`, follow the steps of the ticket again, and move the card to **In QA**.
