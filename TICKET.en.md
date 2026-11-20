# CB-109: Cancelling the edit of a patient changes the record

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Bug |
| Status | To Do |
| Priority | Medium |
| Reporter | Renata Siqueira (Front desk lead) |
| Track | Front-end |
| Affects version | 1.1 |
| Component | Patient record |
| Labels | `patients`, `record`, `form` |
| Sprint | CB Sprint 3 |
| Created | 17/03/2026 11:30 |

## Description

I opened the record of Elisa Gomes, clicked **Edit** to check something, and closed the form with **Cancel** without changing anything. Her record now says nothing in the e-mail line, where it said "No e-mail" a second before. On a patient without a birth date, the birth date line says "Invalid Date".

Nothing was saved (when I reload the page the record is fine again), but the screen shows the patient differently after a cancel, and the receptionists think the data was lost.

## Steps to reproduce

1. Open **Patients** and the record of Elisa Gomes (she has no e-mail).
2. Click **Edit**, then **Cancel**.
3. Look at the e-mail line of the record.

## Expected result

After **Cancel**, the record shows the patient exactly as before: "No e-mail", "Not informed", the same phone, plan and CPF.

## Actual result

The e-mail line is empty. A patient without a birth date shows "Invalid Date" in the birth date line.

## Acceptance criteria

- [ ] Cancelling the edit of a patient leaves the record exactly as it was, whatever was typed in the form.
- [ ] A patient without an e-mail or a birth date still says so after a cancelled edit.
- [ ] Opening the form again shows the data of the patient, and saving still works.

## Environment

- ClinicBook 1.1
