import { localDateISO } from '@/lib/dates';

export type AppointmentType = 'medico' | 'examen' | 'lab' | 'otro';

export interface Appointment {
  id: string;
  date: string;       // YYYY-MM-DD
  time?: string;      // HH:MM opcional
  title: string;
  type: AppointmentType;
  notes?: string;
}

const KEY = 'copiloto_appointments';

export function loadAppointments(): Appointment[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Appointment[]) : [];
  } catch {
    return [];
  }
}

export function saveAppointments(list: Appointment[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function addAppointment(apt: Omit<Appointment, 'id'>): Appointment {
  const list = loadAppointments();
  const entry: Appointment = {
    ...apt,
    id: `apt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
  list.push(entry);
  list.sort((a, b) => (a.date + (a.time ?? '')) < (b.date + (b.time ?? '')) ? -1 : 1);
  saveAppointments(list);
  return entry;
}

export function removeAppointment(id: string): void {
  const list = loadAppointments().filter((a) => a.id !== id);
  saveAppointments(list);
}

export function getAppointmentsByDate(date: string): Appointment[] {
  return loadAppointments().filter((a) => a.date === date);
}

export function getUpcomingAppointments(from = new Date()): Appointment[] {
  const today = localDateISO(from);
  return loadAppointments().filter((a) => a.date >= today);
}

export const TYPE_LABELS: Record<AppointmentType, string> = {
  medico: '🩺 Doctor',
  examen: '🔬 Exam',
  lab:    '🧪 Lab',
  otro:   '📅 Other',
};
