/** Days are plain texts, YYYY-MM-DD, and times are HH:MM, in the database, in the API and on the screen. */
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isDay(value: unknown): value is string {
  if (typeof value !== 'string' || !DAY.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isTime(value: unknown): value is string {
  return typeof value === 'string' && TIME.test(value);
}

export function addDays(day: string, amount: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

/** The day of the week of a day: 1 is Monday and 7 is Sunday. */
export function weekdayOf(day: string): number {
  return new Date(`${day}T00:00:00Z`).getUTCDay() || 7;
}

/** The Monday of the week a day belongs to. */
export function mondayOf(day: string): string {
  return addDays(day, 1 - weekdayOf(day));
}

/** "Tuesday, March 10": a day the way a person reads it. */
export function formatDay(day: string): string {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** The minutes since midnight of a time: "08:30" is 510. */
export function minutesOf(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** The time of some minutes since midnight: 510 is "08:30". */
export function timeOf(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/** The date on the server's clock, in the server's time zone. */
export function systemToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
