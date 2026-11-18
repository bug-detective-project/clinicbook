# Solution: REMINDERS_ENABLED=false turns the reminders off

**Root cause.** `readSettings` in `server/src/config.ts` computes `remindersEnabled` with `Boolean(env.REMINDERS_ENABLED ?? true)`. A variable of the environment is always a text, and `Boolean` of any text that is not empty is `true`: `'false'` turns the option on like `'true'` does. Only an empty value gave `false`.

## Step by step

1. **Reproduce it.** Start the server with `REMINDERS_ENABLED=false npm run dev`; `GET /api/reminders` answers `"enabled": true`.
2. **Find the conversion.** The routes only read `settings.remindersEnabled`; the setting is made in `readSettings`.
3. **Read the option by comparing texts.** In `server/src/config.ts`:

   ```ts
   export function readFlag(name: string, value: string | undefined, fallback: boolean): boolean {
     const text = (value ?? '').trim().toLowerCase();
     if (text === '') {
       return fallback;
     }
     if (text === 'true' || text === '1') {
       return true;
     }
     if (text === 'false' || text === '0') {
       return false;
     }
     throw new Error(`${name} must be "true" or "false", and it is "${value}"`);
   }
   ```

   and in `readSettings`:

   ```ts
   remindersEnabled: readFlag('REMINDERS_ENABLED', env.REMINDERS_ENABLED, true),
   ```

4. **Check the three cases.** Without the variable the reminders are on; with `false` they are off; with `maybe` the server stops with a message that names the variable.

The reference also adds a regression test, `server/src/config.test.ts`, which reads the settings from texts (`false`, `FALSE`, `0`, `true`, `1`, empty, missing) and starts the app from them.

Then run `npm test`, repeat the steps of the ticket, and move the card to **In QA**.
