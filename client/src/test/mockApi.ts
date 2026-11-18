import { vi } from 'vitest';
import type { Appointment, Doctor, Patient, Reminder } from '../api/types.ts';

/** The day every client test calls today: a Monday. */
export const TODAY = '2026-03-09';
export const TOMORROW = '2026-03-10';

export function createTestDoctors(): Doctor[] {
  return [
    { id: 1, name: 'Dr. Helena Prado', specialty: 'General practice' },
    { id: 2, name: 'Dr. Marcos Oliveira', specialty: 'Pediatrics' },
  ];
}

export function createTestPatients(): Patient[] {
  return [
    { id: 1, name: 'Ana Beatriz Costa', phone: '(11) 98888-1001', email: 'ana.costa@example.com', birthDate: '1988-04-12' },
    { id: 2, name: 'Bruno Carvalho', phone: '11 97777-2002', email: 'bruno.carvalho@example.com', birthDate: '1975-11-03' },
    { id: 3, name: 'Camila Duarte', phone: '+55 11 96666-3003', email: null, birthDate: null },
    { id: 4, name: 'Davi Fernandes', phone: '(11) 3555-4004', email: 'familia.fernandes@example.com', birthDate: '2019-02-14' },
  ];
}

/** [id, patient, doctor, day, time, status, reason]; Davi Fernandes (4) has no appointment. */
const APPOINTMENTS: [number, number, number, string, string, Appointment['status'], string][] = [
  [1, 1, 1, '2026-03-02', '09:00', 'confirmed', 'Check-up'],
  [2, 1, 1, TODAY, '08:00', 'confirmed', 'Check-up results'],
  [3, 2, 1, TODAY, '08:30', 'scheduled', 'Back pain'],
  [4, 3, 2, TODAY, '09:00', 'scheduled', 'Vaccination'],
  [5, 2, 2, TODAY, '09:30', 'cancelled', 'Fever'],
  [6, 3, 1, TOMORROW, '09:00', 'scheduled', 'Headaches'],
  [7, 1, 1, TOMORROW, '11:00', 'cancelled', 'Skin rash'],
];

export function createTestAppointments(): Appointment[] {
  const doctors = createTestDoctors();
  const patients = createTestPatients();
  return APPOINTMENTS.map(([id, patientId, doctorId, day, time, status, reason]) => ({
    id,
    patientId,
    patientName: patients.find((patient) => patient.id === patientId)!.name,
    doctorId,
    doctorName: doctors.find((doctor) => doctor.id === doctorId)!.name,
    day,
    time,
    status,
    reason,
  }));
}

/** The times every doctor of the tests works, on every day. */
export const WORKING_TIMES = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];

export interface MockRequest {
  method: string;
  path: string;
  query: URLSearchParams;
  body: unknown;
}

