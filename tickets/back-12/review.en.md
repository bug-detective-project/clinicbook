# Code review: CB-212, a doctor with appointments stays

The database said no, for a good reason, and the code made it say yes. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- Deleting a doctor failed with a foreign key error. The quick way to make an error go away is to delete what points to the doctor first.
- That error was the rule of the clinic, enforced by the database: appointments must not point to nobody. Deleting them is not a fix, it is losing data.
- The screen asks for a confirmation and trusts the server to refuse what cannot be done. It was right to.

## Why the reference fix is right

- The function deletes the hours (which belong to the doctor alone) and the doctor, in a transaction. The appointments are not its to delete.
- The refusal comes from the database and reaches the user through the error handler, the same 409 and message as a patient with appointments: one rule, one answer.
- The transaction matters: the hours are deleted first, and the rollback brings them back when the doctor stays.

## Compare with your fix

- Did you count the appointments of the doctor in the route and answer 409 yourself? It works, and it repeats a rule the database already keeps; between the count and the delete, a new appointment can be booked. If you keep the check for a clearer message, keep the database rule too.
- Did you keep deleting the appointments but only the past ones? The past appointments are the history of the patients.
- Did you hide the button for doctors with appointments? The screen does not know, and the API is the one that must refuse.
- Did you remove the transaction? The hours would be lost when the doctor stays.

## Watch for next time

- When the database refuses something, read why before working around it. A constraint is often the rule you were asked to keep.
- "Delete what points to it first" is the right move for data that belongs only to the row (its hours), never for data that has a life of its own (appointments, orders, payments).
