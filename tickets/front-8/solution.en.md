# Solution: Each toast keeps its own time

**Root cause.** In `client/src/ToastContext.tsx`, the effect of each `ToastItem` starts its timer and depends on `dismiss`. The provider created `dismiss` anew at every render, and it renders again whenever a toast comes or goes. Each new `dismiss` ran the effect of every toast on the screen again: the old timer was cleared and a new one of the full time started.

## Step by step

1. **Reproduce it** as in the ticket: the first message stays until about 4 seconds after the second.
2. **Read the dependencies** of the effect of `ToastItem`: `[toast.id, toast.tone, dismiss]`. The id and the tone never change for a toast; `dismiss` changes at every render of the provider.
3. **Keep `dismiss` stable**, like `show` right below it:

   ```ts
   const dismiss = useCallback((id: number) => setToasts((list) => list.filter((toast) => toast.id !== id)), []);
   ```

   It uses the updater form of `setToasts`, so it needs nothing from the render, and `[]` is the right list of dependencies.

The reference also adds a regression test, `client/src/toasts.timing.test.tsx`: a toast is gone 4 seconds after it showed although another one came in the meantime, and two toasts in a row are both gone a few seconds later.

Then run `npm test`, confirm two appointments in a row on the agenda, and move the card to **In QA**.
