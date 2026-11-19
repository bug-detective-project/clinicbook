import { describe, expect, it } from 'vitest';
import { cpfFrom } from './cpf.ts';
import type { Appointment, Doctor, Patient } from './repository.ts';
import { testApi, TODAY, TOMORROW } from './test/api.ts';

interface Failure {
  error: string;
  fields?: Record<string, string>;
}

describe('the API', () => {
  it('says which day the server calls today', async () => {
    const { get } = await testApi();

    expect(await get('/api/today')).toEqual({ status: 200, body: { today: TODAY } });
  });

  it('answers only the local hosts', async () => {
    const { app } = await testApi();

    const local = await app.inject({ method: 'GET', url: '/api/today', headers: { host: '127.0.0.1:3001' } });
    const other = await app.inject({ method: 'GET', url: '/api/today', headers: { host: 'clinic.example.com' } });

    expect(local.statusCode).toBe(200);
    expect(other.statusCode).toBe(403);
  });

  it('answers 404 for a route it does not have', async () => {
    const { get } = await testApi();

    expect(await get('/api/nothing')).toEqual({ status: 404, body: { error: 'Not found' } });
  });
});

describe('doctors', () => {
  it('lists the doctors of the clinic', async () => {
    const { get } = await testApi();

    const { body } = await get<Doctor[]>('/api/doctors');

    expect(body.map((doctor) => doctor.name)).toEqual(['Dr. Helena Prado', 'Dr. Marcos Oliveira', 'Dr. Yuki Tanabe']);
  });
});

describe('the appointments of a day', () => {
  it('lists the appointments of today, the earliest first, with the names', async () => {
    const { get } = await testApi();

    const { status, body } = await get<Appointment[]>('/api/appointments');

    expect(status).toBe(200);
    expect(body.map((appointment) => `${appointment.time} ${appointment.status}`)).toEqual([
      '08:00 confirmed',
      '08:30 scheduled',
      '09:00 scheduled',
      '09:30 cancelled',
      '10:00 scheduled',
      '14:00 scheduled',
    ]);
    expect(body[0]).toMatchObject({ patientName: 'Ana Beatriz Costa', doctorName: 'Dr. Helena Prado', day: TODAY });
  });

  it('lists the appointments of another day', async () => {
    const { get } = await testApi();

    const { body } = await get<Appointment[]>(`/api/appointments?day=${TOMORROW}`);

    expect(body.map((appointment) => appointment.patientName)).toEqual([
      'Giovana Martins',
      'Bruno Carvalho',
      'Heitor Nogueira',
      'Ana Beatriz Costa',
    ]);
  });

  it('refuses a day that is not a date', async () => {
    const { get } = await testApi();

    const { status, body } = await get<Failure>('/api/appointments?day=tomorrow');

    expect(status).toBe(400);
    expect(body.fields).toHaveProperty('day');
  });
});

describe('booking an appointment', () => {
  const booking = { patientId: 3, doctorId: 1, day: TOMORROW, time: '10:30', reason: 'Sore throat' };

  it('books it as scheduled and shows it on the day', async () => {
    const { get, post } = await testApi();

    const created = await post<Appointment>('/api/appointments', booking);
    const day = await get<Appointment[]>(`/api/appointments?day=${TOMORROW}`);

    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ ...booking, status: 'scheduled', patientName: 'Camila Duarte' });
    expect(day.body.map((appointment) => appointment.id)).toContain(created.body.id);
  });

  it('refuses a request without the required fields, naming them', async () => {
    const { post } = await testApi();

    const { status, body } = await post<Failure>('/api/appointments', { patientId: 3 });

    expect(status).toBe(400);
    expect(Object.keys(body.fields ?? {}).sort()).toEqual(['day', 'doctorId', 'time']);
  });

  it('refuses a patient or a doctor the clinic does not have', async () => {
    const { post } = await testApi();

    expect((await post('/api/appointments', { ...booking, patientId: 999 })).status).toBe(400);
    expect((await post('/api/appointments', { ...booking, doctorId: 999 })).status).toBe(400);
  });

  it('refuses a day in the past', async () => {
    const { post } = await testApi();

    const { status, body } = await post<Failure>('/api/appointments', { ...booking, day: '2026-03-06' });

    expect(status).toBe(400);
    expect(body.error).toBe('An appointment cannot be booked in the past');
  });

  it('refuses a time outside the working hours of the doctor', async () => {
    const { post } = await testApi();

    // Dr. Helena Prado stops for lunch at 12:00, and does not work on Saturdays.
    expect((await post('/api/appointments', { ...booking, time: '12:00' })).status).toBe(400);
    expect((await post('/api/appointments', { ...booking, time: '10:15' })).status).toBe(400);
    expect((await post('/api/appointments', { ...booking, day: '2026-03-14', time: '10:30' })).status).toBe(400);
  });
});

