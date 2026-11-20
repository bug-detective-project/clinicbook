# Code review: CB-209, overlaps found in any order

The check was right for sorted lists, and the API never promised one. Here is the reference approach, so you can compare it with yours.

## Why the bug happened

- Comparing neighbours is the classic way to find overlaps, and it works only on a sorted list.
- The screen sends the periods of each day in order, so every test through the form passed. The API takes requests from other places too.
- The loop also compared periods of different days that happened to be neighbours, which only made it harder to see what it checked.

## Why the reference fix is right

- Sort by day and start, then compare neighbours: in a sorted list two periods of a day overlap exactly when one starts before the previous one ends.
- It sorts a copy, so the check does not change the data it checks.
- The message and the 400 stay the same, so the form needs no change.

## Compare with your fix

- Did you compare every pair (two loops)? It is correct and fine for a week of periods. Sorting states the idea more directly and scales.
- Did you sort `hours` in place? It works here, and it changes the list the caller holds. Prefer sorting a copy in a function that only checks.
- Did you sort by start only, without the day? Periods of different days end up mixed, and the day check of each comparison skips real overlaps.
- Did you fix the export instead? The next client would bring the same problem. The API must not depend on the order of what it receives.

## Watch for next time

- An algorithm that compares neighbours assumes an order. Make the order explicit where the check runs.
- Test rules with input in the order users and other systems send it, not only in the order the screen does.
