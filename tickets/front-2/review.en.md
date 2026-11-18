# Code review: CB-102, the total that follows the list

Two pieces of state that say the same thing will disagree sooner or later. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- The page had `appointments` and, next to it, `total`: the count of the appointments that are not cancelled.
- Loading the list set both. `change`, which runs after **Cancel** and **Confirm**, replaced one appointment in the list and left `total` alone.
- The refresh of every 15 seconds loads the list again, so the number healed itself. That is why it looked like a delay and not like a wrong number.

## Why the reference fix is right

- `total` is no longer state. It is computed from `appointments` on every render: `appointments.filter(...).length`.
- There is one source of truth. Every path that changes the list (loading, refreshing, cancelling, confirming, and whatever comes later) changes the number with it, with no code to remember.
- Counting a few dozen rows on each render costs nothing worth saving.

## Compare with your fix

- Did you add `setTotal` inside `change`? It fixes this ticket. The next function that changes the list has to remember it too, and nothing will warn whoever forgets.
- Did you recompute `total` in a `useEffect` that watches `appointments`? It works one render late: the screen paints the old number first. Deriving during render has no such frame.
- Did you load the whole list again after a cancellation? The number is right, at the price of a request for something the page already knew.
- Did you wrap the count in `useMemo`? Fine, and not needed at this size.

## Watch for next time

- Before adding a `useState`, ask whether the value can be computed from state that already exists. If it can, compute it.
- "It fixes itself after a while" usually means a copy that is being refreshed by something else.
