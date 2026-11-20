# CB-204: Stop database errors from reaching the user with the SQL query

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Story |
| Status | To Do |
| Priority | High |
| Reporter | Otávio Brandt (IT and operations) |
| Track | Back-end |
| Affects version | 1.0 |
| Component | API (error handling) |
| Labels | `api`, `errors`, `security` |
| Sprint | CB Sprint 2 |
| Created | 13/03/2026 11:00 |

## Description

The front desk sent me a photo of the screen. They tried to register a patient whose e-mail was already in use, and under the form, in red, was this:

> UNIQUE constraint failed: patients.email (query: insert into "patients" ("name", "phone", "email", "birth_date", "created_at") values (?, ?, ?, ?, ?) returning "id", "name", "phone", "email", "birth_date")

Removing a patient who has appointments shows a similar wall of text. The receptionist does not know what to do with it, and I do not want the names of our tables and columns on a screen that patients can see over the counter.

The server has an error handler that already answers well for a request with invalid fields and for the refusals of our own rules ("Patient not found", "An appointment cannot be booked in the past"). For everything else it sends the message of the error as it is. That last part was never built.

## What is already there

- `handleError` in `server/src/app.ts` is the error handler of the whole API: everything a route throws ends there.
- A query the database refuses is thrown as a `QueryError` (`server/src/errors.ts`). Its `code` is the code of SQLite, such as `SQLITE_CONSTRAINT_UNIQUE` and `SQLITE_CONSTRAINT_FOREIGNKEY`; its `message` carries the SQL, which is useful in the log and nowhere else.
- Errors of Fastify itself, such as a body that is not valid JSON, bring a `statusCode` between 400 and 499 and a message written for whoever made the request.
- `request.log.error(error)` writes an error to the server log.

## What to build

Finish `handleError`, in this order, after the two cases it already has:

| Error | Status | Body |
| --- | --- | --- |
| A `QueryError` whose `code` is `SQLITE_CONSTRAINT_UNIQUE` | 409 | `{ "error": "This record already exists" }` |
| A `QueryError` whose `code` is `SQLITE_CONSTRAINT_FOREIGNKEY` | 409 | `{ "error": "This record is in use and cannot be removed" }` |
| A `QueryError` whose `code` is `SQLITE_CONSTRAINT_CHECK` | 400 | `{ "error": "Some values are outside what the clinic allows" }` |
| An error with a `statusCode` from 400 to 499 | that status | `{ "error": <the message of the error> }`, as today |
| Anything else | 500 | `{ "error": "Internal server error" }` |

- In the last case the error is written to the server log before the answer, so the team can still find out what happened.
- No answer may carry the SQL, the name of a table or of a column, or the word of the database.
- The answers that are already right do not change: 400 with `fields` for an invalid request, and the status and message of our own rules (404, 409, 400).

## Acceptance criteria

- [ ] Registering a patient with an e-mail that is already registered answers 409 with "This record already exists".
- [ ] Removing a patient who has appointments answers 409 with "This record is in use and cannot be removed", and the patient stays.
- [ ] No answer of the API contains the SQL or the names of tables and columns.
- [ ] An error nobody planned for answers 500 with "Internal server error" and goes to the log.
- [ ] A body that is not JSON still answers 400 with its reason; invalid fields and the refusals of the rules answer as before.
- [ ] The screens show the plain messages.

## Environment

- ClinicBook 1.0

## Activity

**Otávio Brandt** · 13/03/2026 11:24
> Keep the full error in the log, please. When something really breaks at 7 in the morning, the log is all I have.
