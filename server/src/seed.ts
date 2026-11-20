import { cpfFrom } from './cpf.ts';
import { addDays, mondayOf } from './dates.ts';
import type { AppointmentStatus } from './db.ts';

// The sample data of the clinic. The appointments are written relative to the week of "today", so
// the agenda looks alive on whatever day the database is reset.

export const seedDoctors = [
  { id: 1, name: 'Dr. Helena Prado', specialty: 'General practice' },
  { id: 2, name: 'Dr. Marcos Oliveira', specialty: 'Pediatrics' },
  { id: 3, name: 'Dr. Yuki Tanabe', specialty: 'Dermatology' },
];

/** [doctor, days of the week (1 is Monday), start, end] */
const HOURS: [number, number[], string, string][] = [
  [1, [1, 2, 3, 4, 5], '08:00', '12:00'],
  [1, [1, 2, 3, 4, 5], '14:00', '17:00'],
  [2, [1, 3, 5], '09:00', '13:00'],
  [3, [2, 4], '13:00', '18:00'],
  [3, [6], '08:00', '12:00'],
];

export const seedWorkingHours = HOURS.flatMap(([doctorId, weekdays, startsAt, endsAt]) =>
  weekdays.map((weekday) => ({ doctorId, weekday, startsAt, endsAt })),
);

// The sample CPFs are valid ones (their check digits are worked out); the plans are made up.
export const seedPatients = [
  { id: 1, name: 'Ana Beatriz Costa', phone: '(11) 98888-1001', email: 'ana.costa@example.com', birthDate: '1988-04-12', cpf: cpfFrom('390533447'), healthPlan: 'Horizonte Saúde' },
  { id: 2, name: 'Bruno Carvalho', phone: '11 97777-2002', email: 'bruno.carvalho@example.com', birthDate: '1975-11-03', cpf: cpfFrom('153509460'), healthPlan: 'Amparo Vida' },
  { id: 3, name: 'Camila Duarte', phone: '+55 11 96666-3003', email: 'camila.duarte@example.com', birthDate: '1993-07-25', cpf: cpfFrom('713498016'), healthPlan: 'Private' },
  { id: 4, name: 'Davi Fernandes', phone: '(11) 3555-4004', email: 'familia.fernandes@example.com', birthDate: '2019-02-14', cpf: cpfFrom('426117238'), healthPlan: 'Horizonte Saúde' },
  { id: 5, name: 'Elisa Gomes', phone: '11955555005', email: null, birthDate: '2021-09-30', cpf: cpfFrom('829365104'), healthPlan: 'Horizonte Saúde' },
  { id: 6, name: 'Fábio Henrique Lima', phone: '(11) 94444-6006', email: 'fabio.lima@example.com', birthDate: '1962-01-19', cpf: cpfFrom('261804973'), healthPlan: 'Vila Clara Care' },
  { id: 7, name: 'Giovana Martins', phone: '11 93333-7007', email: 'giovana.martins@example.com', birthDate: '2001-06-08', cpf: cpfFrom('548271690'), healthPlan: 'Amparo Vida' },
  { id: 8, name: 'Heitor Nogueira', phone: '(11) 92222-8008', email: 'heitor.nogueira@example.com', birthDate: '1949-12-27', cpf: cpfFrom('937046152'), healthPlan: 'Private' },
];

/** [week (0 is this week), day of the week, doctor, time, patient, status, reason] */
const APPOINTMENTS: [number, number, number, string, number, AppointmentStatus, string][] = [
  [-1, 1, 1, '09:00', 1, 'confirmed', 'Check-up'],
  [-1, 2, 3, '13:30', 1, 'confirmed', 'Skin rash'],
  [-1, 3, 2, '09:00', 4, 'confirmed', 'Vaccination'],
  [-1, 4, 1, '15:00', 2, 'cancelled', 'Back pain'],
  [-1, 5, 1, '10:30', 3, 'confirmed', 'Blood test'],
  [0, 1, 1, '08:00', 1, 'confirmed', 'Check-up results'],
  [0, 1, 1, '08:30', 2, 'scheduled', 'Back pain'],
  [0, 1, 2, '09:00', 4, 'scheduled', 'Vaccination'],
  [0, 1, 2, '09:30', 5, 'cancelled', 'Fever'],
  [0, 1, 1, '10:00', 3, 'scheduled', 'Blood test results'],
  [0, 1, 1, '14:00', 6, 'scheduled', 'Follow-up'],
  [0, 2, 1, '09:00', 7, 'scheduled', 'Headaches'],
  [0, 2, 1, '11:00', 2, 'confirmed', 'Back pain follow-up'],
  [0, 2, 3, '13:00', 8, 'scheduled', 'Mole check'],
  [0, 2, 3, '15:30', 1, 'cancelled', 'Skin rash follow-up'],
  [0, 3, 1, '08:00', 5, 'scheduled', 'Cough'],
  [0, 3, 2, '10:00', 6, 'scheduled', 'Second opinion'],
  [0, 4, 3, '14:00', 3, 'scheduled', 'Acne'],
  [0, 5, 1, '16:30', 4, 'scheduled', 'School certificate'],
  [0, 5, 2, '12:30', 7, 'scheduled', 'Allergy'],
  [0, 6, 3, '08:00', 2, 'scheduled', 'Sunburn'],
  [1, 1, 1, '08:00', 8, 'scheduled', 'Blood pressure'],
  [1, 3, 2, '11:00', 1, 'scheduled', 'Vaccination'],
];

export interface SeedAppointment {
  patientId: number;
  doctorId: number;
  day: string;
  time: string;
  status: AppointmentStatus;
  reason: string;
}

/** The sample appointments around `today`. One that was only scheduled and is now past counts as confirmed. */
export function seedAppointments(today: string): SeedAppointment[] {
  const monday = mondayOf(today);
  return APPOINTMENTS.map(([week, weekday, doctorId, time, patientId, status, reason]) => {
    const day = addDays(monday, week * 7 + weekday - 1);
    return { patientId, doctorId, day, time, status: day < today && status === 'scheduled' ? 'confirmed' : status, reason };
  });
}