describe('confirming and cancelling', () => {
  it('confirms a scheduled appointment', async () => {
    const { post } = await testApi();

    const { status, body } = await post<Appointment>('/api/appointments/7/confirm');

    expect(status).toBe(200);
    expect(body).toMatchObject({ id: 7, status: 'confirmed' });
  });

  it('cancels a scheduled appointment and a confirmed one', async () => {
    const { post } = await testApi();

    expect((await post<Appointment>('/api/appointments/7/cancel')).body.status).toBe('cancelled');
    expect((await post<Appointment>('/api/appointments/6/cancel')).body.status).toBe('cancelled');
  });

  it('refuses to cancel what is already cancelled', async () => {
    const { post } = await testApi();

    const { status, body } = await post<Failure>('/api/appointments/9/cancel');

    expect(status).toBe(409);
    expect(body.error).toBe('This appointment is already cancelled');
  });

  it('answers 404 for an appointment that does not exist', async () => {
    const { get, post } = await testApi();

    expect((await post('/api/appointments/999/confirm')).status).toBe(404);
    expect((await post('/api/appointments/abc/cancel')).status).toBe(404);
    expect(await get('/api/appointments/999')).toEqual({ status: 404, body: { error: 'Appointment not found' } });
  });
});

describe('patients', () => {
  it('lists the patients by name', async () => {
    const { get } = await testApi();

    const { body } = await get<Patient[]>('/api/patients');

    expect(body).toHaveLength(8);
    expect(body[0]).toEqual({
      id: 1,
      name: 'Ana Beatriz Costa',
      phone: '(11) 98888-1001',
      email: 'ana.costa@example.com',
      birthDate: '1988-04-12',
      cpf: cpfFrom('390533447'),
      healthPlan: 'Horizonte Saúde',
    });
  });

  it('registers a patient', async () => {
    const { get, post } = await testApi();

    const created = await post<Patient>('/api/patients', {
      name: ' Íris Pacheco ',
      phone: '(11) 91111-9009',
      email: 'Iris@Example.com',
      cpf: '123.456.789-09',
      healthPlan: ' Amparo Vida ',
    });

    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      name: 'Íris Pacheco',
      phone: '(11) 91111-9009',
      email: 'iris@example.com',
      birthDate: null,
      cpf: '12345678909',
      healthPlan: 'Amparo Vida',
    });
    expect((await get<Patient>(`/api/patients/${created.body.id}`)).body.name).toBe('Íris Pacheco');
  });

  it('accepts the phone formats the clinic uses', async () => {
    const { post } = await testApi();

    const phones = ['11988887777', '(11) 98888-7777', '+55 11 98888-7777', '3555-4004'];
    for (const [index, phone] of phones.entries()) {
      const cpf = cpfFrom(`11122233${index}`);
      expect((await post('/api/patients', { name: 'Someone New', phone, cpf, healthPlan: 'Private' })).status, phone).toBe(201);
    }
  });

  it('refuses a patient without a name, a phone, a CPF or a health plan, naming the fields', async () => {
    const { post } = await testApi();

    const { status, body } = await post<Failure>('/api/patients', { email: 'nobody@example.com' });

    expect(status).toBe(400);
    expect(Object.keys(body.fields ?? {}).sort()).toEqual(['cpf', 'healthPlan', 'name', 'phone']);
  });

  it('refuses a CPF whose check digits do not match', async () => {
    const { post } = await testApi();

    const { status, body } = await post<Failure>('/api/patients', { name: 'Someone New', phone: '11 90000-0000', cpf: '123.456.789-00', healthPlan: 'Private' });

    expect(status).toBe(400);
    expect(body.fields).toEqual({ cpf: 'Enter a valid CPF: its check digits do not match' });
  });

  it('refuses a CPF that belongs to another patient, written either way', async () => {
    const { post } = await testApi();
    const ana = cpfFrom('390533447');
    const written = `${ana.slice(0, 3)}.${ana.slice(3, 6)}.${ana.slice(6, 9)}-${ana.slice(9)}`;

    const { status, body } = await post<Failure>('/api/patients', { name: 'Someone New', phone: '11 90000-0000', cpf: written, healthPlan: 'Private' });

    expect(status).toBe(409);
    expect(body.fields).toEqual({ cpf: 'This CPF belongs to another patient' });
  });

  it('refuses a phone that is too short and an e-mail that is not one', async () => {
    const { post } = await testApi();

    const { status, body } = await post<Failure>('/api/patients', { name: 'Someone New', phone: '1234', email: 'not an e-mail', cpf: '123.456.789-09', healthPlan: 'Private' });

    expect(status).toBe(400);
    expect(Object.keys(body.fields ?? {}).sort()).toEqual(['email', 'phone']);
  });

  it('lists the appointments of a patient, the most recent first', async () => {
    const { get } = await testApi();

    const { body } = await get<Appointment[]>('/api/patients/1/appointments');

    expect(body.map((appointment) => `${appointment.day} ${appointment.status}`)).toEqual([
      '2026-03-18 scheduled',
      '2026-03-10 cancelled',
      '2026-03-09 confirmed',
      '2026-03-03 confirmed',
      '2026-03-02 confirmed',
    ]);
  });

  it('changes the data of a patient', async () => {
    const { get, patch } = await testApi();
    const ana = cpfFrom('390533447');

    const changed = await patch<Patient>('/api/patients/1', {
      name: 'Ana Beatriz Costa Lima',
      phone: '(11) 98888-2002',
      email: 'Ana.Lima@Example.com',
      birthDate: '1988-04-12',
      cpf: ana,
      healthPlan: ' Amparo Vida ',
    });

    expect(changed.status).toBe(200);
    expect(changed.body).toEqual({
      id: 1,
      name: 'Ana Beatriz Costa Lima',
      phone: '(11) 98888-2002',
      email: 'ana.lima@example.com',
      birthDate: '1988-04-12',
      cpf: ana,
      healthPlan: 'Amparo Vida',
    });
    expect((await get<Patient>('/api/patients/1')).body.healthPlan).toBe('Amparo Vida');
  });

  it('refuses to give a patient the CPF of another, or one whose digits do not match', async () => {
    const { patch } = await testApi();
    const data = { name: 'Ana Beatriz Costa', phone: '(11) 98888-1001', healthPlan: 'Private' };

    const taken = await patch<Failure>('/api/patients/1', { ...data, cpf: cpfFrom('153509460') });
    const wrong = await patch<Failure>('/api/patients/1', { ...data, cpf: '123.456.789-00' });

    expect(taken.status).toBe(409);
    expect(taken.body.fields).toEqual({ cpf: 'This CPF belongs to another patient' });
    expect(wrong.status).toBe(400);
    expect(wrong.body.fields).toEqual({ cpf: 'Enter a valid CPF: its check digits do not match' });
  });

  it('answers 404 when changing a patient that does not exist', async () => {
    const { patch } = await testApi();

    const { status } = await patch('/api/patients/999', { name: 'Nobody', phone: '11 90000-0000', cpf: '123.456.789-09', healthPlan: 'Private' });

    expect(status).toBe(404);
  });

  it('removes a patient who has no appointments', async () => {
    const { get, post, delete: remove } = await testApi();
    const created = await post<Patient>('/api/patients', { name: 'Passing By', phone: '11 90000-0000', cpf: '123.456.789-09', healthPlan: 'Private' });

    expect((await remove(`/api/patients/${created.body.id}`)).status).toBe(204);
    expect((await get(`/api/patients/${created.body.id}`)).status).toBe(404);
  });

  it('answers 404 for a patient that does not exist', async () => {
    const { get, delete: remove } = await testApi();

    expect(await get('/api/patients/999')).toEqual({ status: 404, body: { error: 'Patient not found' } });
    expect((await get('/api/patients/999/appointments')).status).toBe(404);
    expect((await remove('/api/patients/999')).status).toBe(404);
  });
});

