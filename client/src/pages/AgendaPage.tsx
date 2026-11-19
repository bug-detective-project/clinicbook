import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { cancelAppointment, confirmAppointment, listToday } from '../api/appointments.ts';
import { ApiError } from '../api/http.ts';
import type { Appointment } from '../api/types.ts';
import { StatusBadge } from '../components/StatusBadge.tsx';
import ui from '../components/ui.module.css';
import { useToast } from '../useToast.ts';
import { addDays, formatDay } from '../dates.ts';
import { useToday } from '../useToday.ts';
import styles from './AgendaPage.module.css';

/** How often the agenda asks the server again, so two receptionists see each other's changes. */
const REFRESH_MS = 15_000;

function totalText(count: number): string {
  if (count === 0) {
    return 'No appointments';
  }
  return count === 1 ? '1 appointment' : `${count} appointments`;
}

export function AgendaPage() {
  const today = useToday();
  const [params] = useSearchParams();
  const day = params.get('day') ?? today;
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const toast = useToast();
  const [error, setError] = useState('');

  useEffect(() => {
    let current = true;
    const load = () =>
      listToday(day)
        .then((list) => {
          if (current) {
            setAppointments(list);
          }
        })
        .catch(() => {
          if (current) {
            setError('The agenda could not be loaded. It will try again in a moment.');
          }
        });

    setAppointments(null);
    setError('');
    void load();
    const timer = window.setInterval(load, REFRESH_MS);
    return () => {
      current = false;
      window.clearInterval(timer);
    };
  }, [day]);

  /** Runs a change of one appointment and shows the appointment as the server answered it. */
  async function change(action: (id: number) => Promise<Appointment>, id: number) {
    try {
      const updated = await action(id);
      setAppointments((list) => list?.map((item) => (item.id === updated.id ? updated : item)) ?? null);
      toast.success(`The appointment of ${updated.patientName} at ${updated.time} was ${updated.status}.`);
    } catch (failure) {
      toast.error(failure instanceof ApiError ? failure.message : 'The change could not be saved.');
      // The screen may be showing an appointment as it was before someone else changed it.
      setAppointments(await listToday(day).catch(() => appointments));
    }
  }

  // A cancelled appointment stays on the list, and does not count.
  const total = (appointments ?? []).filter((appointment) => appointment.status !== 'cancelled').length;

  return (
    <section>
      <div className={ui.titleRow}>
        <h2>{formatDay(day)}</h2>
        <Link className={ui.primary} to={`/appointments/new?day=${day}`}>
          Book appointment
        </Link>
      </div>

      <nav aria-label="Days" className={styles.days}>
        <Link className={ui.button} to={`/?day=${addDays(day, -1)}`}>
          Previous day
        </Link>
        <Link className={ui.button} to="/">
          Today
        </Link>
        <Link className={ui.button} to={`/?day=${addDays(day, 1)}`}>
          Next day
        </Link>
      </nav>

      {error !== '' && (
        <p role="alert" className={ui.alert}>
          {error}
        </p>
      )}

      {appointments === null ? (
        <p>Loading…</p>
      ) : (
        <>
          <p data-testid="day-total" className={styles.total}>
            {totalText(total)}
          </p>
          <ul aria-label="Appointments" className={ui.list}>
            {appointments.map((appointment) => (
              <li key={appointment.id} data-testid={`appointment-${appointment.id}`} className={`${ui.card} ${styles.row}`}>
                <span className={styles.time}>{appointment.time}</span>
                <div className={styles.who}>
                  <Link to={`/patients/${appointment.patientId}`}>{appointment.patientName}</Link>
                  <span className={ui.muted}>
                    {appointment.doctorName}
                    {appointment.reason !== '' && ` · ${appointment.reason}`}
                  </span>
                </div>
                <StatusBadge status={appointment.status} />
                <div className={styles.actions}>
                  {appointment.status === 'scheduled' && (
                    <button
                      type="button"
                      className={ui.button}
                      aria-label={`Confirm ${appointment.patientName} at ${appointment.time}`}
                      onClick={() => void change(confirmAppointment, appointment.id)}
                    >
                      Confirm
                    </button>
                  )}
                  {appointment.status !== 'cancelled' && (
                    <>
                      <Link
                        className={ui.button}
                        aria-label={`Reschedule ${appointment.patientName} at ${appointment.time}`}
                        to={`/appointments/${appointment.id}/reschedule`}
                      >
                        Reschedule
                      </Link>
                      <button
                        type="button"
                        className={ui.danger}
                        aria-label={`Cancel ${appointment.patientName} at ${appointment.time}`}
                        onClick={() => void change(cancelAppointment, appointment.id)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
