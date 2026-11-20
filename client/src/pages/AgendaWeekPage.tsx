import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { listSchedule } from '../api/appointments.ts';
import { listDoctors } from '../api/doctors.ts';
import type { Appointment, Doctor } from '../api/types.ts';
import { agendaAddress } from '../agenda.ts';
import { AgendaViews } from '../components/AgendaViews.tsx';
import { PeriodNav } from '../components/PeriodNav.tsx';
import ui from '../components/ui.module.css';
import { WeekGrid } from '../components/WeekGrid.tsx';
import { addDays, daysFrom, mondayOf, weekName } from '../calendar.ts';
import { useToday } from '../useToday.ts';
import styles from './AgendaWeekPage.module.css';

/** The week of the agenda: the appointments of every doctor (or of one) from Monday to Saturday, and Sunday when it has any. */
export function AgendaWeekPage() {
  const today = useToday();
  const [params] = useSearchParams();
  const day = params.get('day') ?? today;
  const doctor = params.get('doctor') ?? undefined;
  const monday = mondayOf(day);
  const sunday = addDays(monday, 6);
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void listDoctors().then(setDoctors).catch(() => setDoctors([]));
  }, []);

  useEffect(() => {
    let current = true;
    setAppointments(null);
    listSchedule(monday, sunday, doctor === undefined ? undefined : Number(doctor))
      .then((list) => current && (setAppointments(list), setError('')))
      .catch(() => current && setError('The week could not be loaded.'));
    return () => {
      current = false;
    };
  }, [monday, sunday, doctor]);

  const days = daysFrom(monday, (appointments ?? []).some((item) => item.day === sunday) ? sunday : addDays(monday, 5));

  return (
    <section>
      <AgendaViews view="week" day={day} doctor={doctor} />
      <div className={ui.titleRow}>
        <h2>{weekName(monday, sunday)}</h2>
        <Link className={ui.primary} to={`/appointments/new?day=${day < today ? today : day}`}>
          Book appointment
        </Link>
      </div>
      <div className={styles.controls}>
        <PeriodNav
          label="Weeks"
          previous={{ label: 'Previous week', to: agendaAddress('week', addDays(monday, -7), doctor) }}
          current={{ label: 'This week', to: agendaAddress('week', today, doctor) }}
          next={{ label: 'Next week', to: agendaAddress('week', addDays(monday, 7), doctor) }}
          showingCurrent={monday === mondayOf(today)}
        />
        <DoctorFilter doctors={doctors} doctor={doctor} view="week" day={day} />
      </div>
      {error !== '' && (
        <p role="alert" className={ui.alert}>
          {error}
        </p>
      )}
      {appointments === null ? error === '' && <p>Loading…</p> : <WeekGrid days={days} appointments={appointments} today={today} showDoctor={doctor === undefined} />}
    </section>
  );
}

/** Every doctor, or one: the choice goes into the address, so a reload keeps it. */
export function DoctorFilter({ doctors, doctor, view, day }: { doctors: Doctor[]; doctor?: string; view: 'week' | 'month'; day: string }) {
  const [, setParams] = useSearchParams();
  return (
    <label className={styles.filter}>
      <span>Doctor</span>
      <select
        value={doctor ?? ''}
        onChange={(event) => {
          const next = new URLSearchParams({ day });
          if (event.target.value !== '') {
            next.set('doctor', event.target.value);
          }
          setParams(next);
        }}
        data-view={view}
      >
        <option value="">All doctors</option>
        {doctors.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}
