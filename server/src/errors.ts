/** An answer the API gives on purpose: the status and the message the user reads. */
export class HttpError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

/** 400: the request asks for something the rules of the clinic do not allow. */
export class InvalidError extends HttpError {
  constructor(message: string, fields?: Record<string, string>) {
    super(400, message, fields);
  }
}

/** 404: what the request names does not exist. */
export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}

/** 409: the request is well formed, and the state of the record does not allow it. */
export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message);
  }
}

/**
 * A query the database refused. The message carries the SQL, which helps whoever reads the server
 * log; `code` is SQLite's own code (SQLITE_CONSTRAINT_UNIQUE, SQLITE_CONSTRAINT_FOREIGNKEY, ...).
 */
export class QueryError extends Error {
  code: string | undefined;
  sql: string;

  constructor(sql: string, cause: unknown) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    super(`${reason} (query: ${sql})`, { cause });
    this.sql = sql;
    this.code = typeof cause === 'object' && cause !== null && 'code' in cause ? String(cause.code) : undefined;
  }
}
