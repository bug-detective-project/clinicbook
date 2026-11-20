# Code review: CB-110, the week of a Sunday

`getDay()` starts the week on Sunday; the clinic starts it on Monday. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- JavaScript numbers the days of the week from Sunday (0) to Saturday (6). Most of the world, and the clinic, has weeks from Monday to Sunday.
- "Day minus its weekday, plus one" is right for Monday to Saturday and wrong for Sunday only, one day in seven. A test on a Wednesday passes.
- The project already had `weekdayOf`, which turns the JavaScript numbering into the clinic's. `mondayOf` did the arithmetic again by hand.

## Why the reference fix is right

- `mondayOf` uses `weekdayOf`: one place converts the numbering, and every function of the calendar agrees with it.
- The week, the month grid and the doctor's week all use `mondayOf`, so one fix reaches the three.

## Compare with your fix

- Did you write `(date.getUTCDay() + 6) % 7`? It is the same conversion as `weekdayOf`, written a second time.
- Did you add `if (day === 0) day = 7`? Correct, and still a copy of the rule.
- Did you change the screens to ask for the day before when it is a Sunday? The bug would remain for every other caller of `mondayOf`.

## Watch for next time

- Every function about weeks has a Sunday case. Test it on purpose, and on the first and last days of a month.
- When a project already converts a convention (the numbering of the days, money in cents, time zones), use that conversion instead of doing the arithmetic again.
