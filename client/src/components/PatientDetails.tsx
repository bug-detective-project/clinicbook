import { Link } from 'react-router';
import type { Patient } from '../api/types.ts';
import ui from '../components/ui.module.css';
import { formatShortDay } from '../dates.ts';
import { maskCpf } from '../masks.ts';
import styles from './PatientDetails.module.css';

/** The registration data of a patient: the first tab of the patient record. */
export function PatientDetails({ patient }: { patient: Patient }) {
  return (
    <div className={ui.card}>
      <dl className={styles.data}>
        <dt>CPF</dt>
        <dd>{maskCpf(patient.cpf)}</dd>
        <dt>Health plan</dt>
        <dd>{patient.healthPlan}</dd>
        <dt>Phone</dt>
        <dd>{patient.phone}</dd>
        <dt>E-mail</dt>
        <dd>{patient.email ?? 'No e-mail'}</dd>
        <dt>Birth date</dt>
        <dd>{patient.birthDate === null ? 'Not informed' : formatShortDay(patient.birthDate)}</dd>
      </dl>
      <Link className={ui.primary} to={`/appointments/new?patient=${patient.id}`}>
        Book appointment
      </Link>
    </div>
  );
}
