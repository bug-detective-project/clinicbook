# Code review: CB-206, finishing the reschedule

Finishing someone else's half is its own skill: most of the work is finding out what the first half assumed. Here is the reference approach, so you can compare it with yours.

## What this ticket was about

- Reading a feature that was started: a route that stops at a comment, a write that nobody calls, and a sibling (booking) that is complete.
- Making "change" obey the same rules as "create", by sharing them and not by copying them.
- Adding the rules that only a change has: the state the appointment is in now, and the state it is left in.

## Why the reference is built this way

- The new code is one function in the rules layer, `rescheduleAppointment`, and one line in the route. The route still only reads the request and answers.
- It reuses `assertBookable` with the doctor of the appointment. Whatever a booking refuses, a reschedule refuses with the same status and the same words, today and after the next change of the rules.
- The checks come before the write, and the write is one statement. A refused request cannot leave the appointment half moved.
- The state rule is spelled out: cancelled is refused, and `moveAppointment` sets the status to scheduled, so a confirmed appointment asks for a new confirmation.
- `requireAppointment` gives the 404 for free, the same way the other routes get it.

## Compare with what you built

- Did you copy the checks of `assertBookable` into the new function? It passes today. The next rule added to bookings (a holiday, a limit per day) will be added in one of the two places.
- Did you write the checks in the route? They work there, and the rules of the clinic are now in two layers; the next reader will look in `appointments.ts` and not find them.
- Did you cancel the old appointment and create a new one? The appointment gets a new id, its reminder and its history point at the old one, and the patient's record gains a cancellation that never happened. That is the manual workaround the ticket wanted to end.
- Did you keep the status as it was? A confirmed appointment would stay confirmed for a day and time the patient never confirmed.
- Did you write an `UPDATE` of your own and leave `moveAppointment` unused? It works; reading the repository first would have saved the query.
- Did you let the request change the doctor? The ticket said same doctor, and the body has no field for it.

## Watch for next time

- When "create" and "edit" disagree, look for the rule that one of them has and the other lacks. Sharing one function is the lasting fix.
- Before finishing a half-built feature, list what already exists and is unused. It is usually the first half of your work.
