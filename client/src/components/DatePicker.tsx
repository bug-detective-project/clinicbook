import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import styles from './DatePicker.module.css';

// Days are plain texts, YYYY-MM-DD; the calendar works on them in UTC, so no time zone moves a day.
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const STEPS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
const utc = (day: string) => new Date(`${day}T00:00:00Z`);
const SHORT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const LONG = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const SPOKEN = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const MONTH = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

function addDays(day: string, amount: number): string {
  const date = utc(day);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

/** The first day of the month of `day`, moved by `months` months. */
function monthStart(day: string, months = 0): string {
  const date = utc(`${day.slice(0, 7)}-01`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

const monthEnd = (day: string) => addDays(monthStart(day, 1), -1);

/** The same day of the month as `day` in the month that starts on `first`, or that month's last day. */
function sameDayIn(first: string, day: string): string {
  const wanted = `${first.slice(0, 8)}${day.slice(8)}`;
  return wanted > monthEnd(first) ? monthEnd(first) : wanted;
}

interface DatePickerProps {
  /** What the date is for, shown above the button and read with the date ("Day, March 11, 2026"). */
  label: string;
  /** The chosen day, as YYYY-MM-DD. */
  value: string;
  onChange: (day: string) => void;
  /** The first and the last day that can be picked; the others are shown but disabled. */
  min?: string;
  max?: string;
}

/**
 * A button that shows a date and opens a calendar under it. The calendar opens on the chosen day;
 * arrows move by a day or a week, PageUp and PageDown by a month, Enter picks, and Escape or a click
 * outside close it, giving the focus back to the button.
 */
export function DatePicker({ label, value, onChange, min, max }: DatePickerProps) {
  const labelId = useId();
  const [open, setOpen] = useState(false);
  // The day that has the focus in the calendar; its month is the month on show.
  const [focused, setFocused] = useState(value);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLTableElement>(null);

  const allowed = (day: string) => (min === undefined || day >= min) && (max === undefined || day <= max);
  const clamp = (day: string) => (min !== undefined && day < min ? min : max !== undefined && day > max ? max : day);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (open) {
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${focused}"]`)?.focus();
    }
  }, [open, focused]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const outside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, [open]);

  function key(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    const step = STEPS[event.key];
    const target
      = step !== undefined
        ? addDays(focused, step)
        : event.key === 'PageUp' || event.key === 'PageDown'
          ? sameDayIn(monthStart(focused, event.key === 'PageUp' ? -1 : 1), focused)
          : undefined;
    if (target !== undefined && (event.target as HTMLElement).dataset.day !== undefined) {
      event.preventDefault();
      setFocused(clamp(target));
    }
  }

  const month = monthStart(focused);
  const days: string[] = [];
  for (let day = month; day <= monthEnd(month); day = addDays(day, 1)) {
    days.push(day);
  }
  const blanks = (utc(month).getUTCDay() + 6) % 7;
  const cells: (string | null)[] = [...Array<null>(blanks).fill(null), ...days];
  const weeks = Array.from({ length: Math.ceil(cells.length / 7) }, (_, index) => cells.slice(index * 7, index * 7 + 7));
  const previousEnd = addDays(month, -1);
  const nextStart = monthStart(month, 1);

  return (
    <div ref={rootRef} className={styles.root}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${label}, ${LONG.format(utc(value))}`}
        onClick={() => {
          setFocused(value);
          setOpen(!open);
        }}
      >
        <span>{SHORT.format(utc(value))}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      </button>
      {open && (
        <div className={styles.popover} role="dialog" aria-label={`Choose the date for ${label}`} onKeyDown={key}>
          <div className={styles.head}>
            <button
              type="button"
              className={styles.month}
              aria-label="Previous month"
              disabled={min !== undefined && previousEnd < min}
              onClick={() => setFocused(clamp(sameDayIn(monthStart(month, -1), focused)))}
            >
              ‹
            </button>
            <p className={styles.title} aria-live="polite">
              {MONTH.format(utc(month))}
            </p>
            <button
              type="button"
              className={styles.month}
              aria-label="Next month"
              disabled={max !== undefined && nextStart > max}
              onClick={() => setFocused(clamp(sameDayIn(nextStart, focused)))}
            >
              ›
            </button>
          </div>
          <table ref={gridRef} className={styles.grid} role="grid" aria-labelledby={labelId}>
            <thead>
              <tr>
                {WEEKDAYS.map((name) => (
                  <th key={name} scope="col">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week) => (
                <tr key={week.find((day) => day !== null)}>
                  {Array.from({ length: 7 }, (_, column) => {
                    const day = week[column] ?? null;
                    if (day === null) {
                      return <td key={column} />;
                    }
                    return (
                      <td key={day}>
                        <button
                          type="button"
                          className={day === value ? `${styles.day} ${styles.chosen}` : styles.day}
                          data-day={day}
                          tabIndex={day === focused ? 0 : -1}
                          aria-label={SPOKEN.format(utc(day))}
                          aria-pressed={day === value}
                          disabled={!allowed(day)}
                          onClick={() => {
                            onChange(day);
                            close();
                          }}
                        >
                          {Number(day.slice(8))}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
