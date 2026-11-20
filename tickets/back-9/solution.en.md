# Solution: The periods are sorted before they are compared

**Root cause.** `hoursProblem` in `server/src/routes/doctors.ts` compares each period with the one right before it, in the order of the request. Overlapping periods that are not neighbours in that order are never compared.

## Step by step

1. **Reproduce it** with the `curl` of the ticket: 200 for 11:00–15:00, 16:00–18:00, 08:00–12:00.
2. **Sort before comparing.** In a list sorted by day and start, any overlap shows between two neighbours:

   ```ts
   const sorted = [...hours].sort((a, b) => a.weekday - b.weekday || a.startsAt.localeCompare(b.startsAt));
   for (let index = 1; index < sorted.length; index += 1) {
     const before = sorted[index - 1]!;
     const period = sorted[index]!;
     if (period.weekday === before.weekday && period.startsAt < before.endsAt) {
       return `${WEEKDAYS[period.weekday - 1]}: two periods overlap`;
     }
   }
   ```

   `[...hours]` sorts a copy: the hours that are saved keep the order they came in.

The reference also adds a regression test, `server/src/hours-out-of-order.test.ts`: overlaps with a period of the same day or of another day between them, a new doctor, and periods only out of order, which are accepted.

Then run `npm test`, repeat the `curl` of the ticket, and move the card to **In QA**.
