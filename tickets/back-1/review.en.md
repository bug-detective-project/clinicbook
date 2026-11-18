# Code review: CB-201, a cancelled appointment stays cancelled

The rule existed, was correct and was tested. One of the two functions that should ask it did not. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- The states of an appointment and the moves between them are in one table, in `server/src/rules.ts`. `assertTransition` reads it.
- `cancelAppointment` asked the rule. `confirmAppointment` only checked that the appointment existed and then wrote `confirmed`.
- The screen hid the hole most of the time: it offers **Confirm** only on scheduled appointments. A screen that is 15 seconds old, a second tab or a direct call to the API go straight past that.

## Why the reference fix is right

- One line: `assertTransition(appointment.status, 'confirmed')`, before the write. Confirming now follows the same table as cancelling.
- The 409 and its message come from the rule, so the two operations answer in the same voice, and a new state added to the table is respected by both.
- The check is on the server. The agenda shows the refusal and reloads the list, which also tells the second receptionist what happened.

## Compare with your fix

- Did you write `if (appointment.status === 'cancelled') throw ...` inside `confirmAppointment`? It closes this ticket and leaves two places that know the rule; they will drift apart. It also still lets a confirmed appointment be "confirmed" again.
- Did you put the check in the route? The rule then belongs to one way in. The next caller of `confirmAppointment` skips it.
- Did you hide the button better on the client? The client was never the problem: it showed what it knew.
- Did you change the table in `rules.ts`? It was right already.

## Watch for next time

- What the screen does not offer, the API must still refuse. The screen is one client among others, and never fully up to date.
- When two operations are siblings (confirm and cancel, create and edit), read them side by side. The difference is usually the bug.
