import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError } from '../api/http.ts';
import { createPatient, listPatients, removePatient } from '../api/patients.ts';
import type { Patient } from '../api/types.ts';
import { PatientMenu } from '../components/PatientMenu.tsx';
import ui from '../components/ui.module.css';
import styles from './PatientsPage.module.css';

const EMPTY_FORM = { name: '', phone: '', email: '', birthDate: '' };

export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[] | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

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
      setError('');
    } catch (failure) {
      setError(failure instanceof ApiError ? `${patient.name}: ${failure.message}` : `${patient.name} could not be removed.`);
    }
  }

  async function register(event: FormEvent) {
    event.preventDefault();
    setFormError('');
    setFields({});
    try {
      const created = await createPatient({
        name: form.name,
        phone: form.phone,
        email: form.email.trim() === '' ? null : form.email,
        birthDate: form.birthDate === '' ? null : form.birthDate,
      });
      setPatients((list) => [...(list ?? []), created].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(EMPTY_FORM);
    } catch (failure) {
      setFormError(failure instanceof ApiError ? failure.message : 'The patient could not be registered.');
      setFields(failure instanceof ApiError ? failure.fields : {});
    }
  }

  function field(name: keyof typeof EMPTY_FORM, label: string, type = 'text') {
    const problem = fields[name];
    return (
      <div className={ui.field}>
        <label htmlFor={`patient-${name}`}>{label}</label>
        <input
          id={`patient-${name}`}
          type={type}
          value={form[name]}
          aria-invalid={problem !== undefined}
          aria-describedby={problem === undefined ? undefined : `patient-${name}-error`}
          onChange={(event) => setForm({ ...form, [name]: event.target.value })}
        />
        {problem !== undefined && (
          <span id={`patient-${name}-error`} className={ui.fieldError}>
            {problem}
          </span>
        )}
      </div>
    );
  }

  return (
    <section>
      <div className={ui.titleRow}>
        <h2>Patients</h2>
      </div>

      {error !== '' && (
        <p role="alert" className={ui.alert}>
          {error}
        </p>
      )}

      {patients === null ? (
        <p>Loading…</p>
      ) : (
        <ul aria-label="Patients" className={ui.list}>
          {patients.map((patient) => (
            <li key={patient.id} data-testid={`patient-${patient.id}`} className={`${ui.card} ${styles.row}`}>
              <strong>{patient.name}</strong>
              <span>{patient.phone}</span>
              <span className={ui.muted}>{patient.email ?? 'No e-mail'}</span>
              <PatientMenu patient={patient} onRemove={(removed) => void remove(removed)} />
            </li>
          ))}
        </ul>
      )}

      <h3 className={styles.formTitle}>New patient</h3>
      {formError !== '' && (
        <p role="alert" className={ui.alert}>
          {formError}
        </p>
      )}
      <form aria-label="New patient" className={`${ui.card} ${ui.form}`} noValidate onSubmit={(event) => void register(event)}>
        {field('name', 'Name')}
        {field('phone', 'Phone', 'tel')}
        {field('email', 'E-mail (optional)', 'email')}
        {field('birthDate', 'Birth date (optional)', 'date')}
        <div>
          <button type="submit" className={ui.primary}>
            Register
          </button>
        </div>
      </form>
    </section>
  );
}
