# Solution: The whole text has to be a phone

**Root cause.** `PHONE_PATTERN` in `server/src/schemas.ts` is `'\\+?[0-9 ()-]{8,20}'`, without anchors. Fastify checks the `phone` of a new patient with it, and a pattern without `^` and `$` is satisfied by a match anywhere in the text. Any phone that contains 8 allowed characters in a row is accepted, with whatever comes before or after. Later, `toDial` in `server/src/reminders.ts` cannot turn such a phone into digits and throws, and the whole run of reminders fails.

## Step by step

1. **Reproduce it at the API.** The `curl` of the ticket answers 201 for `11 9888-77AB`.
2. **Find who checks the phone.** The route `POST /api/patients` declares `schema: { body: patientBody }`; in `patientBody`, `phone` has `pattern: PHONE_PATTERN`.
3. **Anchor the pattern.**

   ```ts
   /** A phone: digits, spaces, dashes and parentheses, with an optional + in front; 8 to 20 characters. */
   export const PHONE_PATTERN = '^\\+?[0-9 ()-]{8,20}$';
   ```

   The comment above the constant already described this; the pattern now says the same.
4. **Check both sides.** The phones of the ticket answer 400 with the message of the field, and `(11) 98888-7777`, `+55 11 98888-7777` and `3555-4004` still answer 201.

The reference also adds a regression test, `server/src/patient-phone.test.ts`: six phones that are not phones, the formats the clinic uses, and the reminders still going out after a refused registration.

Then run `npm test`, try the form in the browser, and move the card to **In QA**.
