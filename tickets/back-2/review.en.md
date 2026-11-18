# Code review: CB-202, the whole text has to be a phone

Two characters were missing, and a validation that looked strict was letting almost everything through. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- The schema checks `phone` with a pattern. The pattern described a phone correctly and did not say that the phone had to be the whole text.
- An unanchored regular expression looks for a match anywhere. `call 11 98888-7777` contains a valid phone, so it passed, with the word in it.
- The refusal of `1234` made the validation look alive. A check that fails for some bad inputs tells you nothing about the others.
- The damage showed far from the cause: the reminders, days later, for other patients.

## Why the reference fix is right

- `^` and `$` around the same pattern: the text must be a phone from its first character to its last.
- The limits become real. `{8,20}` only counted the characters of the piece that matched; anchored, it counts the whole text.
- The fix is at the door. Everything behind it, starting with the reminders, may now trust that a stored phone can be dialled.

## Compare with your fix

- Did you clean the phone in the route (strip what is not a digit) and keep it? `11 98888-7777 / 11 3555-4004` becomes one number of 21 digits: wrong data, saved without complaint. Refusing lets the person at the desk correct it.
- Did you make the reminders skip a phone they cannot dial? A good second defense, for the phones that are already in the database. It does not replace the check at the door, and this ticket was about the door.
- Did you add the check by hand in the route, before or after the schema? There are now two definitions of "phone" to keep equal.
- Did you anchor only one end? `^` alone still accepts `11 98888-7777 (mom)`.

## Watch for next time

- Read a validation pattern as a question: "does the whole value look like this?". If it has no `^` and `$`, it asks something else.
- Test a validation with inputs that are wrong in different ways: too short, too long, right in the middle and wrong at the ends.
- When one bad record breaks a batch for everyone, look at how the record got in and at how the batch treats a failure. Those are two separate repairs.
