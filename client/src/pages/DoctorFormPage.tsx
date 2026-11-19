import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { createDoctor, getDoctor, updateDoctor } from '../api/doctors.ts';
import type { DoctorWithHours } from '../api/types.ts';
import { DoctorForm } from '../components/DoctorForm.tsx';
import ui from '../components/ui.module.css';
import { useToast } from '../useToast.ts';

/** The screen of a new doctor (/doctors/new) or of the changes to one (/doctors/:id/edit). */
export function DoctorFormPage() {
  const params = useParams();
  const id = params.id === undefined ? undefined : Number(params.id);
  const navigate = useNavigate();
  const toast = useToast();
  const [doctor, setDoctor] = useState<DoctorWithHours | null>(null);
  const [missing, setMissing] = useState(false);

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
          Back to the doctors
        </Link>
      </section>
    );
  }
  if (id !== undefined && doctor === null) {
    return <p>Loading…</p>;
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
      />
    </section>
  );
}
