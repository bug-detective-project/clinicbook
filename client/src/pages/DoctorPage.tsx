import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { listSchedule } from '../api/appointments.ts';
import { getDoctor } from '../api/doctors.ts';
import type { Appointment, DoctorWithHours } from '../api/types.ts';
import ui from '../components/ui.module.css';
import { WeekGrid } from '../components/WeekGrid.tsx';
import { addDays, daysFrom, hoursSummary, mondayOf, weekName } from '../calendar.ts';
import { useToday } from '../useToday.ts';
import weekStyles from './AgendaWeekPage.module.css';
import styles from './DoctorPage.module.css';

/** A doctor: its specialty and hours (Edit opens their screen), and its week of appointments. */
export function DoctorPage() {
  const id = Number(useParams().id);
  const today = useToday();
  const [doctor, setDoctor] = useState<DoctorWithHours | null>(null);
  const [missing, setMissing] = useState(false);
  const [monday, setMonday] = useState(() => mondayOf(today));
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const sunday = addDays(monday, 6);

  useEffect(() => {
    let current = true;
    getDoctor(id)
      .then((found) => current && setDoctor(found))
      .catch(() => current && setMissing(true));
    return () => {
      current = false;
    };
  }, [id]);

  useEffect(() => {
    let current = true;
    setAppointments(null);
    listSchedule(monday, sunday, id)
      .then((list) => current && setAppointments(list))
      .catch(() => current && setAppointments([]));
    return () => {
      current = false;
    };
  }, [id, monday, sunday]);

  if (missing) {
    return (
      <section>
        <h2>Doctor not found</h2>
        <Link className={ui.button} to="/doctors">
          Back to the doctors
        </Link>
      </section>
    );
  }
  if (doctor === null) {
    return <p>Loading…</p>;
  }

  // The week shows Saturday and Sunday only when the doctor works then or has an appointment.
  const busy = (date: string) => (appointments ?? []).some((item) => item.day === date);
  const lastDay = doctor.hours.some((period) => period.weekday === 7) || busy(sunday) ? sunday : doctor.hours.some((period) => period.weekday === 6) || busy(addDays(monday, 5)) ? addDays(monday, 5) : addDays(monday, 4);

  return (
    <section>
      <div className={ui.titleRow}>
        <div>
          <h2>{doctor.name}</h2>
          <p className={styles.specialty}>{doctor.specialty}</p>
        </div>
        <div className={styles.actions}>
          <Link className={ui.button} to="/doctors">
            Back to the doctors
          </Link>
          <Link className={ui.primary} to={`/doctors/${doctor.id}/edit`}>
            Edit
          </Link>
        </div>
      </div>

      <p className={styles.hours}>
        <span className={styles.hoursLabel}>Working hours</span> {hoursSummary(doctor.hours)}
      </p>

      <div className={weekStyles.controls}>
        <h3 className={styles.week}>{weekName(monday, sunday)}</h3>
        <nav aria-label="Weeks" className={weekStyles.weeks}>
          <button type="button" className={ui.button} onClick={() => setMonday(addDays(monday, -7))}>
            Previous week
          </button>
          <button type="button" className={ui.button} onClick={() => setMonday(mondayOf(today))}>
            This week
          </button>
          <button type="button" className={ui.button} onClick={() => setMonday(addDays(monday, 7))}>
            Next week
          </button>
        </nav>
      </div>
      {appointments === null ? <p>Loading…</p> : <WeekGrid days={daysFrom(monday, lastDay)} appointments={appointments} today={today} hours={doctor.hours} />}

    </section>
  );
}
