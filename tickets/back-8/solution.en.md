# Solution: The writes of a doctor are kept together, or not at all

**Root cause.** `updateDoctor` in `server/src/repository.ts` writes the doctor, deletes the periods and inserts the new ones as three separate statements. When the database refuses the insert (a period outside the clinic's day), the first two are already written: the doctor ends up with the new name and no hours.

## Step by step

1. **Reproduce it** with the `curl` of the ticket: the 400 comes, and `GET /api/doctors/3` shows no hours.
2. **Look at the order of the writes** in `updateDoctor`: update, delete, insert. Only the insert fails.
3. **Put the three in one transaction**, like `createDoctor` already does:

   ```ts
   export async function updateDoctor(db: Db, id: number, doctor: { name: string; specialty: string }, hours: Hours[]): Promise<DoctorWithHours> {
     await db.transaction().execute(async (trx) => {
       await rows(trx.updateTable('doctors').set(doctor).where('id', '=', id));
       await rows(trx.deleteFrom('workingHours').where('doctorId', '=', id));
       if (hours.length > 0) {
         await rows(trx.insertInto('workingHours').values(hours.map((period) => ({ doctorId: id, ...period }))));
       }
     });
     return (await findDoctorWithHours(db, id))!;
   }
   ```

   When the insert throws, Kysely rolls back the transaction, and the error still reaches the error handler, which answers 400.

The reference also adds a regression test, `server/src/doctor-hours-saved-together.test.ts`: a change with a period from 05:00 is refused, and the doctor is exactly as before.

Then run `npm test`, repeat the `curl` of the ticket, and move the card to **In QA**.