export interface MockApiOptions {
  appointments?: Appointment[];
  patients?: Patient[];
  /** Whether the clinic sends reminders; the default is true. */
  remindersEnabled?: boolean;
  /** Return a response (or a promise of one) to override the default handling of a request. */
  respond?: (request: MockRequest) => Response | undefined | Promise<Response | undefined>;
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function notFound(what: string): Response {
  return json({ error: `${what} not found` }, 404);
}

/**
 * Replaces the global fetch with an in-memory version of the ClinicBook API.
 * Returns the mock so tests can inspect the requests that were made.
 */
export function mockApi(options: MockApiOptions = {}) {
  const doctors = createTestDoctors();
  let patients = options.patients ?? createTestPatients();
  const appointments = options.appointments ?? createTestAppointments();
  const reminders: Reminder[] = [];
  const requests: MockRequest[] = [];

  function byDayAndTime(a: Appointment, b: Appointment): number {
    return `${a.day} ${a.time}`.localeCompare(`${b.day} ${b.time}`);
  }

  function freeSlots(doctorId: number, day: string): string[] {
    const taken = appointments
      .filter((item) => item.doctorId === doctorId && item.day === day && item.status !== 'cancelled')
      .map((item) => item.time);
    return WORKING_TIMES.filter((time) => !taken.includes(time));
  }

  function handle({ method, path, query, body }: MockRequest): Response {
    const data = (body ?? {}) as Record<string, unknown>;
    const route = `${method} ${path.replace(/\/\d+(?=\/|$)/, '/:id')}`;
    const id = Number(path.match(/\/(\d+)(?=\/|$)/)?.[1]);
    const appointment = appointments.find((item) => item.id === id);
    const patient = patients.find((item) => item.id === id);

    switch (route) {
      case 'GET /api/today':
        return json({ today: TODAY });
      case 'GET /api/doctors':
        return json(doctors);
      case 'GET /api/doctors/:id/slots':
        return json({ day: query.get('day'), slots: freeSlots(id, query.get('day') ?? TODAY) });
      case 'GET /api/appointments':
        return json(appointments.filter((item) => item.day === (query.get('day') ?? TODAY)).sort(byDayAndTime));
      case 'POST /api/appointments': {
        const created: Appointment = {
          id: Math.max(0, ...appointments.map((item) => item.id)) + 1,
          patientId: Number(data.patientId),
          patientName: patients.find((item) => item.id === Number(data.patientId))?.name ?? '',
          doctorId: Number(data.doctorId),
          doctorName: doctors.find((item) => item.id === Number(data.doctorId))?.name ?? '',
          day: String(data.day),
          time: String(data.time),
          status: 'scheduled',
          reason: String(data.reason ?? ''),
        };
        appointments.push(created);
        return json(created, 201);
      }
      case 'GET /api/appointments/:id':
        return appointment ? json(appointment) : notFound('Appointment');
      case 'POST /api/appointments/:id/confirm':
      case 'POST /api/appointments/:id/cancel':
        if (!appointment) {
          return notFound('Appointment');
        }
        appointment.status = route.endsWith('confirm') ? 'confirmed' : 'cancelled';
        return json(appointment);
      case 'PATCH /api/appointments/:id':
        if (!appointment) {
          return notFound('Appointment');
        }
        Object.assign(appointment, { day: String(data.day), time: String(data.time), status: 'scheduled' });
        return json(appointment);
      case 'GET /api/patients':
        return json([...patients].sort((a, b) => a.name.localeCompare(b.name)));
      case 'POST /api/patients': {
        const created: Patient = {
          id: Math.max(0, ...patients.map((item) => item.id)) + 1,
          name: String(data.name).trim(),
          phone: String(data.phone).trim(),
          email: typeof data.email === 'string' ? data.email : null,
          birthDate: typeof data.birthDate === 'string' ? data.birthDate : null,
        };
        patients.push(created);
        return json(created, 201);
      }
      case 'GET /api/patients/:id':
        return patient ? json(patient) : notFound('Patient');
      case 'GET /api/patients/:id/appointments':
        return patient ? json(appointments.filter((item) => item.patientId === id).sort((a, b) => byDayAndTime(b, a))) : notFound('Patient');
      case 'DELETE /api/patients/:id':
        if (!patient) {
          return notFound('Patient');
        }
        if (appointments.some((item) => item.patientId === id)) {
          return json({ error: 'This record is in use and cannot be removed' }, 409);
        }
        patients = patients.filter((item) => item.id !== id);
        return new Response(null, { status: 204 });
      case 'GET /api/reminders':
        return json({ enabled: options.remindersEnabled ?? true, reminders: [...reminders].reverse() });
      case 'POST /api/reminders/run': {
        if (!(options.remindersEnabled ?? true)) {
          return json({ enabled: false, sent: 0 });
        }
        const due = appointments.filter(
          (item) => item.day === TOMORROW && item.status !== 'cancelled' && !reminders.some((sent) => sent.appointmentId === item.id),
        );
        for (const item of due) {
          reminders.push({
            id: reminders.length + 1,
            appointmentId: item.id,
            patientName: item.patientName,
            phone: patients.find((one) => one.id === item.patientId)?.phone.replace(/\D/g, '') ?? '',
            message: `Hi ${item.patientName.split(' ')[0]}, you have an appointment with ${item.doctorName} at ${item.time}.`,
            createdAt: `${TODAY}T12:00:00.000Z`,
          });
        }
        return json({ enabled: true, sent: due.length });
      }
      default:
        return json({ error: 'Not found' }, 404);
    }
  }

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), 'http://localhost');
    const request: MockRequest = {
      method: init?.method ?? 'GET',
      path: url.pathname,
      query: url.searchParams,
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
    };
    requests.push(request);
    return (await options.respond?.(request)) ?? handle(request);
  });
  vi.stubGlobal('fetch', fetchMock);

  return {
    requests,
    /** The requests made with this method to this path, such as ('POST', '/api/appointments'). */
    calls: (method: string, path: string) => requests.filter((request) => request.method === method && request.path === path),
    appointments,
  };
}
