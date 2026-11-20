import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import styles from './DatePicker.module.css';

// Days are plain texts, YYYY-MM-DD; the calendar works on them in UTC, so no time zone moves a day.
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const STEPS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
const utc = (day: string) => new Date(`${day}T00:00:00Z`);
const SHORT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const LONG = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const SPOKEN = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

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
  /** The chosen day, as YYYY-MM-DD, or "" when none is chosen yet. */
  value: string;
  onChange: (day: string) => void;
  /** The date the clinic calls today: it is marked, and "Today" picks it. */
  today: string;
  /** The first and the last day that can be picked; the others are shown but disabled. */
  min?: string;
  max?: string;
  /** An optional date can be cleared. */
  optional?: boolean;
  /** For a refused value: the field is marked invalid and points at the message. */
  invalid?: boolean;
  describedBy?: string;
}

/**
 * A button that shows a date and opens a calendar under it: a month and a year to choose, the days
 * of the month, today marked, and Today (and Clear for an optional date) at the bottom. Arrows move by
 * a day or a week, PageUp and PageDown by a month, Enter picks, and Escape or a click outside close it,
 * giving the focus back to the button.
 */
export function DatePicker({ label, value, onChange, today, min, max, optional = false, invalid, describedBy }: DatePickerProps) {
  const labelId = useId();
  const [open, setOpen] = useState(false);
  const allowed = (day: string) => (min === undefined || day >= min) && (max === undefined || day <= max);
  const clamp = (day: string) => (min !== undefined && day < min ? min : max !== undefined && day > max ? max : day);
  // The day that has the focus in the calendar; its month is the month on show.
  const [focused, setFocused] = useState(() => clamp(value || today));
  // Whether the focus should move to the focused day (keyboard and opening), or stay where it is (the selects).
  const [moveFocus, setMoveFocus] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLTableElement>(null);

  const thisYear = Number(today.slice(0, 4));
  const firstYear = min === undefined ? thisYear - 110 : Number(min.slice(0, 4));
  const lastYear = max === undefined ? thisYear + 5 : Number(max.slice(0, 4));

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function choose(day: string) {
    onChange(day);
    close();
  }

  function show(day: string, focus: boolean) {
    setFocused(clamp(day));
    setMoveFocus(focus);
  }

  useEffect(() => {
    if (open && moveFocus) {
      gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${focused}"]`)?.focus();
    }
  }, [open, focused, moveFocus]);

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
      // Only the calendar closes: a dialog around the picker stays open.
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if ((event.target as HTMLElement).dataset.day === undefined) {
      return;
    }
    const step = STEPS[event.key];
    const target
      = step !== undefined
        ? addDays(focused, step)
        : event.key === 'PageUp' || event.key === 'PageDown'
          ? sameDayIn(monthStart(focused, event.key === 'PageUp' ? -1 : 1), focused)
          : undefined;
    if (target !== undefined) {
      event.preventDefault();
      show(target, true);
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
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => lastYear - index);

  return (
    <div ref={rootRef} className={styles.root}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <div className={styles.control}>
        <button
          ref={triggerRef}
          type="button"
          className={styles.trigger}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          aria-label={`${label}, ${value === '' ? 'not chosen' : LONG.format(utc(value))}`}
          onClick={() => {
            show(value || today, true);
            setOpen(!open);
          }}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
          </svg>
          <span className={value === '' ? styles.placeholder : undefined}>{value === '' ? 'Choose a date' : SHORT.format(utc(value))}</span>
        </button>
        {optional && value !== '' && (
          <button type="button" className={styles.clearInline} aria-label={`Clear ${label}`} onClick={() => onChange('')}>
            ×
          </button>
        )}
      </div>
      {open && (
        <div className={styles.popover} role="dialog" aria-label={`Choose the date for ${label}`} onKeyDown={key}>
          <div className={styles.head}>
            <button
              type="button"
              className={styles.nav}
              aria-label="Previous month"
              disabled={min !== undefined && addDays(month, -1) < min}
              onClick={() => show(sameDayIn(monthStart(month, -1), focused), false)}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <div className={styles.selects}>
              <select
                className={styles.select}
                aria-label="Month"
                value={Number(month.slice(5, 7)) - 1}
                onChange={(event) => show(sameDayIn(`${month.slice(0, 5)}${String(Number(event.target.value) + 1).padStart(2, '0')}-01`, focused), false)}
              >
                {MONTHS.map((name, index) => (
                  <option key={name} value={index}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                className={styles.select}
                aria-label="Year"
                value={Number(month.slice(0, 4))}
                onChange={(event) => show(sameDayIn(`${event.target.value}${month.slice(4, 8)}01`, focused), false)}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className={styles.nav}
              aria-label="Next month"
              disabled={max !== undefined && monthStart(month, 1) > max}
              onClick={() => show(sameDayIn(monthStart(month, 1), focused), false)}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
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
                    const classes = [styles.day, day === value && styles.chosen, day === today && styles.today].filter(Boolean).join(' ');
                    return (
                      <td key={day}>
                        <button
                          type="button"
                          className={classes}
                          data-day={day}
                          tabIndex={day === focused ? 0 : -1}
                          aria-label={SPOKEN.format(utc(day))}
                          aria-pressed={day === value}
                          aria-current={day === today ? 'date' : undefined}
                          disabled={!allowed(day)}
                          onClick={() => choose(day)}
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
          <div className={styles.foot}>
            {optional ? (
              <button
                type="button"
                className={styles.link}
                onClick={() => {
                  onChange('');
                  close();
                }}
              >
                Clear
              </button>
            ) : (
              <span />
            )}
            <button type="button" className={styles.link} disabled={!allowed(today)} onClick={() => choose(today)}>
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
