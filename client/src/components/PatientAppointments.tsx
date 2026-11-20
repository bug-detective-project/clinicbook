import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { listPatientAppointments } from '../api/patients.ts';
import type { Appointment, Patient } from '../api/types.ts';
import ui from '../components/ui.module.css';
import { formatDay } from '../dates.ts';
import { Icon } from './Icon.tsx';
import styles from './PatientAppointments.module.css';
import { StatusBadge } from './StatusBadge.tsx';

/** Every appointment of a patient, the most recent first: the second tab of the patient record. */
export function PatientAppointments({ patient }: { patient: Patient }) {
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let current = true;
    listPatientAppointments(patient.id)
      .then((list) => {
        if (current) {
          setAppointments(list);
        }
      })
      .catch(() => {
        if (current) {
          setFailed(true);
        }
      });
    return () => {
      current = false;
    };
  }, [patient.id]);

  // A new appointment of the patient is booked from here, whatever the list holds.
  const withBooking = (content: ReactNode) => (
    <>
      <div className={styles.toolbar}>
        <Link className={ui.primary} to={`/appointments/new?patient=${patient.id}`}>
          <Icon name="calendarPlus" />
          Book appointment
        </Link>
      </div>
      {content}
    </>
  );

  if (failed) {
    return withBooking(
      <p role="alert" className={ui.alert}>
        The appointments could not be loaded.
      </p>,
    );
  }
  if (appointments === null) {
    return withBooking(<p>Loading…</p>);
  }
  if (appointments.length === 0) {
    return withBooking(<p className={ui.muted}>This patient has no appointments yet.</p>);
  }
  return withBooking(
    <ul aria-label={`Appointments of ${patient.name}`} className={ui.list}>
      {appointments.map((appointment) => (
        <li key={appointment.id} className={`${ui.card} ${styles.row}`}>
          <strong className={styles.item}>
            <Icon>
              <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
              <path d="M3.5 10h17M8 3v4m8-4v4" />
            </Icon>
            {formatDay(appointment.day)} at {appointment.time}
          </strong>
          <span className={`${ui.muted} ${styles.item}`}>
            <Icon>
              <path d="M6 3v6a4 4 0 0 0 8 0V3M6 3H5m9 0h1M10 13v2a5 5 0 0 0 10 0v-2" />
              <circle cx="20" cy="11" r="2" />
            </Icon>
            {appointment.doctorName}
            {appointment.reason !== '' && ` · ${appointment.reason}`}
          </span>
          <StatusBadge status={appointment.status} />
        </li>
      ))}
    </ul>,
  );
}
