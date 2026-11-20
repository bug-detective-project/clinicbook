# Code review: CB-109, the form starts from a copy

The form changed the object the record showed, and React had no way to know. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- `Object.assign(target, …)` writes into `target` and returns it. Used on the patient, it turned the record's own object into the form.
- React compares objects by identity. The patient was the same object with other values inside, so nothing re-rendered until something else did, and then the record showed the changed values.
- Saving never went through this path for the change itself, so the server data was right, which made the bug look like a display glitch.

## Why the reference fix is right

- `formOf` builds a new object with the texts the fields need. The patient the record holds is read, never written.
- The form and the record now each own their data: the form is thrown away on **Cancel**, the record stays as it was.

## Compare with your fix

- Did you write `Object.assign({}, patient, { … })`? It copies first, so it is correct; it also puts `id` into the form, which the form does not need.
- Did you write `{ ...patient, … }`? Same: correct, with a few fields too many.
- Did you reload the patient from the server on **Cancel**? It hides the symptom and leaves the object changed until the answer comes.
- Did you copy the patient in `PatientDetails` before passing it? It works, and the dialog would still change whatever it receives.

## Watch for next time

- Treat props and state as read-only. When you need a changed version, make a new object.
- `Object.assign`, `sort`, `reverse`, `splice` and `push` change what they are given. On data that came from props or state, use the copying forms (`{ ...}`, `toSorted`, `toReversed`, `toSpliced`, `[...list, item]`).
