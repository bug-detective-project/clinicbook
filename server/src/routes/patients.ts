import type { FastifyInstance } from 'fastify';
import type { Context } from '../context.ts';
import type { Db } from '../db.ts';
import { cpfDigits, isValidCpf } from '../cpf.ts';
import { HttpError, InvalidError, NotFoundError } from '../errors.ts';
import { cpfInUse, createPatient, deletePatient, findPatient, listAppointmentsOfPatient, listPatients } from '../repository.ts';
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
  cpf: string;
  healthPlan: string;
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
    // The schema checked the shape of the CPF; its check digits and its owner are checked here.
    const cpf = cpfDigits(request.body.cpf);
    if (cpf === null || !isValidCpf(cpf)) {
      throw new InvalidError('Some fields are not valid', { cpf: 'Enter a valid CPF: its check digits do not match' });
    }
    if (await cpfInUse(db, cpf)) {
      throw new HttpError(409, 'This CPF belongs to another patient', { cpf: 'This CPF belongs to another patient' });
    }
    const patient = await createPatient(db, {
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : null,
      birthDate: birthDate || null,
      cpf,
      healthPlan: request.body.healthPlan.trim(),
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
