# CB-212: Removing a doctor with booked appointments deletes the appointments too

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Bug |
| Status | To Do |
| Priority | Highest |
| Reporter | Dr. Helena Prado (Clinical director) |
| Track | Back-end |
| Affects version | 1.1 |
| Component | API (doctors) |
| Labels | `doctors`, `appointments`, `rules` |
| Sprint | CB Sprint 3 |
| Created | 19/03/2026 09:10 |

## Description

A receptionist removed Dr. Oliveira by mistake on the edit screen; she meant to change his specialty. The screen asked for a confirmation, she clicked **Remove**, and he was gone. That is bad enough. Worse: all his appointments went with him. The patients of the week were no longer on the agenda, and nobody called them. Two came to an appointment that did not exist any more.

The screen lets you try to remove any doctor, and that is fine: it is the server that knows who has appointments. The rule of the clinic is the same as for patients: a doctor with appointments stays.

## Steps to reproduce

In the VS Code terminal, with the app running (Dr. Prado, doctor 1, has appointments today):

```sh
curl "http://localhost:3001/api/appointments?day=2026-03-09"
curl -i -X DELETE http://localhost:3001/api/doctors/1
curl "http://localhost:3001/api/appointments?day=2026-03-09"
```

Or on the screen: **Doctors**, a doctor, **Edit**, **Remove doctor**, **Remove**.

## Expected result

`409` with `{ "error": "This record is in use and cannot be removed" }`. The doctor, the hours and the appointments stay. The edit screen shows the message, as the list of patients does for a patient with appointments.

## Actual result

`204`: the doctor, the hours and every appointment of the doctor are deleted.

## Acceptance criteria

- [ ] Removing a doctor with appointments answers 409 with the message above, and the doctor, the hours and the appointments stay.
- [ ] The edit screen shows the message and stays open.
- [ ] A doctor without appointments can still be removed, with the hours.

## Environment

- ClinicBook 1.1

## Activity

**Otávio Brandt** · 19/03/2026 09:40
> The patients have this rule already: removing one with appointments gives 409. I would expect the doctors to work the same way.
