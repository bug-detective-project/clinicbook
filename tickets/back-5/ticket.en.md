# CB-205: Build the endpoint of the free times of a doctor

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Story |
| Status | To Do |
| Priority | Highest |
| Reporter | Renata Siqueira (Front desk lead) |
| Track | Back-end |
| Affects version | 1.0 |
| Component | API (doctors) |
| Labels | `doctors`, `api`, `endpoint` |
| Sprint | CB Sprint 2 |
| Created | 12/03/2026 14:10 |

## Description

The booking form is supposed to show the free times of the chosen doctor on the chosen day, so we only pick what exists. Today it says "The free times could not be loaded" and offers nothing: the screen is ready and asks the server, and the server has no such endpoint. We cannot book or reschedule from the form at all.

Every appointment takes a slot of 30 minutes. A doctor has working hours for each day of the week, sometimes in two periods (morning and afternoon, with lunch in between). A time is free when it is the start of a slot of those hours and no appointment that is still valid holds it.

## What is already there

- The client calls `GET /api/doctors/:id/slots?day=YYYY-MM-DD` (`listSlots` in `client/src/api/doctors.ts`) and expects `{ "day": "...", "slots": ["08:00", "08:30", ...] }`.
- `server/src/routes/doctors.ts` has the other route of the doctors. The routes receive `db` and `today()`, the day the server calls today.
- `server/src/repository.ts` has `findDoctor(db, id)`, `workingPeriods(db, doctorId, weekday)` (the periods of a day of the week, the earliest first, each with `startsAt` and `endsAt` as `HH:MM`) and `bookedTimes(db, doctorId, day)` (the times of the appointments of that day that are not cancelled).
- `server/src/dates.ts` has `isDay`, `weekdayOf` (1 is Monday), `minutesOf` (`"08:30"` is 510) and `timeOf` (510 is `"08:30"`). `server/src/schedule.ts` has `SLOT_MINUTES` and `isWorkingTime`, the rule a booking uses to accept a time.
- `server/src/schemas.ts` has `requiredDayQuery`, the schema of a query that must bring a `day`. The errors of `server/src/errors.ts` (`NotFoundError`, `InvalidError`) become the right answers by themselves.

## What to build

`GET /api/doctors/:id/slots?day=YYYY-MM-DD`

- Answers 200 with `{ "day": <the day asked>, "slots": [...] }`. `slots` has every free time of the doctor on that day, as `HH:MM`, in order, the earliest first.
- The slots of a period start at its `startsAt` and follow every 30 minutes; the last one is the one that ends exactly at `endsAt`. A period from 08:00 to 12:00 has 08:00, 08:30, ..., 11:30. A day with two periods has the slots of both.
- A time held by a scheduled or confirmed appointment is left out. The time of a cancelled appointment is free.
- A day of the week the doctor does not work answers an empty list.
- A day before today answers an empty list: nothing can be booked in the past.
- A doctor that does not exist answers 404 with `{ "error": "Doctor not found" }`.
- A request without `day`, or with a `day` that is not a real date (`tomorrow`, `2026-02-30`), answers 400.
- Every time the endpoint offers must be accepted by a booking (`POST /api/appointments`), and after it is booked it is no longer offered.

## Acceptance criteria

- [ ] A day without appointments lists every slot of the doctor's periods, in order.
- [ ] Booked times are left out; the time of a cancelled appointment is offered.
- [ ] A day the doctor does not work and a day that is over answer `"slots": []`.
- [ ] 404 for an unknown doctor; 400 without a day or with a day that is not a date.
- [ ] Every offered time can be booked, and a booked time leaves the list.
- [ ] The booking form shows the free times and books one.

## Environment

- ClinicBook 1.0
- Sample data: Dr. Helena Prado works Monday to Friday, 08:00 to 12:00 and 14:00 to 17:00; Dr. Marcos Oliveira, Monday, Wednesday and Friday, 09:00 to 13:00; Dr. Yuki Tanabe, Tuesday and Thursday, 13:00 to 18:00, and Saturday, 08:00 to 12:00

## Activity

**Renata Siqueira** · 12/03/2026 14:32
> Please do not offer the lunch break. Dr. Helena was booked at 12:30 once, by hand, and she remembers.
