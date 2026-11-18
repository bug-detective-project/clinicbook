# Code review: CB-101, one click or many, one appointment

A form that sends something to a server has a state most forms forget: "sent, waiting for the answer". Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- `submit` started a request on every call and remembered nothing about it.
- A double click is two click events a few milliseconds apart. A request takes far longer than that, so the second click always found the form ready to send.
- Nothing was wrong with either request. The bug was in what the page did between them.

## Why the reference fix is right

- A `saving` state is set before the request starts. `submit` returns at once while it is set, and the button is disabled with it.
- The two uses cover different paths. The disabled button stops the mouse; the early return also stops Enter, which submits a form without touching the button.
- The state goes back to `false` only when the request fails. After a success the page navigates away, and turning the button back on for a moment would reopen the window the fix closes.

## Compare with your fix

- Did you only disable the button? Check Enter in a text field of the form: the form still submits.
- Did you use a timer ("ignore clicks for one second")? It breaks on a connection slower than the timer, which is when the bug happens most.
- Did you turn `saving` off in a `finally`? It works, and it re-enables the button on success for one render; harmless here because the page leaves, risky in a form that stays.
- Did you keep the flag in a `useRef` instead of state? It blocks the second request, and the user gets no sign that something is happening.

## Watch for next time

- Every button that starts a request needs an answer to "what if it is clicked again before the answer comes?".
- The page can only make a repeat unlikely. A server that must never take the same request twice has to refuse it itself; that is a rule for the API, and a different piece of work.
