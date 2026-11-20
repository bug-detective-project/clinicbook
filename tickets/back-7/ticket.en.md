# CB-207: Validate the CPF of a patient: the check digits

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Story |
| Status | To Do |
| Priority | High |
| Reporter | Otávio Brandt (IT and operations) |
| Track | Back-end |
| Affects version | 1.1 |
| Component | API (patients) |
| Labels | `patients`, `cpf`, `validation` |
| Sprint | CB Sprint 3 |
| Created | 16/03/2026 10:05 |

## Description

The health plans started to send back our bills: "CPF inválido". The receptionist types the CPF of the patient, the screen formats it as `000.000.000-00`, and the server keeps any 11 digits. A typo becomes a valid-looking number nobody has, and we only find out a month later, when the plan refuses to pay.

A CPF already tells whether it was typed right: its last two digits are check digits, worked out from the first nine. We want the server to refuse a CPF whose check digits do not match, the same way it refuses a phone that is not a phone.

## How the check digits work

Take the first nine digits. Multiply them by 10, 9, 8, … 2, from left to right, and add the results. Multiply the sum by 10 and take the rest of the division by 11; a rest of 10 counts as 0. That is the first check digit, the 10th digit of the CPF.

For the second one, do the same with the first ten digits (the nine and the first check digit), with the weights 11, 10, … 2. The result is the 11th digit.

`529.982.247-25`: 5×10 + 2×9 + 9×8 + 9×7 + 8×6 + 2×5 + 2×4 + 4×3 + 7×2 = 295; 2950 mod 11 = 2, the first check digit. With the 2 at the end and the weights 11 to 2, the second comes out 5.

A CPF with all the digits the same (`111.111.111-11`, `000.000.000-00`) passes that arithmetic and is not valid either.

## What is already there

- `server/src/cpf.ts` reads the 11 digits of a CPF written with or without the dots and the dash (`cpfDigits`), and makes a valid CPF from nine digits for the sample data (`cpfFrom`). Look at how `cpfFrom` works out a check digit.
- `server/src/routes/patients.ts` checks the CPF in `inputOf`, used by registering (`POST /api/patients`) and changing (`PATCH /api/patients/:id`) a patient. Today it refuses only a CPF that does not have 11 digits.
- An `InvalidError` with `{ cpf: '…' }` becomes a 400 with the field, and the form shows the message next to the CPF.

## Acceptance criteria

- [ ] Registering or changing a patient with a CPF whose first or second check digit does not match answers 400 with a message for the field `cpf`, and nothing is saved.
- [ ] A CPF with all the digits the same is refused the same way.
- [ ] A real CPF is still accepted, written with or without the dots and the dash, and a CPF that belongs to another patient still answers 409.

## Activity

**Otávio Brandt** · 16/03/2026 10:31
> Message we use on the other systems: "Enter a valid CPF: its check digits do not match". Same text here would be nice.
