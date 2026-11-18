# CB-102: The total of the day does not change when an appointment is cancelled

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Bug |
| Status | To Do |
| Priority | Medium |
| Reporter | Renata Siqueira (Front desk lead) |
| Track | Front-end |
| Affects version | 1.0 |
| Component | Agenda |
| Labels | `agenda`, `total` |
| Sprint | CB Sprint 2 |
| Created | 09/03/2026 10:15 |

## Description

Above the list, the agenda says how many appointments the day has, without the cancelled ones. We read that number out loud to the doctors at the start of each shift.

When I cancel an appointment, the row turns to "Cancelled" at once, and the number above it stays the same. A while later it corrects itself, and a reload corrects it too. In between, the number and the list disagree, and that is exactly when someone asks me "how many today?".

## Steps to reproduce

1. Open the agenda of a day with a few appointments and note the total above the list.
2. Click **Cancel** on one of them.
3. Look at the total right away.

## Expected result

The total goes down by one as soon as the row shows "Cancelled".

## Actual result

The row shows "Cancelled" and the total keeps the old number for several seconds.

## Acceptance criteria

- [ ] Cancelling an appointment lowers the total at once, every time.
- [ ] Confirming an appointment does not change the total.
- [ ] The total on the screen is always the one a reload would show.

## Environment

- ClinicBook 1.0, Chrome

## Activity

**Renata Siqueira** · 09/03/2026 10:32
> It is never wrong when I open the agenda. Only after I change something on that screen.
