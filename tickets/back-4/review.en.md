# Code review: CB-204, what the user reads when something goes wrong

An error has two readers: the person in front of the screen and the person who will fix it. They need different things, and one message cannot serve both. Here is the reference approach, so you can compare it with yours.

## What this ticket was about

- Sorting errors by who caused them: the request (4xx, and the caller can do something about it) or the server (5xx, and the caller cannot).
- Deciding, for each kind, what goes into the answer and what goes into the log.
- Keeping that decision in one place, the error handler, instead of in every route.

## Why the reference is built this way

- The cases go from the most specific to the most general, and the last one catches everything. A new kind of error that nobody thought of falls into "500, Internal server error", which is the safe side.
- The two database errors a user can cause become 409 with a sentence a receptionist understands. They are recognized by the `code` of SQLite, never by searching the text of the message.
- Messages are passed on only for errors that were written for the caller: our own `HttpError`s and Fastify's 4xx. Everything else gets a fixed text.
- The unplanned error is logged whole, with its SQL, before the answer. The log is where that detail belongs.
- The routes did not change. They keep throwing, and one function decides what the outside sees.

## Compare with what you built

- Did you add `try/catch` to the patient routes? Those two routes are fixed, and the next route that touches a unique column leaks again. The handler is the one door every error goes through.
- Did you test `error.message.includes('UNIQUE')`? It works until the text changes; the `code` is the stable part.
- Did you answer 500 for the duplicate e-mail, with a clean message? The message is safe, and the status tells the client that the server broke when the request was the problem. The form could not tell the user to change the e-mail.
- Did you send the generic 500 for everything, including the 4xx of Fastify? "Body is not valid JSON" was useful to the caller and harmless; it is now hidden.
- Did you remove the SQL from `QueryError` itself? The answer is clean, and the log lost the one detail that makes a database error quick to fix.
- Did you forget to log the last case? The user sees "Internal server error", and so does the team: nobody knows what happened.

## Watch for next time

- Treat every `error.message` in an answer as a decision: was this message written for the person who will read it?
- Make the last branch of an error handler the safe one. What nobody listed must not leak.
