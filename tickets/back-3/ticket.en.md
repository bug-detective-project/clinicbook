# CB-203: Reminders go out even with the option turned off

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Bug |
| Status | To Do |
| Priority | Highest |
| Reporter | Otávio Brandt (IT and operations) |
| Track | Back-end |
| Affects version | 1.0 |
| Component | Server configuration |
| Labels | `configuration`, `reminders` |
| Sprint | CB Sprint 2 |
| Created | 13/03/2026 08:15 |

## Description

We opened a second unit of the clinic last week. It is not ready to send reminders: the patients there have not agreed to receive messages yet, and sending them anyway is a legal problem for us.

So I started the server of that unit with `REMINDERS_ENABLED=false`, as the README says. The Reminders screen still shows the button, the front desk clicked it on the first day, and twelve patients got a message they never asked for.

I checked three times that the variable is set, and it is. The server reads it and does the opposite.

## Steps to reproduce

In the VS Code terminal (stop the server first if it is running):

```sh
REMINDERS_ENABLED=false npm run dev
```

Then, in another terminal:

```sh
curl http://localhost:3001/api/reminders
curl -X POST http://localhost:3001/api/reminders/run
```

Or open **Reminders** in the browser.

## Expected result

With `REMINDERS_ENABLED=false`: `GET /api/reminders` says `"enabled": false`, `POST /api/reminders/run` answers `{ "enabled": false, "sent": 0 }` and sends nothing, and the screen says that the reminders are turned off, without the button.

Without the variable, the reminders stay on, as today.

## Actual result

`"enabled": true`, and the run sends the reminders of tomorrow.

## Acceptance criteria

- [ ] `REMINDERS_ENABLED=false` turns the reminders off: nothing is sent, however many times the run is asked for.
- [ ] `false` works in any case (`FALSE`, `False`), and `0` turns them off too.
- [ ] Without the variable, with `true` or with `1`, the reminders are on.
- [ ] The Reminders screen says that they are turned off and offers nothing to send.

## Environment

- ClinicBook 1.0, the server of the second unit
- QA runs the app with `REMINDERS_ENABLED=false`

## Activity

**Otávio Brandt** · 13/03/2026 08:40
> For the record, I also tried `REMINDERS_ENABLED=0` and `REMINDERS_ENABLED=no`. Still on. The only thing that turned them off was `REMINDERS_ENABLED=` with nothing after the equals sign, which I found by accident and do not trust.
