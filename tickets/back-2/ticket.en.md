# CB-202: A phone with letters is accepted and breaks the reminders

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Bug |
| Status | To Do |
| Priority | High |
| Reporter | Otávio Brandt (IT and operations) |
| Track | Back-end |
| Affects version | 1.0 |
| Component | API (patients) |
| Labels | `patients`, `validation`, `reminders` |
| Sprint | CB Sprint 2 |
| Created | 12/03/2026 10:05 |

## Description

On Tuesday nobody got a reminder. The front desk clicked **Send the reminders of tomorrow** and the screen answered "The reminders were not sent: Internal server error". It took me a while to find the reason: one patient was registered with the phone `11 98888-7777 (mom)`. The reminders stop at the first phone they cannot dial, and that one patient took everybody else's reminder down.

I fixed that phone by hand in the database. The real problem is that it got in: the form refuses `1234` as too short, so I assumed the phone was being checked. It accepts almost anything else, as long as there are enough digits somewhere in the text.

A phone is digits, spaces, dashes and parentheses, with an optional `+` in front, 8 to 20 characters. Nothing else.

## Steps to reproduce

In the VS Code terminal, with the app running:

```sh
curl -i -X POST http://localhost:3001/api/patients \
  -H "Content-Type: application/json" \
  -d '{"name":"Vera Xavier","phone":"11 9888-77AB"}'
```

Or in the screen: **Patients**, **New patient**, with the same phone.

## Expected result

`400`, with the message of the phone field: "Use only digits, spaces, dashes and parentheses (8 to 20 characters)". The patient is not registered.

## Actual result

`201`. The patient is registered with that phone, and the next reminder for them fails for everyone.

## Acceptance criteria

- [ ] A phone with letters or words, before, after or in the middle of the number, is refused with 400 and the message of the field.
- [ ] A phone with more than 20 characters is refused.
- [ ] The formats we use are still accepted: `11988887777`, `(11) 98888-7777`, `+55 11 98888-7777`, `3555-4004`.
- [ ] The form shows the message next to the phone and registers nobody.

## Environment

- ClinicBook 1.0

## Activity

**Otávio Brandt** · 12/03/2026 10:31
> Other examples the front desk typed in the last month: `call 11 98888-7777`, `(11) 98888-7777 ext. 2`, `11 98888-7777 / 11 3555-4004`. All accepted.
