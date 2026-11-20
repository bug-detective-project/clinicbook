# Code review: CB-208, the writes of a doctor kept together

Three writes that belong together were written one at a time. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- Changing the hours of a doctor is "delete the old periods, insert the new ones". Between the two, the doctor has no hours.
- Each statement was its own transaction. When the insert failed, the delete had already happened, and so had the change of the name.
- The validation of the route (`hoursProblem`) catches most mistakes before any write, which hid the problem. The database has a rule the route does not repeat, the day of the clinic, and that one fails in the middle.

## Why the reference fix is right

- One transaction around the three writes: either the doctor has the new data and the new hours, or nothing changed.
- `trx` is used for every write inside it. A write through `db` inside the callback would run outside the transaction and survive the rollback.
- The error is not swallowed: it leaves the transaction, the transaction rolls back, and the handler answers as before.
- `createDoctor` already worked this way, so the two writes of a doctor now behave alike.

## Compare with your fix

- Did you insert first and delete after? The new periods would be deleted with the old ones. Order alone does not make several writes safe.
- Did you check the range 06:00 to 22:00 in the route? It is a good check to have, and it closes this case, but the next rule of the database fails the same way. The transaction is what makes any failure safe.
- Did you catch the error and re-insert the old periods by hand? That is a transaction written by hand, with more ways to fail.
- Did you use `db` inside `db.transaction().execute`? Look again: only `trx` is inside the transaction.

## Watch for next time

- Whenever one change takes more than one write, ask what the data looks like if it stops between two of them. If the answer is "wrong", it needs a transaction.
- Replace-all writes (delete everything, insert the new list) are the classic case.
