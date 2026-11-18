# Code review: CB-205, the free times of a doctor

An endpoint like this is a small algorithm with a route around it, and each half is easier when the other is out of the way. Here is the reference approach, so you can compare it with yours.

## What this ticket was about

- Listing the answers of an endpoint before writing it: the success, the two empty cases, the 404 and the 400.
- Generating a sequence (the slots of a period) and taking a set out of it (the booked times).
- Agreeing with a rule that already exists: whatever this endpoint offers, the booking must accept.

## Why the reference is built this way

- The computation is a pure function, `freeSlots(periods, booked)`, in its own file. It needs no database and no request, so it can be read, tested and reused alone.
- It works in minutes. `"08:30"` as 510 turns "the next slot" into an addition and "does it fit" into a comparison; the texts come back only at the end.
- The loop ends on `start + SLOT_MINUTES <= until`, the same condition as `isWorkingTime`. The last slot of a morning that ends at 12:00 is 11:30, on both sides.
- The booked times go into a `Set`, so checking each slot does not walk the list again.
- The route only decides which case it is in, in an order that puts the cheapest refusals first, and delegates the rest. Its queries were already in the repository.
- `bookedTimes` leaves cancelled appointments out, so a cancelled time is offered again without a line of code here.

## Compare with what you built

- Did you write the 14 times of a day as a fixed list? It matches the sample doctors and breaks the day someone changes a row of `working_hours`.
- Did you loop with `start < until`? A period that ends at 12:15 would then offer 12:00, an appointment that ends after the doctor left.
- Did you compare texts, `"9:00" < "10:00"`? Text comparison works only while every time has two digits for the hour; minutes do not have that trap.
- Did you filter the appointments in JavaScript after loading all of them? Correct, and the database was asked for much more than the question needed.
- Did you answer 404 for a day the doctor does not work? The doctor exists and the question is valid; the answer is "none", which is an empty list.
- Did you put the loop inside the route? It works; the next person who needs the free times (a report, the reminders) will have to copy it out.

## Watch for next time

- When two pieces of code must agree (what is offered and what is accepted), make them share the rule or at least the condition, and test them against each other.
- Convert to the representation that makes the arithmetic trivial, compute, and convert back at the edge.
