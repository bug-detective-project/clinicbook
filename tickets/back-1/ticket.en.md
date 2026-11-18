# CB-201: A cancelled appointment can be confirmed again

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Bug |
| Status | To Do |
| Priority | High |
| Reporter | Renata Siqueira (Front desk lead) |
| Track | Back-end |
| Affects version | 1.0 |
| Component | API (appointments) |
| Labels | `appointments`, `status`, `rules` |
| Sprint | CB Sprint 2 |
| Created | 09/03/2026 15:20 |

## Description

A patient called to cancel, and I cancelled the appointment at my desk. A few seconds later my colleague, at the other desk, clicked **Confirm** on the same appointment: her screen had not refreshed yet and still showed it as scheduled. The appointment came back to life as "Confirmed".

Meanwhile I had already given that time to another patient. Both came. The doctor was not amused.

The rule of the clinic is simple: a cancelled appointment stays cancelled. If the patient changes their mind, we book a new one.

## Steps to reproduce

In the VS Code terminal, with the app running (appointment 9 of the sample data is cancelled):

```sh
curl -i -X POST http://localhost:3001/api/appointments/9/confirm
curl http://localhost:3001/api/appointments/9
```

Or with two browser windows on the agenda: cancel an appointment in one, and click **Confirm** on it in the other before that one refreshes.

## Expected result

The server refuses: `409` with `{ "error": "A cancelled appointment cannot be confirmed" }`, and the appointment stays cancelled. The agenda already shows the message the server sends and loads the list again.

## Actual result

`200`, and the appointment is confirmed.

## Acceptance criteria

- [ ] Confirming a cancelled appointment answers 409 with the message above, and the appointment stays cancelled.
- [ ] The time of a cancelled appointment stays free for other patients.
- [ ] A scheduled appointment can still be confirmed.

## Environment

- ClinicBook 1.0
- Two front desk computers on the same agenda

## Activity

**Renata Siqueira** · 09/03/2026 15:44
> Cancelling something twice already gives an error, "This appointment is already cancelled". So some rule exists somewhere. Confirming just does not seem to ask it.
