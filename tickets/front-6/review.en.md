# Code review: CB-106, the time slot picker

A small component is mostly decisions: what it receives, what it owns, and which element of the browser does the work for it. Here is the reference approach, so you can compare it with yours.

## What this ticket was about

- Turning a written specification (three props and a list of behaviors) into a component.
- Keeping the component "controlled": the form owns the chosen time, the picker only shows it and reports a choice.
- Wiring it to data that arrives later and changes: the free times depend on the doctor and on the day.

## Why the reference is built this way

- The options are real radio buttons. The browser already gives a radio group everything the ticket asks for: one choice at a time, Space to choose, arrow keys to move, and the right announcements for a screen reader. The CSS hides the circle and styles the label as a button.
- The picker has no state. `value` comes in and `onChange` goes out, so the form, the address (`&time=`) and the picker can never disagree about the chosen time.
- The empty case is the picker's job. Whoever uses the component does not have to remember to handle a day without free times.
- In the form, one effect depends on the doctor and the day, loads the free times and drops a chosen time that is not among them. The same code serves booking and rescheduling, because both are the same form.

## Compare with what you built

- Did you use `<button>` elements and a class for the chosen one? It can be made to work; you then owe the keyboard and the screen reader everything the radios gave for free (`aria-pressed` or `aria-checked`, arrow keys, one tab stop).
- Did the picker keep its own `selected` state? It works until the form changes the time from outside (the address, a new doctor), and then the two disagree.
- Did the picker call `listSlots` itself? It is then tied to this API and cannot be shown or tested with a plain list.
- Did you leave a chosen time in place after the doctor changed? The form can then send a time the new doctor does not have.
- Did you give each radio a different `name`, or none? Each one is then its own group: the arrow keys stop moving between them and several can be checked.

## Watch for next time

- Before writing a widget, look for the native element that already behaves that way.
- Decide who owns each piece of state before writing the component. "The parent owns it" is the answer more often than it seems.
