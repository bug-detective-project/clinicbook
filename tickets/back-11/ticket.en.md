# CB-211: Changing only the health plan clears the e-mail and the birth date

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Bug |
| Status | To Do |
| Priority | High |
| Reporter | Otávio Brandt (IT and operations) |
| Track | Back-end |
| Affects version | 1.1 |
| Component | API (patients) |
| Labels | `patients`, `api`, `patch` |
| Sprint | CB Sprint 3 |
| Created | 18/03/2026 16:45 |

## Description

The health plan portal tells us when a patient changes plans, and a small script of ours updates the patient with `PATCH /api/patients/:id` sending only `{ "healthPlan": "…" }`. That is what a PATCH is for: send what changed.

Since the script started, every patient it touched lost the e-mail and the birth date. Ana Beatriz Costa now has "No e-mail" and "Not informed" on her record. The plan is right.

## Steps to reproduce

In the VS Code terminal, with the app running:

```sh
curl http://localhost:3001/api/patients/1
curl -i -X PATCH http://localhost:3001/api/patients/1 -H 'content-type: application/json' -d '{"healthPlan":"Amparo Vida"}'
curl http://localhost:3001/api/patients/1
```

## Expected result

The health plan changes, and every field the request did not send keeps its value.

## Actual result

The health plan changes, and the e-mail and the birth date become `null`.

## Acceptance criteria

- [ ] A `PATCH` changes only the fields it sends; the e-mail and the birth date keep their values when they are left out.
- [ ] An e-mail or a birth date sent as `null` is still cleared.
- [ ] The form of the record, which sends every field, still saves as before.

## Environment

- ClinicBook 1.1
- The plan update script of IT
