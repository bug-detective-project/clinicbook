# Code review: CB-103, a day is not a moment

"2026-03-10" names a square on the calendar. A `Date` in JavaScript names an instant on a clock. Most date bugs live in the trip between the two. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- `toDate` in `client/src/dates.ts` did `new Date(day)`. JavaScript reads a text with only a date as midnight **in UTC**.
- `toLocaleDateString` then wrote that instant in the time zone of the computer. In São Paulo, midnight UTC is 21:00 of the day before.
- Lisbon is on UTC in March, so the screen there was right, and so were the tests, which run in UTC on purpose. The bug needed a computer west of Greenwich.

## Why the reference fix is right

- It builds the date from its parts: `new Date(year, month - 1, date)` is midnight on the calendar of the computer, whatever its zone.
- Building and formatting now use the same calendar, so the day that goes in is the day that comes out.
- The text `YYYY-MM-DD` stays the only thing that travels between the screen, the API and the database. The `Date` exists for a moment, only to borrow the names of the weekday and of the month.

## Compare with your fix

- Did you use `new Date(day + 'T00:00:00')`? A date with a time and no zone is read as local time, so it works, for a reason that is easy to forget.
- Did you keep `new Date(day)` and add `timeZone: 'UTC'` to the formatting? Also correct: both ends agree on UTC.
- Did you add three hours, or one day? It fixes São Paulo and breaks every other zone, and São Paulo itself if the offset ever changes.
- Did you change the server to send a full timestamp? The server was right; the bug was in how the page read a correct value.

## Watch for next time

- Decide whether a value is a day or an instant, and keep days as plain texts for as long as you can.
- When a bug shows on one computer and not on another, compare their settings before their code: time zone, language, clock.
- A test suite that runs in one time zone proves the code for that zone. The reference adds tests that run in São Paulo and in Tokyo.
