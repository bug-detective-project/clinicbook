import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { ApiError } from '../api/http.ts';
import type { NewPatient } from '../api/patients.ts';
import type { Patient } from '../api/types.ts';
import { maskCpf, maskPhone } from '../masks.ts';
import { useToday } from '../useToday.ts';
import { DatePicker } from './DatePicker.tsx';
import styles from './PatientDialog.module.css';
import ui from './ui.module.css';

const EMPTY_FORM = { name: '', phone: '', email: '', birthDate: '', cpf: '', healthPlan: '' };

/** The form as the screen holds it, from a patient (to change) or empty (a new one). */
function formOf(patient: Patient | undefined): typeof EMPTY_FORM {
  if (patient === undefined) {
    return EMPTY_FORM;
  }
  return {
    name: patient.name,
    phone: maskPhone(patient.phone),
    email: patient.email ?? '',
    birthDate: patient.birthDate ?? '',
    cpf: maskCpf(patient.cpf),
    healthPlan: patient.healthPlan,
  };
}

interface PatientDialogProps {
  /** "New patient" or "Edit patient": the title of the dialog and the name of its form. */
  title: string;
  /** The text of the button that saves: "Register" or "Save". */
  submitLabel: string;
  /** The patient to change; left out for a new one. */
  patient?: Patient;
  /** Sends the form to the API; what the API refuses is shown next to its field. */
  save: (input: NewPatient) => Promise<Patient>;
  onSaved: (patient: Patient) => void;
  onClose: () => void;
}

/**
 * The registration data of a patient in a dialog over the page: a new patient, or the changes to
 * one. It opens on its first field; Escape, Cancel, × and a press around it close it, and Tab stays
 * inside it. The page that opens it gives the focus back to its button.
 */
export function PatientDialog({ title, submitLabel, patient, save, onSaved, onClose }: PatientDialogProps) {
  const today = useToday();
  const [form, setForm] = useState(() => formOf(patient));
  const [formError, setFormError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.querySelector('input')?.focus();
  }, []);

  function dialogKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }
    const stops = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button, input') ?? [])];
    const first = stops[0];
    const last = stops.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setFormError('');
    setFields({});
    try {
      const saved = await save({
        name: form.name,
        phone: form.phone,
        email: form.email.trim() === '' ? null : form.email,
        birthDate: form.birthDate === '' ? null : form.birthDate,
        cpf: form.cpf,
        healthPlan: form.healthPlan,
      });
      onSaved(saved);
    } catch (failure) {
      setFormError(failure instanceof ApiError ? failure.message : 'The patient could not be saved.');
      setFields(failure instanceof ApiError ? failure.fields : {});
    }
  }

  /** A field of the form; `mask` reshapes what is typed (the CPF and the phone take digits only). */
  function field(name: keyof typeof EMPTY_FORM, label: string, type = 'text', mask?: (text: string) => string, placeholder?: string) {
    const problem = fields[name];
    return (
      <div className={ui.field}>
        <label htmlFor={`patient-${name}`}>{label}</label>
        <input
          id={`patient-${name}`}
          type={type}
          inputMode={mask === undefined ? undefined : 'numeric'}
          placeholder={placeholder}
          value={form[name]}
          aria-invalid={problem !== undefined}
          aria-describedby={problem === undefined ? undefined : `patient-${name}-error`}
          onChange={(event) => setForm({ ...form, [name]: mask === undefined ? event.target.value : mask(event.target.value) })}
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
    // A press on the dark area around the dialog closes it, like its Cancel button.
    <div className={styles.backdrop} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="patient-dialog-title" className={styles.dialog} onKeyDown={dialogKey}>
        <div className={styles.dialogHead}>
          <h3 id="patient-dialog-title">{title}</h3>
          <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        {formError !== '' && (
          <p role="alert" className={ui.alert}>
            {formError}
          </p>
        )}
        <form aria-label={title} className={`${ui.form} ${styles.dialogForm}`} noValidate onSubmit={(event) => void submit(event)}>
          {field('name', 'Name')}
          {field('cpf', 'CPF', 'text', maskCpf, '000.000.000-00')}
          {field('phone', 'Phone', 'tel', maskPhone, '(00) 00000-0000')}
          {field('healthPlan', 'Health plan', 'text', undefined, 'Private, or the name of the plan')}
          {field('email', 'E-mail (optional)', 'email')}
          <div className={ui.field}>
            <DatePicker
              label="Birth date (optional)"
              value={form.birthDate}
              today={today}
              max={today}
              optional
              invalid={fields.birthDate !== undefined}
              describedBy={fields.birthDate === undefined ? undefined : 'patient-birthDate-error'}
              onChange={(birthDate) => setForm({ ...form, birthDate })}
            />
            {fields.birthDate !== undefined && (
              <span id="patient-birthDate-error" className={ui.fieldError}>
                {fields.birthDate}
              </span>
            )}
          </div>
          <div className={styles.dialogActions}>
            <button type="button" className={ui.button} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={ui.primary}>
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
