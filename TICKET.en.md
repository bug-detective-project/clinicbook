# CB-104: The agenda keeps refreshing after I leave the screen

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Bug |
| Status | To Do |
| Priority | Medium |
| Reporter | Otávio Brandt (IT and operations) |
| Track | Front-end |
| Affects version | 1.0 |
| Component | Agenda |
| Labels | `agenda`, `refresh`, `performance` |
| Sprint | CB Sprint 2 |
| Created | 10/03/2026 14:30 |

## Description

The agenda asks the server for the appointments every 15 seconds, so the two desks see each other's changes. That is fine while the agenda is on the screen.

I was looking at the server log and found something else. A front desk computer that has been open since the morning sends dozens of requests for the agenda every 15 seconds, also while the receptionist is on **Patients** or on **Reminders**, and for days nobody is looking at. By the afternoon those computers are slow and their fans are loud. Reloading the page makes it calm again, for a while.

## Steps to reproduce

1. Open the agenda with the Network tab of the DevTools open, and filter by `appointments`.
2. Wait: one request every 15 seconds. This is expected.
3. Go to **Patients** and wait: the requests for the agenda keep coming.
4. Go back to the agenda, click **Next day** a few times and wait: every 15 seconds there is now a burst of requests, for several days.

## Expected result

While the agenda is on the screen, one request every 15 seconds, for the day on the screen. On any other screen, none.

## Actual result

The requests never stop, and every visit to the agenda and every change of day adds one more to each round.

## Acceptance criteria

- [ ] With the agenda open, it asks the server again every 15 seconds.
- [ ] After I go to another screen, no request for the agenda is made.
- [ ] After I change the day, each round has one request, for the day on the screen.
- [ ] Leaving the agenda and coming back does not add requests.

## Environment

- ClinicBook 1.0, Chrome
- Seen in the server log and in the Network tab

## Activity

**Otávio Brandt** · 10/03/2026 15:02
> Please keep the refresh itself. The front desk relies on it.
