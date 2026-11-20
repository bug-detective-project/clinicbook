# CB-108: A success message stays on the screen while I keep working

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Bug |
| Status | To Do |
| Priority | Medium |
| Reporter | Renata Siqueira (Front desk lead) |
| Track | Front-end |
| Affects version | 1.1 |
| Component | Toasts |
| Labels | `toasts`, `agenda`, `timers` |
| Sprint | CB Sprint 3 |
| Created | 16/03/2026 09:15 |

## Description

In the morning I confirm the appointments of the day one after the other. Each confirmation shows a green message at the bottom of the screen ("The appointment of … was confirmed."), and each message is supposed to go away after a few seconds.

They do not. As long as I keep confirming, the first message never leaves; they pile up on top of each other and cover the agenda. Only when I stop for a while do they all go away. A red message (an error) stays even longer: it starts its time again every time another message comes or goes.

## Steps to reproduce

1. Open the agenda of today.
2. Click **Confirm** on an appointment.
3. About three seconds later, click **Confirm** on another one.
4. Watch the first message.

## Expected result

Each message stays its own time (4 seconds for a success, 7 for an error) from the moment it shows, whatever other messages do in the meantime.

## Actual result

The first message stays until about 4 seconds after the second one appeared. With a click every few seconds, it never goes away.

## Acceptance criteria

- [ ] A message goes away its own time after it showed, even when other messages come or go in the meantime.
- [ ] Two messages shown one after the other are both gone a few seconds later.
- [ ] **Dismiss** still closes a message at once.

## Environment

- ClinicBook 1.1
- Any browser
