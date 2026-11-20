import { useState } from 'react';
import { Link } from 'react-router';
import type { Patient } from '../api/types.ts';
import { Icon } from './Icon.tsx';
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
        <Icon name="more" size={20} />
      </button>
      {open && (
        <ul role="menu" aria-label={`Actions for ${patient.name}`} className={styles.menu}>
          <li role="none">
            <Link role="menuitem" to={`/patients/${patient.id}`}>
              <Icon>
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5M9 13h6M9 17h4" />
              </Icon>
              Open record
            </Link>
          </li>
          <li role="none">
            <Link role="menuitem" to={`/appointments/new?patient=${patient.id}`}>
              <Icon>
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5" />
              </Icon>
              Book appointment
            </Link>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className={styles.danger}
              onClick={() => {
                setOpen(false);
                onRemove(patient);
              }}
            >
              <Icon name="trash" />
              Remove patient
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
