# CB-111: "Outside the working hours" is wrong at the edges of a period

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Bug |
| Status | To Do |
| Priority | Medium |
| Reporter | Dr. Helena Prado (Clinical director) |
| Track | Front-end |
| Affects version | 1.1 |
| Component | Doctor page |
| Labels | `doctors`, `hours`, `week` |
| Sprint | CB Sprint 3 |
| Created | 19/03/2026 13:20 |

## Description

When we change the hours of a doctor, the page of the doctor points out the appointments that are now outside the hours, so we can call those patients. I moved the end of my Monday from 17:00 to 14:00. The appointment at 14:00 shows as normal, and the one at 08:00, my first slot of the day, says "Outside the working hours".

It is exactly backwards at the edges: the first slot of a period is a normal appointment, and an appointment at the time the period ends is outside it, because it would end after the doctor leaves.

## Steps to reproduce

1. Book an appointment with Dr. Helena Prado next Monday at 14:00 (she already has one at 08:00).
2. On **Doctors**, Dr. Helena Prado, **Edit**: change the Monday so that it ends at 14:00, and save.
3. On her page, go to **Next week** and look at the Monday.

## Expected result

The appointment at 08:00 is a normal appointment. The appointment at 14:00 says "Outside the working hours".

## Actual result

The appointment at 08:00 says "Outside the working hours", and the one at 14:00 does not.

## Acceptance criteria

- [ ] An appointment at the time a period starts is inside the hours.
- [ ] An appointment at the time a period ends is outside the hours.
- [ ] Appointments in the middle of a period are inside, and in the gap between two periods, outside.

## Environment

- ClinicBook 1.1
