import { LEVO_DOSE_LABEL } from '@/lib/brand';

export const PROTOCOL = {
  levothyroxine: {
    time: '11:00',
    dose: LEVO_DOSE_LABEL,
    label: 'Levotiroxina',
  },

  fastBreak: {
    time: '12:00',
    label: 'Rompe ayuno',
    minutesAfterPill: 60,
  },

  lastMeal: {
    time: '20:00',
    label: 'Última comida',
    note: 'Inicia ayuno 16h',
  },

  fast: {
    durationHours: 16,
    maxHours: 17,
    startHour: 20,
    endHour: 12,
  },
} as const;

export const EATING_WINDOW = {
  start: '12:00',
  end: '20:00',
  durationHours: 8,
};

export function getFastStart(now = new Date()): Date {
  const start = new Date(now);
  start.setHours(20, 0, 0, 0);
  if (now.getHours() < 20) {
    start.setDate(start.getDate() - 1);
  }
  return start;
}

export function getFastBreak(fastStart: Date): Date {
  const end = new Date(fastStart);
  end.setDate(end.getDate() + 1);
  end.setHours(12, 0, 0, 0);
  return end;
}

export function getFastDeadline(fastStart: Date): Date {
  return new Date(fastStart.getTime() + PROTOCOL.fast.maxHours * 3600 * 1000);
}

export function getFastElapsed(now = new Date()): number {
  const fastStart = getFastStart(now);
  const ms = now.getTime() - fastStart.getTime();
  return Math.max(0, ms / (1000 * 60 * 60));
}

export function isEatingWindow(now = new Date()): boolean {
  const h = now.getHours();
  const m = now.getMinutes();
  const totalMinutes = h * 60 + m;
  return totalMinutes >= 12 * 60 && totalMinutes < 20 * 60;
}

export function getTodaySchedule() {
  return [
    { time: '11:00', key: 'pill', label: `Levotiroxina ${LEVO_DOSE_LABEL}`, type: 'medication' as const },
    { time: '12:00', key: 'fastBreak', label: 'Rompe ayuno', type: 'meal' as const },
    { time: '14:00', key: 'walkLunch', label: 'Caminata ligera post-almuerzo (8–12 min)', type: 'activity' as const },
    { time: '20:00', key: 'lastMeal', label: 'Última comida', type: 'meal' as const },
    { time: '21:00', key: 'walkDinner', label: 'Caminata suave post-cena (10 min)', type: 'activity' as const },
  ];
}
