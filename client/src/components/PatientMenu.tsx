import { useState } from 'react';
import { Link } from 'react-router';
import type { Patient } from '../api/types.ts';
import styles from './PatientMenu.module.css';

export interface PatientMenuProps {
  patient: Patient;
  onRemove: (patient: Patient) => void;
}

/** The "..." button of a patient and the menu of actions it opens. */
export function PatientMenu({ patient, onRemove }: PatientMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${patient.name}`}
        onClick={() => setOpen((value) => !value)}
      >
        ⋯
      </button>
      {open && (
        <ul role="menu" aria-label={`Actions for ${patient.name}`} className={styles.menu}>
          <li role="none">
            <Link role="menuitem" to={`/patients/${patient.id}`}>
              Open record
            </Link>
          </li>
          <li role="none">
            <Link role="menuitem" to={`/appointments/new?patient=${patient.id}`}>
              Book appointment
            </Link>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onRemove(patient);
              }}
            >
              Remove patient
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
