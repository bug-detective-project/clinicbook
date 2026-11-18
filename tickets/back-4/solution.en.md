# Solution: Database errors reach the user as plain messages

**What was missing.** `handleError` in `server/src/app.ts` handled two kinds of error (a request that does not fit its schema, and our own `HttpError`s) and answered everything else with the status the error brought, or 500, and `error.message`. A query the database refuses is thrown as a `QueryError`, whose message carries the SQL, so that text went straight to the screen.

## Step by step

1. **See it.** `POST /api/patients` with the e-mail `ana.costa@example.com` answers 500 with the query in the body.
2. **Import the error class.** `import { HttpError, QueryError } from './errors.ts';`
3. **Finish the handler.** The parameter `_request` becomes `request`, because the last case uses it:

   ```ts
   function handleError(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply): FastifyReply {
     // A request that does not fit the schema of its route.
     if ('validation' in error && error.validation) {
       return reply.status(400).send({ error: 'Some fields are not valid', fields: fieldsOf(error.validation) });
     }
     // An answer a rule of the clinic gave on purpose.
     if (error instanceof HttpError) {
       return reply.status(error.status).send({ error: error.message, fields: error.fields });
     }
     // The database refused the query to protect the data: the two cases a user can cause.
     if (error instanceof QueryError && error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
       return reply.status(409).send({ error: 'This record already exists' });
     }
     if (error instanceof QueryError && error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
       return reply.status(409).send({ error: 'This record is in use and cannot be removed' });
     }
     // A request Fastify itself refused, such as a body that is not JSON.
     if ('statusCode' in error && typeof error.statusCode === 'number' && error.statusCode >= 400 && error.statusCode < 500) {
       return reply.status(error.statusCode).send({ error: error.message });
     }
     request.log.error(error);
     return reply.status(500).send({ error: 'Internal server error' });
   }
   ```

4. **Check each row of the table.** The duplicate e-mail and the patient with appointments answer 409 with their sentences; a body that is not JSON still answers 400 with its reason; and the terminal of the server shows the full error when a 500 happens.

The reference also adds a regression test, `server/src/error-answers.test.ts`: the two 409s, no SQL in any answer, a 500 with the fixed text when the database is gone, and the answers that stay as they were.

Then run `npm test`, try the two cases in the screens, and move the card to **In QA**.
