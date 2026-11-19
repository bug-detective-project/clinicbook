import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getDoctor, listDoctors } from '../api/doctors.ts';
import type { DoctorWithHours } from '../api/types.ts';
import ui from '../components/ui.module.css';
import { hoursSummary } from '../calendar.ts';
import styles from './DoctorsPage.module.css';

/** The doctors of the clinic, each with its specialty and its hours; each opens its own page. */
export function DoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorWithHours[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let current = true;
    listDoctors()
      .then((list) => Promise.all(list.map((doctor) => getDoctor(doctor.id))))
      .then((list) => current && setDoctors(list))
      .catch(() => current && setError('The doctors could not be loaded.'));
    return () => {
      current = false;
    };
  }, []);

  return (
    <section>
      <div className={ui.titleRow}>
        <h2>Doctors</h2>
      </div>
      {error !== '' && (
        <p role="alert" className={ui.alert}>
          {error}
        </p>
      )}
      {doctors === null ? (
        error === '' && <p>Loading…</p>
      ) : (
        <ul aria-label="Doctors" className={styles.grid}>
          {doctors.map((doctor) => (
            <li key={doctor.id} data-testid={`doctor-${doctor.id}`} className={`${ui.card} ${styles.card}`}>
              <span aria-hidden="true" className={styles.avatar}>
                {doctor.name
                  .replace(/^Dr\.?\s+/, '')
                  .split(' ')
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join('')}
              </span>
              <div className={styles.body}>
                <Link to={`/doctors/${doctor.id}`} className={styles.name}>
                  {doctor.name}
                </Link>
                <span className={ui.muted}>{doctor.specialty}</span>
                <span className={styles.hours}>{hoursSummary(doctor.hours)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
