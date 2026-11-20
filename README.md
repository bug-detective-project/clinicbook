# ClinicBook

The front desk of a small clinic: the agenda by day, week and month, booking, confirming,
rescheduling and cancelling appointments, the patients with their records, the doctors with their
working hours, and the reminders the clinic sends. It is a
game project of [Bug Detective](https://github.com/bug-detective-project): this branch (`main`) is
the app with every bug fixed; the tickets players get are built from it (see the `qa` branch).

- **client/**: React + TypeScript + Vite, React Router, CSS Modules (port 5173)
- **server/**: Node.js + Fastify + TypeScript + SQLite, queries written with Kysely (port 3001)

## Requirements

- Node.js 26 (see `.nvmrc`), or
- VS Code with the Dev Containers extension: choose **Reopen in Container** and everything is installed for you.

## Setup

```sh
npm install
npm run db:reset
npm run dev
```

Open http://localhost:5173. The client proxies `/api` to the server.

The API answers only requests whose `Host` is `localhost`, `127.0.0.1` or `[::1]` (any port) and
gives 403 to anything else: the app runs on the player's computer, and a page on the internet
must not reach it through the browser.

`.npmrc` applies the catalog's dependency rules to every install: packages only from the npm
registry (`allow-git=none`, `allow-remote=none`) and versions at least 7 days old
(`min-release-age=7`). `bd validate` checks the same rules on every publication.

## Scripts

Run from the repository root:

| Script             | What it does                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `npm install`      | Installs both workspaces.                                                                                        |
| `npm run dev`      | Starts the server and the client together.                                                                       |
| `npm test`         | Runs all project tests (Vitest, server and client), in UTC.                                                      |
| `npm run db:reset` | Recreates the database with the sample data, with the appointments around today.                                 |
| `npm run build`    | Type-checks and builds the client and the server.                                                                |
| `npm run lint`     | Checks the code with ESLint (`npm run lint:fix` fixes what it can).                                              |
| `npm run format`   | Formats the non-TypeScript files (JSON, CSS, Markdown, HTML) with Prettier (`npm run format:check` only checks). |

## How it is organized

- **The server owns the date.** The client asks `GET /api/today` and never reads its own clock, so
  both sides agree on what "today" is. `CLINICBOOK_TODAY` fixes the date (tests and demos use it).
- **Days and times are plain texts**, `YYYY-MM-DD` and `HH:MM`, in the database, in the API and on
  the screen (`server/src/dates.ts`, `client/src/dates.ts`, `client/src/calendar.ts`). The clinic has
  one time zone, its own.
- **The server has three layers.** A route (`server/src/routes/`) reads the request and answers; the
  rules of the clinic live in `server/src/appointments.ts`, `rules.ts` and `schedule.ts`; the
  queries live in `server/src/repository.ts`, written with Kysely.
- **Fastify checks every request against a schema** (`server/src/schemas.ts`) before the route runs,
  and one error handler (`server/src/app.ts`) turns whatever a route throws into an answer.
- **An appointment is scheduled, confirmed or cancelled.** A scheduled one can be confirmed or
  cancelled, a confirmed one can be cancelled, and a cancelled one stays cancelled. Rescheduling
  sends it back to scheduled.
- **Every appointment takes a slot of 30 minutes** inside the working hours of its doctor
  (`working_hours`: one row per period of a day of the week). `GET /api/doctors/:id/slots` gives the
  free ones, and the booking form offers only those. The periods of one day may not overlap
  (`server/src/routes/doctors.ts`), and saving a doctor writes the doctor and the hours in one
  transaction.
- **The agenda has three views**: the day (`/`), the week (`/week`) and the month (`/month`), the
  last two from `GET /api/schedule`, for every doctor or one.
- **A patient has a CPF and a health plan.** The CPF is stored as its 11 digits, is unique and must
  have the right check digits (`server/src/cpf.ts`); the screen masks it, and the phone too
  (`client/src/masks.ts`). Editing a patient sends only what changed: a field left out of the
  `PATCH` keeps its value, and `null` clears an optional one.
- **What an action did is a toast** (`client/src/ToastContext.tsx`): a success goes away by itself,
  an error stays longer; mistakes in a form stay next to the field.
- **The agenda refreshes itself** every 15 seconds (`client/src/pages/AgendaPage.tsx`), so two
  receptionists see each other's changes.
- **A link can fill the booking form**: `/appointments/new?patient=3&doctor=1&day=2026-03-10&time=10:30`.
- **Reminders are an outbox.** Nothing is really sent: `POST /api/reminders/run` writes one row per
  appointment of tomorrow into `reminders`. The Reminders screen lists the appointments of tomorrow
  still waiting for one and the reminders already sent.

## Lint and formatting

- **ESLint** (`eslint.config.js`) checks and formats the TypeScript and JavaScript files: the recommended rules of ESLint and typescript-eslint, the React rules (`@eslint-react`, `react-hooks`, `react-refresh`) and the code style (`@stylistic`: two spaces, single quotes, trailing commas). Semicolons are not checked.
- **Prettier** (`.prettierrc.json`) formats every other file. `.prettierignore` leaves the TypeScript and JavaScript files to ESLint.
- **VS Code** formats on save (`.vscode/settings.json`): ESLint fixes TS/JS files, Prettier formats the rest. Install the recommended extensions when VS Code asks (ESLint and Prettier); the dev container installs them for you.

## Configuration

| Variable            | Default                     | Used by                                                             |
| ------------------- | --------------------------- | ------------------------------------------------------------------- |
| `PORT`              | `3001`                      | server                                                              |
| `DATABASE_PATH`     | `server/data/clinicbook.db` | server, `db:reset`                                                  |
| `REMINDERS_ENABLED` | `true`                      | server: `false` turns the reminders off (`true`, `false`, `1`, `0`) |
| `CLINICBOOK_TODAY`  | the real date               | server, `db:reset`: a fixed "today", `YYYY-MM-DD`                   |
| `CLIENT_PORT`       | `5173`                      | client (`vite` and `vite preview`)                                  |
| `API_URL`           | `http://localhost:3001`     | client proxy target for `/api`                                      |

The database is created and seeded automatically the first time the server starts. To try a
setting, start the app with it from the terminal: `REMINDERS_ENABLED=false npm run dev`.

## API

| Method | Route                             | Notes                                                                                                                                              |
| ------ | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/today`                      | `{ today }`: the date the server calls today.                                                                                                      |
| GET    | `/api/doctors`                    | The doctors of the clinic.                                                                                                                         |
| POST   | `/api/doctors`                    | Registers (`name`, `specialty`, `hours`: `{ weekday, startsAt, endsAt }[]`). 201.                                                                  |
| GET    | `/api/doctors/:id`                | One doctor with its `hours`, Monday (`weekday` 1) to Sunday (7).                                                                                   |
| PATCH  | `/api/doctors/:id`                | Changes the name, the specialty and the hours. 400 names the fields.                                                                               |
| DELETE | `/api/doctors/:id`                | Removes a doctor without appointments, with its hours. 409 when the doctor has any.                                                                |
| GET    | `/api/doctors/:id/slots?day=`     | `{ day, slots }`: the free times of the doctor on that day, as `HH:MM`.                                                                            |
| GET    | `/api/appointments?day=`          | The appointments of a day (today without `day`), the earliest first.                                                                               |
| POST   | `/api/appointments`               | Books (`patientId`, `doctorId`, `day`, `time`, optional `reason`). 400 when not allowed.                                                           |
| GET    | `/api/appointments/:id`           | One appointment.                                                                                                                                   |
| GET    | `/api/schedule?from=&to=&doctor=` | The appointments from one day to another (both included, at most 42 days), of one doctor or all.                                                   |
| POST   | `/api/appointments/:id/confirm`   | Confirms a scheduled appointment. 409 when its state does not allow it.                                                                            |
| POST   | `/api/appointments/:id/cancel`    | Cancels a scheduled or confirmed appointment. 409 when it is already cancelled.                                                                    |
| PATCH  | `/api/appointments/:id`           | Reschedules to `{ day, time }`, under the rules of a booking; it goes back to scheduled.                                                           |
| GET    | `/api/patients`                   | The patients, by name.                                                                                                                             |
| POST   | `/api/patients`                   | Registers (`name`, `cpf`, `phone`, `healthPlan`, optional `email` and `birthDate`). 400 names the fields, 409 when the CPF or the e-mail is taken. |
| GET    | `/api/patients/:id`               | One patient.                                                                                                                                       |
| PATCH  | `/api/patients/:id`               | Changes the fields it sends; `null` clears `email` or `birthDate`. Same answers as POST.                                                           |
| GET    | `/api/patients/:id/appointments`  | Every appointment of the patient, the most recent first.                                                                                           |
| DELETE | `/api/patients/:id`               | Removes a patient without appointments. 409 when the patient has any.                                                                              |
| GET    | `/api/reminders`                  | `{ enabled, day, due, reminders }`: whether reminders are on, tomorrow, the appointments still waiting for a reminder, and the ones sent.          |
| POST   | `/api/reminders/run`              | Sends the reminders of tomorrow: `{ enabled, sent }`.                                                                                              |

An answer that is not a success has `{ error }`, a text for the user, and `fields` when the
problem is in specific fields of the request.

## CI

`.github/workflows/ci.yml` runs on every push and pull request into `main`: the catalog's reusable
`app.yml` (`npm ci`, `lint`, `format:check`, `test`), pinned by commit hash and kept current by
Dependabot, plus an informative `npm audit` that never blocks a merge. `bd build` keeps `.github/`
out of the ticket branches, so players never get the workflow.

## License

[PolyForm Noncommercial 1.0.0](LICENSE).
