# Solution: The form starts from a copy of the patient

**Root cause.** `formOf` in `client/src/components/PatientDialog.tsx` prepared the fields with `Object.assign(patient, { phone: …, email: patient.email ?? '', birthDate: patient.birthDate ?? '', cpf: … })`. `Object.assign` changes its first argument: the patient the record holds got an empty e-mail, an empty birth date and a masked CPF the moment the form opened, and the record showed them after **Cancel**.

## Step by step

1. **Reproduce it** on a patient without an e-mail: **Edit**, **Cancel**, and the e-mail line is empty.
2. **Find what writes into the patient**: nothing saves, so something changes the object itself. `Object.assign(patient, …)` does.
3. **Build the form as a new object:**

   ```ts
   function formOf(patient: Patient | undefined): typeof EMPTY_FORM {
     if (patient === undefined) {
       return EMPTY_FORM;
     }
     return {
       name: patient.name,
       phone: maskPhone(patient.phone),
       email: patient.email ?? '',
       birthDate: patient.birthDate ?? '',
       cpf: maskCpf(patient.cpf),
       healthPlan: patient.healthPlan,
     };
   }
   ```

The reference also adds a regression test, `client/src/components/PatientDetails.cancel.test.tsx`: after a cancel, the patient object and the record are as before, also for a patient without an e-mail and a birth date.

Then run `npm test`, try **Edit** and **Cancel** on Elisa Gomes, and move the card to **In QA**.
