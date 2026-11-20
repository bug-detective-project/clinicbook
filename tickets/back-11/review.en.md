# Code review: CB-211, absent is not null

A PATCH that clears what it does not receive is a PUT in disguise. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- The form of the record always sends every field, so every test through the screen passed.
- `??` treats `undefined` and `null` the same. For a required field that is fine. For an optional field, "not sent" and "sent as null" mean opposite things.
- The script of the plans uses the API as a PATCH should be used, and found the hole at once.

## Why the reference fix is right

- `'email' in body` asks the one question that matters: did the request mention the field? Absent keeps, `null` clears, a value changes.
- The required fields keep `??`, because the schema already refuses `null` for them.
- The merge stays in one place, before `inputOf`, so the checks of the CPF and the e-mail still run on the whole patient.

## Compare with your fix

- Did you write `body.email === undefined ? patient.email : body.email`? Same result for JSON bodies, where a key cannot hold `undefined`; `in` says it more directly.
- Did you make the form send only what changed? The form was right; the API was not.
- Did you stop `null` from clearing the field? Then nothing can remove an e-mail any more.

## Watch for next time

- For every optional field of a PATCH, test the three cases: absent, `null` and a value.
- When a merge uses `??` or `||`, ask what happens to `null`, `''` and `0`.
