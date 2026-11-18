# Solution: The total that follows the list

**Root cause.** `AgendaPage` (`client/src/pages/AgendaPage.tsx`) keeps the total of the day in its own state, `total`, set only when the list is loaded. `change`, which runs after **Cancel** and **Confirm**, updates the appointment inside `appointments` and never touches `total`. The number stays old until the agenda refreshes itself, 15 seconds later at most.

## Step by step

1. **Find the two sources.** The row reads `appointments`; the line above the list reads `total`. Only `load` calls `setTotal`.
2. **Remove the copy.** Delete the `total` state and the `setTotal` call in `load`:

   ```tsx
   .then((list) => {
     if (current) {
       setAppointments(list);
     }
   })
   ```

3. **Compute the number while rendering**, just before the `return`:

   ```tsx
   // A cancelled appointment stays on the list, and does not count.
   const total = (appointments ?? []).filter((appointment) => appointment.status !== 'cancelled').length;
   ```

   The JSX keeps using `total`, now a plain value.

The reference also adds a regression test, `client/src/pages/AgendaPage.total.test.tsx`: the total goes down with each cancellation and stays the same after a confirmation.

Then run `npm test`, cancel an appointment in the browser while watching the number, and move the card to **In QA**.
