# Code review: CB-111, the edges of a period

A range has two edges, and each has to be decided on purpose. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- "Inside a period" was written as `start < time <= end`. Most appointments are in the middle of a period, where both edges agree, so the note looked right.
- Appointments at the edges only appear when the hours change after the booking, which is exactly when the note matters.

## Why the reference fix is right

- `start <= time < end`, a half-open range: the first slot is in, the end is out. It is the rule the server uses to accept a booking, so the screen and the API now agree on what "inside the hours" means.
- The comparison stays on the `HH:MM` texts, safe because they have a fixed width.

## Compare with your fix

- Did you convert the times to minutes? Correct, and more code for the same comparison.
- Did you check that the appointment ends before the period ends (`time + 30 <= end`)? Same result with slots of 30 minutes, and more faithful to "the appointment fits". It needs the slot length on the client.
- Did you fix only the start? The 14:00 case is the one the clinic needs to call.

## Watch for next time

- For every range, say whether each edge is included, and test both edges and one step past each.
- Half-open ranges (`start <= x < end`) are the usual choice for time: two ranges that touch never overlap, and the length is `end - start`.
