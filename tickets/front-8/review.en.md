# Code review: CB-108, each toast keeps its own time

A timer that depends on a function made at every render starts over at every render. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- The timer of a toast lives in an effect, and an effect runs again when one of its dependencies changes, after clearing what it did before.
- `dismiss` was a plain function in the body of the provider: a new one at every render. Every toast that came or went made the provider render, gave every toast a new `dismiss`, and restarted every timer.
- One toast at a time looked right, which is how the screens were tested.

## Why the reference fix is right

- `useCallback` with `[]` gives `dismiss` one identity for the life of the provider. It can, because it only calls `setToasts` with an updater and reads nothing else from the render.
- The effect keeps its honest list of dependencies. Nothing is hidden from the linter.
- `show` was already written this way, so the two functions of the provider now agree.

## Compare with your fix

- Did you remove `dismiss` from the dependencies of the effect? The linter warns about it, and the next change that makes `dismiss` read state brings back a stale-closure bug.
- Did you keep the timers in a ref of the provider, one per id? It works, and it moves the life of a toast away from the component that shows it.
- Did you memoize `ToastItem` with `memo`? It still receives a new `dismiss`, so it renders and the effect runs again.

## Watch for next time

- Before putting a function in the dependencies of an effect, ask whether it is stable. If it is created in a render, it is not, unless `useCallback` or `useMemo` makes it so.
- Timers are the effects where a restart is easy to miss: test with two of them close together.
