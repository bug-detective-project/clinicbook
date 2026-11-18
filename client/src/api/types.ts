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

export interface Patient {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  birthDate: string | null;
}

export interface Reminder {
  id: number;
  appointmentId: number;
  patientName: string;
  phone: string;
  message: string;
  createdAt: string;
}
