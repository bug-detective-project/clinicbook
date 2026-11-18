# Code review: CB-203, "false" is a text

The variable was set, the code read it, and the answer was still wrong. The whole bug is in one conversion. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- Every value of the environment is a text. `REMINDERS_ENABLED=false` gives the program the five letters `false`.
- The setting was made with `Boolean(...)`. For a text, `Boolean` is true unless the text is empty. `'false'`, `'0'` and `'no'` are all true.
- The default hid it. Nobody sets `REMINDERS_ENABLED=true`, so the only value anyone ever used was the one that did not work.
- The tests of the routes pass a ready-made settings object, with a real `false`. The step from text to setting was the one step nothing exercised.

## Why the reference fix is right

- `readFlag` compares texts: `true` and `1` are on, `false` and `0` are off, whatever the case and the spaces around.
- A missing or empty variable falls back to the default, so servers that never set it behave as before.
- Any other value stops the server at startup with a message that names the variable. For an option with legal weight, "the server refuses to start" is far better than a guess.
- It is a function with a name and the name of the variable as a parameter: the next on/off option of the server reads the same way.

## Compare with your fix

- Did you write `env.REMINDERS_ENABLED !== 'false'`? It fixes the reported case. `FALSE`, `0` and a typo such as `flase` all leave the reminders on, silently.
- Did you write `env.REMINDERS_ENABLED === 'true'`? Now the reminders are off when the variable is missing: every existing server changes behavior on the next deploy.
- Did you use `JSON.parse`? It reads `false` and `0` well and throws an unhelpful `SyntaxError` for `no` or for an empty value.
- Did you put the check in the reminders route? The setting stays wrong for whoever reads it next; the Reminders screen reads it too.

## Watch for next time

- Convert configuration once, at the edge of the program, into the type the code wants. Past that point nobody should see the raw text.
- For each option, write down three answers: what turns it on, what turns it off, and what happens with anything else.
- Test the reading of the configuration itself, with the texts an operator would really type.
