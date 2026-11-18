# Solution: One click or many, one appointment

**Root cause.** `submit` in `client/src/pages/BookingPage.tsx` sends `POST /api/appointments` every time it runs, and nothing tells it that a request is already on its way. A double click, or Enter pressed twice, runs it twice before the first answer arrives, and the server books both.

## Step by step

1. **See the two requests.** With the Network tab open and a slow connection, a double click on **Book** shows two `POST /api/appointments`.
2. **Remember that a booking is being sent.** Add a state and leave `submit` early while it is on:

   ```tsx
   const [saving, setSaving] = useState(false);

   async function submit(event: FormEvent) {
     event.preventDefault();
     if (saving) {
       return;
     }
     // ...the check of the fields stays here...
     setSaving(true);
     setError('');
     try {
       // ...the request and the navigation...
     } catch (failure) {
       setError(failure instanceof ApiError ? failure.message : 'The appointment could not be saved.');
       setSaving(false);
     }
   }
   ```

3. **Show it on the button.**

   ```tsx
   <button type="submit" className={ui.primary} disabled={saving}>
   ```

4. **Leave the state on after a success.** The page navigates to the agenda; only a failure turns the button back on.

The reference also adds a regression test, `client/src/pages/BookingPage.submit.test.tsx`: a double click sends one request, the button is off while the server has not answered, and a refused booking can be sent again.

Then run `npm test`, try the double click with a slow connection, and move the card to **In QA**.
