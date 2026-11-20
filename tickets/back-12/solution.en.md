# Solution: A doctor with appointments stays

**Root cause.** `deleteDoctor` in `server/src/repository.ts` deletes the appointments of the doctor before the doctor, "because the database refuses a doctor that others point to". That refusal was the rule of the clinic: the function removed the appointments to get past it.

## Step by step

1. **Reproduce it** with the `curl` of the ticket: `204`, and the agenda of the day loses the doctor's appointments.
2. **Read `deleteDoctor`**: appointments, hours, doctor, in one transaction.
3. **Let the database refuse.** Delete only what belongs to the doctor alone:

   ```ts
   export async function deleteDoctor(db: Db, id: number): Promise<void> {
     await db.transaction().execute(async (trx) => {
       await rows(trx.deleteFrom('workingHours').where('doctorId', '=', id));
       await rows(trx.deleteFrom('doctors').where('id', '=', id));
     });
   }
   ```

   For a doctor with appointments the second delete fails with `SQLITE_CONSTRAINT_FOREIGNKEY`, the transaction gives the hours back, and the error handler answers 409 with "This record is in use and cannot be removed". The edit screen already shows that message.

The reference also adds a regression test, `server/src/doctor-with-appointments.test.ts`: a doctor with appointments is refused and the doctor, the hours and the appointments stay.

Then run `npm test`, try **Remove doctor** on Dr. Oliveira, and move the card to **In QA**.
