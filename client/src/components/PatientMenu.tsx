import { useEffect, useRef, useState } from 'react';
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
