import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ApiError } from '../api/http.ts';
import { removePatient, updatePatient } from '../api/patients.ts';
import type { Patient } from '../api/types.ts';
import ui from '../components/ui.module.css';
import { formatShortDay } from '../dates.ts';
import { formatPhone, maskCpf } from '../masks.ts';
import { useToast } from '../useToast.ts';
import { ConfirmDialog } from './ConfirmDialog.tsx';
import { PatientDialog } from './PatientDialog.tsx';
import styles from './PatientDetails.module.css';
import { Icon } from './Icon.tsx';

/** The registration data of a patient, the first tab of the patient record, with Edit to change it and Remove. */
export function PatientDetails({ patient, onChange }: { patient: Patient; onChange: (patient: Patient) => void }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const editRef = useRef<HTMLButtonElement>(null);
  const removeRef = useRef<HTMLButtonElement>(null);

  function close() {
    setEditing(false);
    editRef.current?.focus();
  }

  /** Removes the patient, after the confirmation, and goes back to the list. */
  async function remove() {
    setConfirming(false);
    try {
      await removePatient(patient.id);
      toast.success(`${patient.name} was removed.`);
      await navigate('/patients');
    } catch (failure) {
      toast.error(failure instanceof ApiError ? `${patient.name}: ${failure.message}` : `${patient.name} could not be removed.`);
      removeRef.current?.focus();
    }
  }

  return (
    <div className={ui.card}>
      <dl className={styles.data}>
        <dt>
          <Icon name="card" />
          CPF
        </dt>
        <dd>{maskCpf(patient.cpf)}</dd>
        <dt>
          <Icon name="shield" />
          Health plan
        </dt>
        <dd>{patient.healthPlan}</dd>
        <dt>
          <Icon name="phone" />
          Phone
        </dt>
        <dd>{formatPhone(patient.phone)}</dd>
        <dt>
          <Icon name="mail" />
          E-mail
        </dt>
        <dd>{patient.email ?? 'No e-mail'}</dd>
        <dt>
          <Icon name="cake" />
          Birth date
        </dt>
        <dd>{patient.birthDate === null ? 'Not informed' : formatShortDay(patient.birthDate)}</dd>
      </dl>
      <div className={styles.actions}>
        <button ref={editRef} type="button" className={ui.button} aria-haspopup="dialog" onClick={() => setEditing(true)}>
          <Icon name="edit" />
          Edit
        </button>
        <button ref={removeRef} type="button" className={ui.danger} aria-haspopup="dialog" onClick={() => setConfirming(true)}>
          <Icon name="trash" />
          Remove
        </button>
      </div>
      {confirming && (
        <ConfirmDialog
          title="Remove patient"
          confirmLabel="Remove"
          onConfirm={() => void remove()}
          onCancel={() => {
            setConfirming(false);
            removeRef.current?.focus();
          }}
        >
          Remove <strong>{patient.name}</strong> from the patients of the clinic? This cannot be undone.
        </ConfirmDialog>
      )}
      {editing && (
        <PatientDialog
          title="Edit patient"
          submitLabel="Save"
          patient={patient}
          save={(input) => updatePatient(patient.id, input)}
          onSaved={(saved) => {
            onChange(saved);
            close();
            toast.success(`The data of ${saved.name} were saved.`);
          }}
          onClose={close}
        />
      )}
    </div>
  );
}
