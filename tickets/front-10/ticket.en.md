# CB-110: The week opened on a Sunday shows the next week

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Bug |
| Status | To Do |
| Priority | High |
| Reporter | Dr. Helena Prado (Clinical director) |
| Track | Front-end |
| Affects version | 1.1 |
| Component | Agenda |
| Labels | `agenda`, `week`, `dates` |
| Sprint | CB Sprint 3 |
| Created | 18/03/2026 08:55 |

## Description

On Sunday evenings I plan the week, and I picked Sunday the 15th in **Go to a day** on the week of the agenda. The agenda opened the week of the 16th to the 22nd, the week after. The week of a Sunday is the one that ends on it, the 9th to the 15th, here and in every calendar of the clinic.

The month has the same problem in a different shape: March 2026 begins on a Sunday, and the calendar of March starts on Monday the 2nd. The 1st is not on the grid at all.

## Steps to reproduce

1. Open the agenda and the **Week** tab.
2. In **Go to a day**, pick Sunday, March 15, 2026 (or open `/week?day=2026-03-15`).
3. Then open the **Month** tab on March 2026.

## Expected result

The week of the 15th is "Mar 9 – Mar 15, 2026", and **Previous week** goes to "Mar 2 – Mar 8, 2026". The month of March 2026 starts its grid on Monday, February 23, so March 1 is there.

## Actual result

The week of the 15th is "Mar 16 – Mar 22, 2026". The month of March starts on March 2.

## Acceptance criteria

- [ ] A week opened on a Sunday is the week from the Monday before to that Sunday.
- [ ] A month that begins on a Sunday shows its first day, with the days of the previous month before it.
- [ ] Every other day of the week keeps opening the right week.

## Environment

- ClinicBook 1.1
