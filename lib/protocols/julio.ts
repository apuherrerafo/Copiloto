import { LEVO_DOSE_LABEL } from '@/lib/brand';

export const PROTOCOL = {
  levothyroxine: {
    time: '11:00',
    dose: LEVO_DOSE_LABEL,
    label: 'Levothyroxine',
  },

  fastBreak: {
    time: '12:00',
    label: 'Break the fast',
    minutesAfterPill: 60,
  },

  lastMeal: {
    time: '20:00',
    label: 'Last meal',
    note: 'Starts 16h fast',
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

/** Minutes until the 17h fast mark from last night's fast start (0 once past deadline). */
export function getMinutesUntilFastDeadline(now = new Date()): number {
  const d = getFastDeadline(getFastStart(now));
  return Math.max(0, Math.round((d.getTime() - now.getTime()) / 60000));
}

/** Minutes until 20:00 same calendar day; null if outside the eating window. */
export function getMinutesUntilEatingWindowCloses(now = new Date()): number | null {
  if (!isEatingWindow(now)) return null;
  const end = new Date(now);
  end.setHours(20, 0, 0, 0);
  return Math.max(0, Math.round((end.getTime() - now.getTime()) / 60000));
}

export function getTodaySchedule() {
  return [
    { time: '11:00', key: 'pill', label: `Levothyroxine ${LEVO_DOSE_LABEL}`, type: 'medication' as const },
    { time: '12:00', key: 'fastBreak', label: 'Break the fast', type: 'meal' as const },
    { time: '14:00', key: 'walkLunch', label: 'Light post-lunch walk (8–12 min)', type: 'activity' as const },
    { time: '20:00', key: 'lastMeal', label: 'Last meal', type: 'meal' as const },
    { time: '21:00', key: 'walkDinner', label: 'Gentle post-dinner walk (10 min)', type: 'activity' as const },
  ];
}
