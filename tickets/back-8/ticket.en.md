# CB-208: Saving the hours of a doctor loses them all when the save fails

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Bug |
| Status | To Do |
| Priority | Highest |
| Reporter | Renata Siqueira (Front desk lead) |
| Track | Back-end |
| Affects version | 1.1 |
| Component | API (doctors) |
| Labels | `doctors`, `hours`, `database` |
| Sprint | CB Sprint 3 |
| Created | 17/03/2026 08:40 |

## Description

Otávio tried to give Dr. Tanabe an early Thursday, from 05:00, through the API (the screen only offers 06:00 to 22:00). The server said no, which is right: the clinic opens at 06:00. But after that Dr. Tanabe had no working hours at all. The booking form showed no free time for her on any day, and her page said "Off" for the whole week.

A change that is refused should change nothing. Here it took away everything she had.

## Steps to reproduce

In the VS Code terminal, with the app running:

```sh
curl http://localhost:3001/api/doctors/3
curl -i -X PATCH http://localhost:3001/api/doctors/3 -H 'content-type: application/json' \
  -d '{"name":"Dr. Yuki Tanabe","specialty":"Dermatology","hours":[{"weekday":4,"startsAt":"05:00","endsAt":"09:00"}]}'
curl http://localhost:3001/api/doctors/3
```

## Expected result

The change is refused (`400`), and the doctor keeps the name, the specialty and every period she had.

## Actual result

`400`, and the doctor has no hours left.

## Acceptance criteria

- [ ] A change of a doctor that the database refuses leaves the doctor exactly as it was: name, specialty and hours.
- [ ] After a refused change, the doctor still has the free times she had.
- [ ] A change that is accepted still saves the name, the specialty and the new hours.

## Environment

- ClinicBook 1.1
- The `working_hours` table refuses periods before 06:00 or after 22:00

## Activity

**Otávio Brandt** · 17/03/2026 09:02
> The name I sent in another try was saved too, even with the 400. So part of the change goes through and part does not.
