import type { FastifyInstance } from 'fastify';
import type { Context } from '../context.ts';
import type { Db } from '../db.ts';
import { cpfDigits, isValidCpf } from '../cpf.ts';
import { HttpError, InvalidError, NotFoundError } from '../errors.ts';
import { cpfInUse, createPatient, deletePatient, findPatient, listAppointmentsOfPatient, listPatients, updatePatient } from '../repository.ts';
import type { Patient, PatientInput } from '../repository.ts';
import { patientBody, patientPatchBody } from '../schemas.ts';

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

/**
 * What the database keeps from a body the schema accepted: trimmed texts, the e-mail in lower case,
 * and the 11 digits of a CPF whose check digits match and that no other patient (than `id`) has.
 */
async function inputOf(db: Db, body: PatientBody, id?: number): Promise<PatientInput> {
  const cpf = cpfDigits(body.cpf);
  if (cpf === null || !isValidCpf(cpf)) {
    throw new InvalidError('Some fields are not valid', { cpf: 'Enter a valid CPF: its check digits do not match' });
  }
  if (await cpfInUse(db, cpf, id)) {
    throw new HttpError(409, 'This CPF belongs to another patient', { cpf: 'This CPF belongs to another patient' });
  }
  return {
    name: body.name.trim(),
    phone: body.phone.trim(),
    email: body.email ? body.email.trim().toLowerCase() : null,
    birthDate: body.birthDate || null,
    cpf,
    healthPlan: body.healthPlan.trim(),
  };
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
    const patient = await createPatient(db, await inputOf(db, request.body));
    return reply.status(201).send(patient);
  });

  // Only the fields sent change: a field left out keeps its value, and an e-mail or a birth date sent as null is cleared.
  app.patch<{ Params: Id; Body: Partial<PatientBody> }>('/api/patients/:id', { schema: { body: patientPatchBody } }, async (request) => {
    const patient = await requirePatient(db, Number(request.params.id));
    const body = request.body;
    const merged: PatientBody = {
      name: body.name ?? patient.name,
      phone: body.phone ?? patient.phone,
      email: body.email ?? null,
      birthDate: body.birthDate ?? null,
      cpf: body.cpf ?? patient.cpf,
      healthPlan: body.healthPlan ?? patient.healthPlan,
    };
    return updatePatient(db, patient.id, await inputOf(db, merged, patient.id));
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
