import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { listSchedule } from '../api/appointments.ts';
import { listDoctors } from '../api/doctors.ts';
import type { Appointment, Doctor } from '../api/types.ts';
import { agendaAddress } from '../agenda.ts';
import { AgendaViews } from '../components/AgendaViews.tsx';
import ui from '../components/ui.module.css';
import { addDays, daysFrom, mondayOf, monthEnd, monthName, monthStart } from '../calendar.ts';
import { useToday } from '../useToday.ts';
import { DoctorFilter } from './AgendaWeekPage.tsx';
import weekStyles from './AgendaWeekPage.module.css';
import styles from './AgendaMonthPage.module.css';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** The month of the agenda: how many appointments each day has; a day opens the agenda of that day. */
export function AgendaMonthPage() {
  const today = useToday();
  const [params] = useSearchParams();
  const day = params.get('day') ?? today;
  const doctor = params.get('doctor') ?? undefined;
  const first = monthStart(day);
  const last = monthEnd(day);
  // The calendar shows whole weeks, from the Monday before the 1st to the Sunday after the last day.
  const from = mondayOf(first);
  const to = addDays(mondayOf(last), 6);
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void listDoctors().then(setDoctors).catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    let current = true;
    setAppointments(null);
    listSchedule(from, to, doctor === undefined ? undefined : Number(doctor))
      .then((list) => current && (setAppointments(list), setError('')))
      .catch(() => current && setError('The month could not be loaded.'));
    return () => {
      current = false;
    };
  }, [from, to, doctor]);

  const days = daysFrom(from, to);
  const weeks = Array.from({ length: days.length / 7 }, (_, index) => days.slice(index * 7, index * 7 + 7));

  return (
    <section>
      <AgendaViews view="month" day={day} doctor={doctor} />
      <div className={ui.titleRow}>
        <h2>{monthName(first)}</h2>
        <Link className={ui.primary} to={`/appointments/new?day=${day < today ? today : day}`}>
          Book appointment
        </Link>
      </div>
      <div className={weekStyles.controls}>
        <nav aria-label="Months" className={weekStyles.weeks}>
          <Link className={ui.button} to={agendaAddress('month', monthStart(first, -1), doctor)}>
            Previous month
          </Link>
          <Link className={ui.button} to={agendaAddress('month', today, doctor)}>
            This month
          </Link>
          <Link className={ui.button} to={agendaAddress('month', monthStart(first, 1), doctor)}>
            Next month
          </Link>
        </nav>
        <DoctorFilter doctors={doctors} doctor={doctor} view="month" day={day} />
      </div>
      {error !== '' && (
        <p role="alert" className={ui.alert}>
          {error}
        </p>
      )}
      {appointments === null ? (
        error === '' && <p>Loading…</p>
      ) : (
        <table className={styles.calendar}>
          <caption className={styles.hidden}>{monthName(first)}</caption>
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
              <tr key={week[0]}>
                {week.map((date) => {
                  const count = appointments.filter((item) => item.day === date && item.status !== 'cancelled').length;
                  const outside = date < first || date > last;
                  const classes = [styles.cell, outside && styles.outside, date === today && styles.today].filter(Boolean).join(' ');
                  const text = count === 0 ? 'No appointments' : count === 1 ? '1 appointment' : `${count} appointments`;
                  return (
                    <td key={date}>
                      <Link to={agendaAddress('day', date)} className={classes} data-testid={`month-${date}`} aria-label={`${date}: ${text}`}>
                        <span className={styles.number}>{Number(date.slice(8))}</span>
                        {count > 0 && (
                          <span className={styles.count} aria-hidden="true">
                            {count}
                            <span className={styles.word}>{count === 1 ? ' appt.' : ' appts.'}</span>
                          </span>
                        )}
                      </Link>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
