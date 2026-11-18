# Code review: CB-104, an effect cleans up what it starts

Nothing looked wrong on the screen, which is why this one lived so long. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- The effect of `AgendaPage` loads the day and starts a `setInterval` to load it again every 15 seconds.
- Its cleanup only set `current = false`, which makes late answers be ignored. The interval itself was never cleared.
- A timer belongs to the page, not to the component. Each change of day and each visit to the agenda left one more timer running until the tab was reloaded.
- The screen stayed right because the answers of the old timers were thrown away. The requests were still made.

## Why the reference fix is right

- The effect keeps the id of its interval and its cleanup calls `clearInterval`. React runs the cleanup before the next run of the effect and when the component leaves the screen: the two moments the timer has to die.
- `current = false` stays. Clearing the timer stops future requests; the flag covers a request that was already on its way when the user left.
- The refresh while the agenda is open is untouched.

## Compare with your fix

- Did you clear the interval and remove `current`? An answer that arrives after the day changed can then put the appointments of the old day on the screen.
- Did you move the timer to a `useRef` and clear it at the start of the effect? It handles the change of day and leaves the last timer alive when the user goes to another screen.
- Did you make the effect depend on `[]` so it runs once? One timer, yes, and it refreshes the day the page opened with forever.
- Did you check the route inside the timer and skip the request? The requests stop and the timers keep piling up.

## Watch for next time

- Read every effect as a pair: what it starts and what stops it. A subscription, a timer and a listener all need the second half.
- The linter flags an interval without cleanup as a warning. Warnings are worth reading before a ticket like this is filed.
- "Slow after hours of use, fine after a reload" points at something that accumulates.
