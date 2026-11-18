import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { bookAppointment, getAppointment, rescheduleAppointment } from '../api/appointments.ts';
import { listDoctors, listSlots } from '../api/doctors.ts';
import { ApiError } from '../api/http.ts';
import { listPatients } from '../api/patients.ts';
import type { Appointment, Doctor, Patient } from '../api/types.ts';
import { TimeSlotPicker } from '../components/TimeSlotPicker.tsx';
import ui from '../components/ui.module.css';
import { useToday } from '../useToday.ts';

/**
 * The form that books an appointment and the one that reschedules it: the same fields, and when
 * rescheduling the patient and the doctor are the ones of the appointment.
 * A link may bring values in the address: /appointments/new?patient=3&doctor=1&day=2026-03-10&time=10:30
 */
export function BookingPage() {
  const today = useToday();
  const navigate = useNavigate();
  const { id } = useParams();
  const [params] = useSearchParams();
  const rescheduling = id !== undefined;

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patientId, setPatientId] = useState(params.get('patient') ?? '');
  const [doctorId, setDoctorId] = useState(params.get('doctor') ?? '');
  const [day, setDay] = useState(params.get('day') ?? today);
  const [time, setTime] = useState(params.get('time') ?? '');
  const [reason, setReason] = useState('');
  const [slots, setSlots] = useState<string[] | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let current = true;
    Promise.all([listPatients(), listDoctors(), rescheduling ? getAppointment(Number(id)) : null])
      .then(([patientList, doctorList, existing]) => {
        if (!current) {
          return;
        }
        setPatients(patientList);
        setDoctors(doctorList);
        if (existing) {
          setAppointment(existing);
          setPatientId(String(existing.patientId));
          setDoctorId(String(existing.doctorId));
          setDay(existing.day < today ? today : existing.day);
        }
      })
      .catch(() => {
        if (current) {
          setError(rescheduling ? 'This appointment could not be loaded.' : 'The form could not be loaded.');
        }
      });
    return () => {
      current = false;
    };
  }, [id, rescheduling, today]);

  // The free times belong to a doctor and a day: they are asked again when either changes.
  useEffect(() => {
    if (doctorId === '' || day === '') {
      setSlots(null);
      return;
    }
    let current = true;
    setSlots(null);
    listSlots(Number(doctorId), day)
      .then((list) => {
        if (current) {
          setSlots(list);
          setTime((chosen) => (list.includes(chosen) ? chosen : ''));
        }
      })
      .catch(() => {
        if (current) {
          setSlots([]);
          setError('The free times could not be loaded.');
        }
      });
    return () => {
      current = false;
    };
  }, [doctorId, day]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving) {
      return;
    }
    if (patientId === '' || doctorId === '' || day === '' || time === '') {
      setError('Choose the patient, the doctor, the day and the time.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (rescheduling) {
        await rescheduleAppointment(Number(id), day, time);
      } else {
        await bookAppointment({ patientId: Number(patientId), doctorId: Number(doctorId), day, time, reason });
      }
      await navigate(`/?day=${day}`);
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'The appointment could not be saved.');
      setSaving(false);
    }
  }

  const title = rescheduling ? 'Reschedule appointment' : 'Book appointment';

  let timeField = <p className={ui.muted}>Choose a doctor and a day to see the free times.</p>;
  if (doctorId !== '' && day !== '') {
    timeField
      = slots === null ? <p className={ui.muted}>Loading the free times…</p> : <TimeSlotPicker slots={slots} value={time} onChange={setTime} />;
  }

  return (
    <section>
      <div className={ui.titleRow}>
        <h2>{title}</h2>
        <Link className={ui.button} to="/">
          Back to the agenda
        </Link>
      </div>

      {error !== '' && (
        <p role="alert" className={ui.alert}>
          {error}
        </p>
      )}

      <form aria-label={title} className={`${ui.card} ${ui.form}`} onSubmit={(event) => void submit(event)}>
        {rescheduling ? (
          <p className={ui.notice}>
            {appointment === null
              ? 'Loading…'
              : `${appointment.patientName} with ${appointment.doctorName}, now on ${appointment.day} at ${appointment.time}.`}
          </p>
        ) : (
          <>
            <label className={ui.field}>
              <span>Patient</span>
              <select value={patientId} onChange={(event) => setPatientId(event.target.value)}>
                <option value="">Choose a patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={ui.field}>
              <span>Doctor</span>
              <select value={doctorId} onChange={(event) => setDoctorId(event.target.value)}>
                <option value="">Choose a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} ({doctor.specialty})
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        <label className={ui.field}>
          <span>Day</span>
          <input type="date" value={day} min={today} onChange={(event) => setDay(event.target.value)} />
        </label>

        <div className={ui.field}>
          <span className={ui.legend}>Time</span>
          {timeField}
        </div>

        {!rescheduling && (
          <label className={ui.field}>
            <span>Reason (optional)</span>
            <input type="text" value={reason} maxLength={200} onChange={(event) => setReason(event.target.value)} />
          </label>
        )}

        <div>
          <button type="submit" className={ui.primary} disabled={saving}>
            {rescheduling ? 'Reschedule' : 'Book'}
          </button>
        </div>
      </form>
    </section>
  );
}
