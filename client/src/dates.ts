// Days travel as plain texts, YYYY-MM-DD, between the screen, the API and the database.

/** The day as a date, ready to be formatted. */
function toDate(day: string): Date {
  return new Date(day);
}

/** "Tuesday, March 10": a day the way a person reads it. */
export function formatDay(day: string): string {
  return toDate(day).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

/** "Mar 10, 2026": a day in a short form, with the year. */
export function formatShortDay(day: string): string {
  return toDate(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function addDays(day: string, amount: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}
