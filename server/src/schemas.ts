// The shape of what the API accepts. Fastify checks every request against the schema of its route
// before the route runs, and answers 400 by itself when the request does not fit.

export const DAY_PATTERN = '^\\d{4}-\\d{2}-\\d{2}$';
export const TIME_PATTERN = '^([01]\\d|2[0-3]):[0-5]\\d$';

/** A CPF: 11 digits, with or without the dots and the dash (123.456.789-09). Its check digits are checked by the route. */
export const CPF_PATTERN = '^\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}$';

/** A phone: digits, spaces, dashes and parentheses, with an optional + in front; 8 to 20 characters. */
export const PHONE_PATTERN = '^\\+?[0-9 ()-]{8,20}$';

export const patientBody = {
  type: 'object',
  required: ['name', 'phone', 'cpf', 'healthPlan'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 2, maxLength: 80, pattern: '\\S' },
    phone: { type: 'string', pattern: PHONE_PATTERN },
    email: { type: ['string', 'null'], format: 'email', maxLength: 120 },
    birthDate: { type: ['string', 'null'], pattern: DAY_PATTERN },
    cpf: { type: 'string', pattern: CPF_PATTERN },
    healthPlan: { type: 'string', minLength: 2, maxLength: 60, pattern: '\\S' },
  },
} as const;

export const appointmentBody = {
  type: 'object',
  required: ['patientId', 'doctorId', 'day', 'time'],
  additionalProperties: false,
  properties: {
    patientId: { type: 'integer' },
    doctorId: { type: 'integer' },
    day: { type: 'string', pattern: DAY_PATTERN },
    time: { type: 'string', pattern: TIME_PATTERN },
    reason: { type: 'string', maxLength: 200 },
  },
} as const;

export const rescheduleBody = {
  type: 'object',
  required: ['day', 'time'],
  additionalProperties: false,
  properties: {
    day: { type: 'string', pattern: DAY_PATTERN },
    time: { type: 'string', pattern: TIME_PATTERN },
  },
} as const;

export const dayQuery = {
  type: 'object',
  properties: {
    day: { type: 'string', pattern: DAY_PATTERN },
  },
} as const;

export const requiredDayQuery = { ...dayQuery, required: ['day'] } as const;

/** What the user reads next to a field that did not fit its schema. */
const FIELD_MESSAGES: Record<string, string> = {
  name: 'Enter the name, with at least 2 characters',
  phone: 'Use only digits, spaces, dashes and parentheses (8 to 20 characters)',
  email: 'Enter an e-mail address, such as name@example.com',
  birthDate: 'Use a date, as YYYY-MM-DD',
  cpf: 'Enter a CPF, such as 123.456.789-09',
  healthPlan: 'Enter the health plan, or Private',
  patientId: 'Choose a patient',
  doctorId: 'Choose a doctor',
  day: 'Use a date, as YYYY-MM-DD',
  time: 'Use a time, as HH:MM',
  reason: 'Use at most 200 characters',
};

interface SchemaError {
  instancePath: string;
  params: Record<string, unknown>;
}

/** The fields a request got wrong, each with its message, from the errors of the schema check. */
export function fieldsOf(errors: SchemaError[]): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const error of errors) {
    const field = error.instancePath.replace(/^\//, '') || String(error.params.missingProperty ?? '');
    if (field !== '') {
      fields[field] = FIELD_MESSAGES[field] ?? 'Not valid';
    }
  }
  return fields;
}
