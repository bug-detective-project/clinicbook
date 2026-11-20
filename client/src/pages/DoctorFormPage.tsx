import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { createDoctor, getDoctor, removeDoctor, updateDoctor } from '../api/doctors.ts';
import { ApiError } from '../api/http.ts';
import type { DoctorWithHours } from '../api/types.ts';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { DoctorForm } from '../components/DoctorForm.tsx';
import ui from '../components/ui.module.css';
import { useToast } from '../useToast.ts';
import { Icon } from '../components/Icon.tsx';

/** The screen of a new doctor (/doctors/new) or of the changes to one (/doctors/:id/edit). */
export function DoctorFormPage() {
  const params = useParams();
  const id = params.id === undefined ? undefined : Number(params.id);
  const navigate = useNavigate();
  const toast = useToast();
  const [doctor, setDoctor] = useState<DoctorWithHours | null>(null);
  const [missing, setMissing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (id === undefined) {
      return;
    }
    let current = true;
    getDoctor(id)
      .then((found) => current && setDoctor(found))
      .catch(() => current && setMissing(true));
    return () => {
      current = false;
    };
  }, [id]);

  if (missing) {
    return (
      <section>
        <h2>Doctor not found</h2>
        <Link className={ui.button} to="/doctors">
          <Icon name="back" />
          Back to the doctors
        </Link>
      </section>
    );
  }
  if (id !== undefined && doctor === null) {
    return <p>Loading…</p>;
  }

  /** Removes the doctor, after the confirmation, and goes back to the list. */
  async function remove(removed: DoctorWithHours) {
    setConfirming(false);
    try {
      await removeDoctor(removed.id);
      toast.success(`${removed.name} was removed.`);
      await navigate('/doctors');
    } catch (failure) {
      toast.error(failure instanceof ApiError ? `${removed.name}: ${failure.message}` : `${removed.name} could not be removed.`);
    }
  }

  const title = id === undefined ? 'New doctor' : 'Edit doctor';
  const back = id === undefined ? '/doctors' : `/doctors/${id}`;

  return (
    <section>
      <div className={ui.titleRow}>
        <div>
          <h2>{title}</h2>
          {doctor !== null && <p className={ui.muted}>{doctor.name}</p>}
        </div>
        <Link className={ui.button} to={back}>
          <Icon name="back" />
          {id === undefined ? 'Back to the doctors' : 'Back to the doctor'}
        </Link>
      </div>
      <DoctorForm
        title={title}
        submitLabel={id === undefined ? 'Register' : 'Save'}
        doctor={doctor ?? undefined}
        save={(input) => (id === undefined ? createDoctor(input) : updateDoctor(id, input))}
        onSaved={(saved) => {
          toast.success(id === undefined ? `${saved.name} was registered.` : `The data of ${saved.name} were saved.`);
          void navigate(`/doctors/${saved.id}`);
        }}
        onCancel={() => void navigate(back)}
        onRemove={doctor === null ? undefined : () => setConfirming(true)}
      />
      {confirming && doctor !== null && (
        <ConfirmDialog title="Remove doctor" confirmLabel="Remove" onConfirm={() => void remove(doctor)} onCancel={() => setConfirming(false)}>
          Remove <strong>{doctor.name}</strong> and the working hours from the clinic? A doctor with appointments stays. This cannot be undone.
        </ConfirmDialog>
      )}
    </section>
  );
}
