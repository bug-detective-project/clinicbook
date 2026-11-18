# Solution: The agenda refreshes itself only while it is on the screen

**Root cause.** The effect of `AgendaPage` (`client/src/pages/AgendaPage.tsx`) starts a `setInterval` every time it runs, and its cleanup never clears it. The effect runs when the agenda opens and each time `day` changes, so every change of day and every visit adds a timer that lives until the tab is reloaded. The old timers go on asking for their old days; their answers are ignored (`current` is false), which is why the screen looks right.

## Step by step

1. **Count the timers.** In the Network tab, the number of requests in each round of 15 seconds grows by one with each change of day, and the rounds go on after you leave the agenda.
2. **Keep the id of the interval and clear it in the cleanup.**

   ```tsx
   void load();
   const timer = window.setInterval(load, REFRESH_MS);
   return () => {
     current = false;
     window.clearInterval(timer);
   };
   ```

   React calls the returned function before it runs the effect again (the day changed) and when the component is removed (the user went to another screen).
3. **Keep `current = false`.** It still protects the screen from an answer that was on its way.

The reference also adds a regression test, `client/src/pages/AgendaPage.refresh.test.tsx`: with fake timers, the agenda refreshes while open, stops after the user leaves, and keeps one refresh after the day changes.

Then run `npm test`, repeat the count in the Network tab, and move the card to **In QA**.