describe('reminders', () => {
  interface Outbox {
    enabled: boolean;
    reminders: { patientName: string; phone: string; message: string }[];
  }

  it('sends one reminder for each appointment of tomorrow that is not cancelled', async () => {
    const { get, post } = await testApi();

    const run = await post('/api/reminders/run');
    const outbox = await get<Outbox>('/api/reminders');

    expect(run).toEqual({ status: 200, body: { enabled: true, sent: 3 } });
    expect(outbox.body.enabled).toBe(true);
    expect(outbox.body.reminders.map((reminder) => `${reminder.patientName} ${reminder.phone}`).sort()).toEqual([
      'Bruno Carvalho 11977772002',
      'Giovana Martins 11933337007',
      'Heitor Nogueira 11922228008',
    ]);
    expect(outbox.body.reminders.find((reminder) => reminder.patientName === 'Giovana Martins')?.message).toBe(
      'Hi Giovana, this is Vila Clara Clinic. You have an appointment with Dr. Helena Prado on Tuesday, March 10 at 09:00. Reply C to confirm.',
    );
  });

  it('sends each reminder once', async () => {
    const { post } = await testApi();

    await post('/api/reminders/run');

    expect((await post('/api/reminders/run')).body).toEqual({ enabled: true, sent: 0 });
  });

  it('sends nothing when the clinic turned the reminders off', async () => {
    const { get, post } = await testApi({ remindersEnabled: false });

    expect((await post('/api/reminders/run')).body).toEqual({ enabled: false, sent: 0 });
    expect((await get<Outbox>('/api/reminders')).body).toEqual({ enabled: false, reminders: [] });
  });
});
