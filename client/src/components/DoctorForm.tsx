import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError } from '../api/http.ts';
import type { DoctorWithHours, Hours } from '../api/types.ts';
import { WEEKDAY_NAMES } from '../calendar.ts';
import styles from './DoctorForm.module.css';
import ui from './ui.module.css';
import { Icon } from './Icon.tsx';

/** The times a period can start or end at: every half hour from 06:00 to 22:00. */
const TIMES = Array.from({ length: 33 }, (_, index) => `${String(6 + Math.floor(index / 2)).padStart(2, '0')}:${index % 2 === 0 ? '00' : '30'}`);

/** The periods of each day of the week; `key` tells the periods of a day apart on the screen. */
type Week = Record<number, { key: number; startsAt: string; endsAt: string }[]>;

let nextKey = 1;

function weekOf(hours: Hours[]): Week {
  const week: Week = {};
  for (let weekday = 1; weekday <= 7; weekday += 1) {
    week[weekday] = hours.filter((period) => period.weekday === weekday).map(({ startsAt, endsAt }) => ({ key: nextKey++, startsAt, endsAt }));
  }
  return week;
}

interface DoctorFormProps {
  /** The name of the form: "New doctor" or "Edit doctor". */
  title: string;
  /** The text of the button that saves: "Register" or "Save". */
  submitLabel: string;
  /** The doctor to change; left out for a new one. */
  doctor?: DoctorWithHours;
  save: (doctor: { name: string; specialty: string; hours: Hours[] }) => Promise<DoctorWithHours>;
  onSaved: (doctor: DoctorWithHours) => void;
  onCancel: () => void;
  /** Given when the doctor exists: the form then has a button to remove it. */
  onRemove?: () => void;
}

/**
 * The name, the specialty and the week of hours of a doctor (a new one, or one to change): each day
 * has no period (a day off), or one or more. It starts on the name; what the API refuses shows next
 * to its field.
 */
export function DoctorForm({ title, submitLabel, doctor, save, onSaved, onCancel, onRemove }: DoctorFormProps) {
  const [name, setName] = useState(doctor?.name ?? '');
  const [specialty, setSpecialty] = useState(doctor?.specialty ?? '');
  const [week, setWeek] = useState(() => weekOf(doctor?.hours ?? []));
  const [formError, setFormError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.querySelector('input')?.focus();
  }, []);

  function setPeriods(weekday: number, periods: Week[number]) {
    setWeek({ ...week, [weekday]: periods });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFormError('');
    setFields({});
    const hours = Object.entries(week).flatMap(([weekday, periods]) => periods.map(({ startsAt, endsAt }) => ({ weekday: Number(weekday), startsAt, endsAt })));
    try {
      onSaved(await save({ name, specialty, hours }));
    } catch (failure) {
      setFormError(failure instanceof ApiError ? failure.message : 'The doctor could not be saved.');
      setFields(failure instanceof ApiError ? failure.fields : {});
    }
  }

  return (
    <>
      {formError !== '' && (
        <p role="alert" className={ui.alert}>
          {formError}
        </p>
      )}
      <form ref={formRef} aria-label={title} className={`${ui.form} ${styles.form}`} noValidate onSubmit={(event) => void submit(event)}>
        <div className={ui.field}>
          <label htmlFor="doctor-name">Name</label>
          <input id="doctor-name" value={name} aria-invalid={fields.name !== undefined} aria-describedby={fields.name ? 'doctor-name-error' : undefined} onChange={(event) => setName(event.target.value)} />
          {fields.name !== undefined && (
            <span id="doctor-name-error" className={ui.fieldError}>
              {fields.name}
            </span>
          )}
        </div>
        <div className={ui.field}>
          <label htmlFor="doctor-specialty">Specialty</label>
          <input
            id="doctor-specialty"
            value={specialty}
            aria-invalid={fields.specialty !== undefined}
            aria-describedby={fields.specialty ? 'doctor-specialty-error' : undefined}
            onChange={(event) => setSpecialty(event.target.value)}
          />
          {fields.specialty !== undefined && (
            <span id="doctor-specialty-error" className={ui.fieldError}>
              {fields.specialty}
            </span>
          )}
        </div>
        <fieldset className={styles.hours} aria-describedby={fields.hours ? 'doctor-hours-error' : undefined}>
          <legend className={ui.legend}>Working hours</legend>
          {WEEKDAY_NAMES.map((dayName, index) => {
            const weekday = index + 1;
            const periods = week[weekday] ?? [];
            return (
              <div key={dayName} className={styles.day} data-testid={`hours-${weekday}`}>
                <span className={styles.dayName}>{dayName}</span>
                <div className={styles.periods}>
                  {periods.length === 0 && <span className={ui.muted}>Off</span>}
                  {periods.map((period, number) => (
                    <div key={period.key} className={styles.period}>
                      <select
                        aria-label={`${dayName}, period ${number + 1}, starts at`}
                        value={period.startsAt}
                        onChange={(event) => setPeriods(weekday, periods.map((item, at) => (at === number ? { ...item, startsAt: event.target.value } : item)))}
                      >
                        {TIMES.map((time) => (
                          <option key={time}>{time}</option>
                        ))}
                      </select>
                      <span aria-hidden="true">–</span>
                      <select
                        aria-label={`${dayName}, period ${number + 1}, ends at`}
                        value={period.endsAt}
                        onChange={(event) => setPeriods(weekday, periods.map((item, at) => (at === number ? { ...item, endsAt: event.target.value } : item)))}
                      >
                        {TIMES.map((time) => (
                          <option key={time}>{time}</option>
                        ))}
                      </select>
                      <button type="button" className={styles.remove} aria-label={`Remove ${dayName}, period ${number + 1}`} onClick={() => setPeriods(weekday, periods.filter((_, at) => at !== number))}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {periods.length < 3 && (
                  <button
                    type="button"
                    className={styles.add}
                    aria-label={`Add a period on ${dayName}`}
                    onClick={() => setPeriods(weekday, [...periods, periods.length === 0 ? { key: nextKey++, startsAt: '08:00', endsAt: '12:00' } : { key: nextKey++, startsAt: '14:00', endsAt: '18:00' }])}
                  >
                    + Add
                  </button>
                )}
              </div>
            );
          })}
          {fields.hours !== undefined && (
            <span id="doctor-hours-error" className={ui.fieldError}>
              {fields.hours}
            </span>
          )}
        </fieldset>
        <div className={styles.actions}>
          {onRemove !== undefined && (
            <button type="button" className={`${ui.danger} ${styles.removeDoctor}`} aria-haspopup="dialog" onClick={onRemove}>
              <Icon name="trash" />
              Remove doctor
            </button>
          )}
          <button type="button" className={ui.button} onClick={onCancel}>
            <Icon name="close" />
            Cancel
          </button>
          <button type="submit" className={ui.primary}>
            <Icon name="check" />
            {submitLabel}
          </button>
        </div>
      </form>
    </>
  );
}
