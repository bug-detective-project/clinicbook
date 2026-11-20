# Code review: CB-210, the last day of a period included

One character decided whether the last day of every week existed. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- A period can be written with its end included (`from` to `to`, both in) or excluded (`from` up to, but not including, `to`). Both are common; mixing them is the bug.
- The route, its schema and the screens all meant "both included". The query used "end excluded".
- The last day of a week is a Sunday, the day the clinic is closed. The hole stayed invisible until a doctor started to work on Sundays.

## Why the reference fix is right

- `<=` makes the query mean what the API says. Nothing else had to move: the screens already asked for Monday to Sunday.
- The days stay texts and compare as texts, which is safe for `YYYY-MM-DD`.

## Compare with your fix

- Did you add a day to `to` in the route? It works, and it keeps a convention ("end excluded") hidden inside the query while the API says the opposite. Prefer the query to say what the API says.
- Did you change the screens to ask for one more day? Every caller would have to know the trick.
- Did you convert the days to `Date` objects to compare? It brings time zones into a project that keeps days as texts on purpose.

## Watch for next time

- When a function takes a period, write down whether its end is included, and test the edges: a period of one day, and an item on the last day.
- An empty result for "from today to today" is the quickest test of the edges.
