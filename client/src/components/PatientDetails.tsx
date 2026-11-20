import { useRef, useState } from 'react';
import { updatePatient } from '../api/patients.ts';
import type { Patient } from '../api/types.ts';
import ui from '../components/ui.module.css';
import { formatShortDay } from '../dates.ts';
import { formatPhone, maskCpf } from '../masks.ts';
import { useToast } from '../useToast.ts';
import { PatientDialog } from './PatientDialog.tsx';
import styles from './PatientDetails.module.css';
import { Icon } from './Icon.tsx';

/** The registration data of a patient, the first tab of the patient record, with Edit to change it. */
export function PatientDetails({ patient, onChange }: { patient: Patient; onChange: (patient: Patient) => void }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const editRef = useRef<HTMLButtonElement>(null);

  function close() {
    setEditing(false);
    editRef.current?.focus();
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
      </div>
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
