import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ApiError } from '../api/http.ts';
import { createPatient, listPatients, removePatient } from '../api/patients.ts';
import type { Patient } from '../api/types.ts';
import { PatientDialog } from '../components/PatientDialog.tsx';
import { PatientMenu } from '../components/PatientMenu.tsx';
import ui from '../components/ui.module.css';
import { useToast } from '../useToast.ts';
import { formatPhone } from '../masks.ts';
import styles from './PatientsPage.module.css';

export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const toast = useToast();
  // Only a list that could not be loaded is shown on the page; what an action did is a toast.
  const [error, setError] = useState('');
  // The form of a new patient opens in a dialog over the list.
  const [registering, setRegistering] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);

  /** Closes the dialog and gives the focus back to the button that opened it. */
  function closeDialog() {
    setRegistering(false);
    openerRef.current?.focus();
  }

  useEffect(() => {
    let current = true;
    listPatients()
      .then((list) => {
        if (current) {
          setPatients(list);
        }
      })
      .catch(() => {
        if (current) {
          setError('The patients could not be loaded.');
        }
      });
    return () => {
      current = false;
    };
  }, []);

  async function remove(patient: Patient) {
    try {
      await removePatient(patient.id);
      setPatients((list) => list?.filter((item) => item.id !== patient.id) ?? null);
      toast.success(`${patient.name} was removed.`);
    } catch (failure) {
      toast.error(failure instanceof ApiError ? `${patient.name}: ${failure.message}` : `${patient.name} could not be removed.`);
    }
  }

  return (
    <section>
      <div className={ui.titleRow}>
        <h2>Patients</h2>
        <button ref={openerRef} type="button" className={ui.primary} aria-haspopup="dialog" onClick={() => setRegistering(true)}>
          New patient
        </button>
      </div>

      {error !== '' && (
        <p role="alert" className={ui.alert}>
          {error}
        </p>
      )}

      {patients === null ? (
        <p>Loading…</p>
      ) : (
        <ul aria-label="Patients" className={styles.grid}>
          {patients.map((patient) => (
            <li key={patient.id} data-testid={`patient-${patient.id}`} className={`${ui.card} ${styles.card}`}>
              <span aria-hidden="true" className={styles.avatar}>
                {patient.name
                  .split(' ')
                  .filter((part) => part.length > 2)
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join('')}
              </span>
              <div className={styles.body}>
                {/* The link of the name covers the card: a click anywhere on it opens the record. */}
                <Link to={`/patients/${patient.id}`} className={styles.name}>
                  <strong>{patient.name}</strong>
                </Link>
                <span className={styles.plan}>{patient.healthPlan}</span>
                <span>{formatPhone(patient.phone)}</span>
                <span className={`${ui.muted} ${styles.email}`} title={patient.email ?? undefined}>
                  {patient.email ?? 'No e-mail'}
                </span>
              </div>
              <div className={styles.menu}>
                <PatientMenu patient={patient} onRemove={(removed) => void remove(removed)} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {registering && (
        <PatientDialog
          title="New patient"
          submitLabel="Register"
          save={createPatient}
          onSaved={(created) => {
            setPatients((list) => [...(list ?? []), created].sort((first, second) => first.name.localeCompare(second.name)));
            closeDialog();
            toast.success(`${created.name} was registered.`);
          }}
          onClose={closeDialog}
        />
      )}
    </section>
  );
}
