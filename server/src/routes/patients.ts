import type { FastifyInstance } from 'fastify';
import type { Context } from '../context.ts';
import type { Db } from '../db.ts';
import { NotFoundError } from '../errors.ts';
import { createPatient, deletePatient, findPatient, listAppointmentsOfPatient, listPatients } from '../repository.ts';
import type { Patient } from '../repository.ts';
import { patientBody } from '../schemas.ts';

interface Id {
  id: string;
}

interface PatientBody {
  name: string;
  phone: string;
  email?: string | null;
  birthDate?: string | null;
}

async function requirePatient(db: Db, id: number): Promise<Patient> {
  const patient = Number.isInteger(id) ? await findPatient(db, id) : undefined;
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }
  return patient;
}

export function patientRoutes(app: FastifyInstance, { db }: Context): void {
  app.get('/api/patients', () => listPatients(db));

  app.post<{ Body: PatientBody }>('/api/patients', { schema: { body: patientBody } }, async (request, reply) => {
    const { name, phone, email, birthDate } = request.body;
    const patient = await createPatient(db, {
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : null,
      birthDate: birthDate || null,
    });
    return reply.status(201).send(patient);
  });

  app.get<{ Params: Id }>('/api/patients/:id', (request) => {
    return requirePatient(db, Number(request.params.id));
  });

  app.get<{ Params: Id }>('/api/patients/:id/appointments', async (request) => {
    const patient = await requirePatient(db, Number(request.params.id));
    return listAppointmentsOfPatient(db, patient.id);
  });

  // A patient with appointments stays: the database refuses to delete a row that others point to.
  app.delete<{ Params: Id }>('/api/patients/:id', async (request, reply) => {
    const patient = await requirePatient(db, Number(request.params.id));
    await deletePatient(db, patient.id);
    return reply.status(204).send();
  });
}
