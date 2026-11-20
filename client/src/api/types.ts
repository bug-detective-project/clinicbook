export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled';

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  day: string;
  time: string;
  status: AppointmentStatus;
  reason: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
}

/** A period a doctor works on a day of the week (1 is Monday, 7 is Sunday). */
export interface Hours {
  weekday: number;
  startsAt: string;
  endsAt: string;
}

export interface DoctorWithHours extends Doctor {
  hours: Hours[];
}

export interface Patient {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  birthDate: string | null;
  /** The 11 digits of the patient's CPF. */
  cpf: string;
  /** The health plan, as the front desk wrote it ("Private" for none). */
  healthPlan: string;
}

export interface Reminder {
  id: number;
  appointmentId: number;
  patientName: string;
  phone: string;
  message: string;
  createdAt: string;
}
