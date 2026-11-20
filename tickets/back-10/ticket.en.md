# CB-210: The last day is missing from the week and the month

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Bug |
| Status | To Do |
| Priority | High |
| Reporter | Dr. Helena Prado (Clinical director) |
| Track | Back-end |
| Affects version | 1.1 |
| Component | API (schedule) |
| Labels | `agenda`, `schedule`, `dates` |
| Sprint | CB Sprint 3 |
| Created | 18/03/2026 11:20 |

## Description

Dr. Oliveira started to see patients on Sundays this month. Giovana booked the first one, for Sunday the 15th, and the appointment is there on the agenda of that day. But the week of the 9th to the 15th does not show the Sunday at all, as if it had nothing.

I looked further: whatever period the agenda asks for, the appointments of its last day are not there. On the month it is less visible, because the last day of the grid is a Sunday of the next month, but it is the same.

## Steps to reproduce

In the VS Code terminal, with the app running (today's appointments of the sample data are on the 9th):

```sh
curl "http://localhost:3001/api/appointments?day=2026-03-09"
curl "http://localhost:3001/api/schedule?from=2026-03-09&to=2026-03-09"
```

## Expected result

The schedule from a day to another has the appointments of every day of the period, the first and the last included: the two answers above have the same appointments.

## Actual result

The schedule of the 9th to the 9th is empty, and a week leaves out its last day.

## Acceptance criteria

- [ ] `GET /api/schedule` has the appointments of the day in `to`, as it has those of the day in `from`, for every doctor and for one.
- [ ] The week of the agenda shows an appointment on its Sunday.
- [ ] The rest of the schedule stays the same: the order, the doctor filter and the limit of 42 days.

## Environment

- ClinicBook 1.1
