import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useParams } from 'react-router';
import { ApiError } from '../api/http.ts';
import { getPatient } from '../api/patients.ts';
import type { Patient } from '../api/types.ts';
import { PatientAppointments } from '../components/PatientAppointments.tsx';
import { PatientDetails } from '../components/PatientDetails.tsx';
import ui from '../components/ui.module.css';
import styles from './PatientRecord.module.css';

/**
 * The record of one patient, at /patients/:id, with one tab per address:
 * /patients/:id is "Details" and /patients/:id/appointments is "Appointments".
 */
export function PatientRecord() {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [problem, setProblem] = useState<'missing' | 'failed' | null>(null);

  useEffect(() => {
    let current = true;
    setPatient(null);
    setProblem(null);
    getPatient(Number(id))
      .then((found) => {
        if (current) {
          setPatient(found);
        }
      })
      .catch((failure: unknown) => {
        if (current) {
          setProblem(failure instanceof ApiError && failure.status < 500 ? 'missing' : 'failed');
        }
      });
    return () => {
      current = false;
    };
  }, [id]);

  if (problem !== null) {
    return (
      <section>
        <h2>{problem === 'missing' ? 'Patient not found' : 'The patient could not be loaded'}</h2>
        <p>
          <Link to="/patients">Back to the patients</Link>
        </p>
      </section>
    );
  }
  if (patient === null) {
    return <p>Loading…</p>;
  }

  return (
    <section>
      <div className={ui.titleRow}>
        <h2>{patient.name}</h2>
        <Link className={ui.button} to="/patients">
          Back to the patients
        </Link>
      </div>

      <nav aria-label="Patient record" className={styles.tabs}>
        <NavLink to={`/patients/${patient.id}`} end>
          Details
        </NavLink>
        <NavLink to={`/patients/${patient.id}/appointments`}>Appointments</NavLink>
      </nav>

      <Routes>
        <Route index element={<PatientDetails patient={patient} />} />
        <Route path="appointments" element={<PatientAppointments patient={patient} />} />
      </Routes>
    </section>
  );
}
