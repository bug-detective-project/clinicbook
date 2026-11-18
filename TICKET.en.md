# CB-206: Finish rescheduling: it works when booking and fails when changing

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Story |
| Status | To Do |
| Priority | High |
| Reporter | Renata Siqueira (Front desk lead) |
| Track | Back-end |
| Affects version | 1.0 |
| Component | API (appointments) |
| Labels | `appointments`, `reschedule`, `endpoint` |
| Sprint | CB Sprint 2 |
| Created | 13/03/2026 14:00 |

## Description

Every appointment in the agenda has a **Reschedule** button. It opens the same form we use to book, we pick the new day and time, we click **Reschedule**, and the answer is "Rescheduling is not available yet".

So today we reschedule by hand: cancel the appointment and book another one. The patient gets a cancelled appointment in their record for each change, and twice this week we cancelled and then forgot to book the new one.

The team told us the feature was started and never finished. The screen is done and booking works; the part of the server that changes an appointment that already exists is the part that is missing.

## What is already there

- The client calls `PATCH /api/appointments/:id` with `{ "day": "YYYY-MM-DD", "time": "HH:MM" }` (`rescheduleAppointment` in `client/src/api/appointments.ts`) and expects the appointment as it is after the change.
- The route exists in `server/src/routes/appointments.ts`: Fastify checks the body with `rescheduleBody`, the route finds the appointment (404 when there is none), and then it answers 501. A comment marks where the work stopped.
- `server/src/appointments.ts` has the rules of the clinic. `bookAppointment` shows what a booking checks, through `assertBookable`: the doctor exists, the day is a real date and is not in the past, and the time is a slot of the doctor's working hours.
- `moveAppointment(db, id, day, time)` in `server/src/repository.ts` writes the new day and time and gives back the appointment. It is not called from anywhere yet.

## What to build

Finish `PATCH /api/appointments/:id`:

- It moves the appointment to the new day and time, with the same patient, doctor and reason, and answers 200 with the appointment as it is now, in the same shape as the other routes.
- **The new day and time follow the rules of a booking**, for the doctor of the appointment: a day in the past, a day or a time outside the doctor's working hours, a time that is not the start of a slot and a day that is not a real date are refused with 400 and the same messages a booking gives.
- **A cancelled appointment cannot be rescheduled**: 409 with `{ "error": "A cancelled appointment cannot be rescheduled" }`.
- **A rescheduled appointment waits for a new confirmation.** Scheduled stays scheduled; confirmed goes back to scheduled.
- When the request is refused, the appointment stays exactly as it was.
- An appointment that does not exist answers 404, as today, and a body without `day` or `time` answers 400 with the fields, as today.
- As in the rest of the server, the route reads the request and answers, and the rule lives with the other rules in `server/src/appointments.ts`.

## Acceptance criteria

- [ ] A scheduled appointment moves to the new day and time and keeps its patient, doctor and reason.
- [ ] A confirmed appointment goes back to scheduled when it is moved.
- [ ] A cancelled appointment answers 409 with the message above and does not move.
- [ ] A time outside the working hours, a time in the middle of a slot and a day in the past answer 400, like a booking, and the appointment does not move.
- [ ] 404 for an appointment that does not exist; 400 for a body without the day or the time.
- [ ] The **Reschedule** form of the agenda moves the appointment and shows it on the new day.

## Environment

- ClinicBook 1.0

## Activity

**Renata Siqueira** · 13/03/2026 14:21
> Same doctor only. If the patient wants another doctor, that is a new appointment, and we are fine with booking it as one.
