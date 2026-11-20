# CB-209: Overlapping periods are accepted when they come out of order

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Bug |
| Status | To Do |
| Priority | High |
| Reporter | Otávio Brandt (IT and operations) |
| Track | Back-end |
| Affects version | 1.1 |
| Component | API (doctors) |
| Labels | `doctors`, `hours`, `rules` |
| Sprint | CB Sprint 3 |
| Created | 17/03/2026 14:15 |

## Description

Our scheduling export sends the hours of a doctor to the API in the order they are in the spreadsheet, not sorted. Yesterday it gave Dr. Prado a Tuesday with 11:00 to 15:00, 16:00 to 18:00 and 08:00 to 12:00. The server took it. Two periods cover 11:00 to 12:00, and the free times of that morning came out wrong.

When I send the same periods sorted, the server refuses with "Tuesday: two periods overlap", as it should. The rule depends on the order the periods arrive in.

## Steps to reproduce

In the VS Code terminal, with the app running:

```sh
curl -i -X PATCH http://localhost:3001/api/doctors/3 -H 'content-type: application/json' \
  -d '{"name":"Dr. Yuki Tanabe","specialty":"Dermatology","hours":[{"weekday":2,"startsAt":"11:00","endsAt":"15:00"},{"weekday":2,"startsAt":"16:00","endsAt":"18:00"},{"weekday":2,"startsAt":"08:00","endsAt":"12:00"}]}'
```

## Expected result

`400` with `{ "hours": "Tuesday: two periods overlap" }` in `fields`, and the hours of the doctor stay as they were.

## Actual result

`200`, and the doctor has the overlapping periods.

## Acceptance criteria

- [ ] Periods of the same day that overlap are refused whatever the order they come in, also with other periods (of that day or another) between them.
- [ ] The same goes for a new doctor (`POST /api/doctors`).
- [ ] Periods that come out of order without overlapping are still accepted.

## Environment

- ClinicBook 1.1
- The scheduling export of IT
