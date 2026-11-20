import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import type { Appointment, Hours } from '../api/types.ts';
import { periodsOf, weekdayName, weekdayOf } from '../calendar.ts';
import { StatusBadge } from './StatusBadge.tsx';
import styles from './WeekGrid.module.css';

interface WeekGridProps {
  /** The days of the week on show, in order. */
  days: string[];
  appointments: Appointment[];
  today: string;
  /** The name of the doctor on each appointment: for the agenda of every doctor. */
  showDoctor?: boolean;
  /** The hours of one doctor: each day shows them, and an appointment outside them is pointed out. */
  hours?: Hours[];
}

/** True when `time` falls inside one of the periods of the day. */
function insideHours(hours: Hours[], weekday: number, time: string): boolean {
  return hours.some((period) => period.weekday === weekday && time > period.startsAt && time <= period.endsAt);
}

/**
 * A week as columns, one per day: the appointments of the day by time, with their status. Each
 * appointment links to the record of its patient; one still to come can be rescheduled.
 */
export function WeekGrid({ days, appointments, today, showDoctor = false, hours }: WeekGridProps) {
  return (
    <div className={styles.grid} style={{ '--days': days.length } as CSSProperties}>
      {days.map((day) => {
        const weekday = weekdayOf(day);
        const ofDay = appointments.filter((appointment) => appointment.day === day);
        const periods = hours === undefined ? null : periodsOf(hours, weekday);
        // A day the doctor does not work is greyed out.
        const classes = [styles.day, day === today && styles.today, periods === '' && styles.off].filter(Boolean).join(' ');
        return (
          <section key={day} data-testid={`day-${day}`} aria-labelledby={`day-title-${day}`} className={classes}>
            <h3 id={`day-title-${day}`} className={styles.head}>
              <span className={styles.weekday}>{weekdayName(day)}</span>
              <span className={styles.number}>{Number(day.slice(8))}</span>
              {day === today && <span className={styles.todayTag}>Today</span>}
            </h3>
            {periods !== null && <p className={styles.hours}>{periods === '' ? 'Off' : periods}</p>}
            {ofDay.length === 0 ? (
              <p className={styles.empty}>No appointments</p>
            ) : (
              <ul className={styles.list} aria-label={`Appointments of ${weekdayName(day)} ${Number(day.slice(8))}`}>
                {ofDay.map((appointment) => {
                  const outside = hours !== undefined && appointment.status !== 'cancelled' && !insideHours(hours, weekday, appointment.time);
                  return (
                    <li key={appointment.id} data-testid={`week-appointment-${appointment.id}`} className={appointment.status === 'cancelled' ? `${styles.item} ${styles.cancelled}` : styles.item}>
                      <div className={styles.itemHead}>
                        <span className={styles.time}>{appointment.time}</span>
                        <StatusBadge status={appointment.status} />
                      </div>
                      <Link to={`/patients/${appointment.patientId}`} className={styles.patient}>
                        {appointment.patientName}
                      </Link>
                      {showDoctor && <span className={styles.doctor}>{appointment.doctorName}</span>}
                      {outside && <span className={styles.outside}>Outside the working hours</span>}
                      {appointment.status !== 'cancelled' && day >= today && (
                        <Link to={`/appointments/${appointment.id}/reschedule`} className={styles.reschedule} aria-label={`Reschedule ${appointment.patientName} on ${day} at ${appointment.time}`}>
                          Reschedule
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
