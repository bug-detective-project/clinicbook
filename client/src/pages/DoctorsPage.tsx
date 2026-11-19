import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { createDoctor, listDoctors } from '../api/doctors.ts';
import type { Doctor } from '../api/types.ts';
import { DoctorDialog } from '../components/DoctorDialog.tsx';
import ui from '../components/ui.module.css';
import { useToast } from '../useToast.ts';
import styles from './DoctorsPage.module.css';

/** The doctors of the clinic, each with its specialty; a click anywhere on a card opens the doctor. */
export function DoctorsPage() {
  const toast = useToast();
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [registering, setRegistering] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);

  function closeDialog() {
    setRegistering(false);
    openerRef.current?.focus();
  }
  const [error, setError] = useState('');

  useEffect(() => {
    let current = true;
    listDoctors()
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
        <button ref={openerRef} type="button" className={ui.primary} aria-haspopup="dialog" onClick={() => setRegistering(true)}>
          New doctor
        </button>
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
              </div>
            </li>
          ))}
        </ul>
      )}
      {registering && (
        <DoctorDialog
          title="New doctor"
          submitLabel="Register"
          save={createDoctor}
          onSaved={(created) => {
            setDoctors((list) => [...(list ?? []), { id: created.id, name: created.name, specialty: created.specialty }].sort((first, second) => first.name.localeCompare(second.name)));
            closeDialog();
            toast.success(`${created.name} was registered.`);
          }}
          onClose={closeDialog}
        />
      )}
    </section>
  );
}
