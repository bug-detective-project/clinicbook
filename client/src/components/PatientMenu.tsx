import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import type { Patient } from '../api/types.ts';
import styles from './PatientMenu.module.css';

/** A line icon beside the label of an action; the label alone names it. */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export interface PatientMenuProps {
  patient: Patient;
  onRemove: (patient: Patient) => void;
}

/** The "..." button of a patient and the menu of actions it opens. */
export function PatientMenu({ patient, onRemove }: PatientMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // While the menu is open, a click anywhere else and the Escape key close it.
  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        // Whoever uses the keyboard goes on from where the menu was opened.
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={styles.wrapper}>
      <button
        ref={buttonRef}
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
              <Icon>
                <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
              </Icon>
              Remove patient
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
