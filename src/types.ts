export interface BenefitItem {
  id: string;
  title: string;
  description: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  timePracticing: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface StudioImage {
  id: string;
  title: string;
  description: string;
  url: string;
  aspect: string;
}

export interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  interest: string;
  preferredTime: string;
  acceptedPrivacy: boolean;
}

export type AppointmentStatus = 'confirmado' | 'pendente' | 'concluido' | 'cancelado';

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "08:00"
  service: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface ScheduleConfig {
  activeDays: number[]; // 0=Dom, 1=Seg, ..., 6=Sab
  availableSlots: string[]; // ["07:00", "08:00", ...]
  sessionDurationMinutes: number;
  maxPatientsPerSlot: number;
  blockedDates: string[]; // YYYY-MM-DD
}

