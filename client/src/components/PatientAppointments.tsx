import { useEffect, useState } from 'react';
import { listPatientAppointments } from '../api/patients.ts';
import type { Appointment, Patient } from '../api/types.ts';
import ui from '../components/ui.module.css';
import { formatDay } from '../dates.ts';
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

  if (failed) {
    return (
      <p role="alert" className={ui.alert}>
        The appointments could not be loaded.
      </p>
    );
  }
  if (appointments === null) {
    return <p>Loading…</p>;
  }
  if (appointments.length === 0) {
    return <p className={ui.muted}>This patient has no appointments yet.</p>;
  }
  return (
    <ul aria-label={`Appointments of ${patient.name}`} className={ui.list}>
      {appointments.map((appointment) => (
        <li key={appointment.id} className={`${ui.card} ${styles.row}`}>
          <strong>
            {formatDay(appointment.day)} at {appointment.time}
          </strong>
          <span className={ui.muted}>
            {appointment.doctorName}
            {appointment.reason !== '' && ` · ${appointment.reason}`}
          </span>
          <StatusBadge status={appointment.status} />
        </li>
      ))}
    </ul>
  );
}
