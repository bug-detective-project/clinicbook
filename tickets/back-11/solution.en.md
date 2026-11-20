# Solution: A field that is not sent keeps its value

**Root cause.** The route `PATCH /api/patients/:id` in `server/src/routes/patients.ts` fills the e-mail and the birth date with `body.email ?? null` and `body.birthDate ?? null`. A field left out of the body is `undefined`, and `undefined ?? null` is `null`: the field is cleared as if it had been sent as `null`.

## Step by step

1. **Reproduce it** with the `curl` of the ticket: the plan changes, and the e-mail and the birth date become `null`.
2. **Tell the three cases apart.** Absent keeps the value, `null` clears it, a value changes it. `in` asks whether the field was sent at all:

   ```ts
   const merged: PatientBody = {
     name: body.name ?? patient.name,
     phone: body.phone ?? patient.phone,
     email: 'email' in body ? body.email : patient.email,
     birthDate: 'birthDate' in body ? body.birthDate : patient.birthDate,
     cpf: body.cpf ?? patient.cpf,
     healthPlan: body.healthPlan ?? patient.healthPlan,
   };
   ```

   The required fields can keep `??`: the schema never lets them be `null`.

The reference also adds a regression test, `server/src/patient-partial-change.test.ts`: only the plan, only the phone, and a birth date sent as `null`.

Then run `npm test`, repeat the `curl` of the ticket, and move the card to **In QA**.
