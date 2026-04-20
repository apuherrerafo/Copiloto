import { LEVO_DOSE_LABEL } from '@/lib/brand';
import { readProtocolSettings, type UserProtocolSettings } from '@/lib/protocols/user-protocol';

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

/** Static defaults (SSR / tests). Runtime UI should use `getProtocolSnapshot()`. */
export const PROTOCOL = {
  levothyroxine: {
    time: '11:00',
    dose: LEVO_DOSE_LABEL,
    label: 'Levothyroxine',
  },
  fastBreak: { time: '12:00', label: 'Break the fast', minutesAfterPill: 60 },
  lastMeal: { time: '20:00', label: 'Last meal', note: 'Starts 16h fast' },
  fast: { durationHours: 16, maxHours: 17, startHour: 20, endHour: 12 },
} as const;

export const EATING_WINDOW = {
  start: '12:00',
  end: '20:00',
  durationHours: 8,
};

/** Live protocol from saved user settings (client). */
export function getProtocolSnapshot(s?: UserProtocolSettings) {
  const x = s ?? readProtocolSettings();
  const eatDur = Math.max(0, x.eatingWindowEndHour - x.breakFastHour);
  return {
    levothyroxine: {
      time: `${pad2(x.levoHour)}:${pad2(x.levoMinute)}`,
      dose: LEVO_DOSE_LABEL,
      label: 'Levothyroxine',
    },
    fastBreak: {
      time: `${pad2(x.breakFastHour)}:00`,
      label: 'Break the fast',
      minutesAfterPill: 60,
    },
    lastMeal: {
      time: `${pad2(x.eatingWindowEndHour)}:00`,
      label: 'Last meal',
      note: 'Starts overnight fast',
    },
    fast: {
      durationHours: x.targetFastHours,
      maxHours: x.maxFastHours,
      startHour: x.eveningFastStartHour,
      endHour: x.breakFastHour,
    },
    eatingWindowDurationHours: eatDur,
    eatingWindowEndHour: x.eatingWindowEndHour,
  };
}

export function getEatingWindowMeta() {
  const x = readProtocolSettings();
  return {
    start: `${pad2(x.breakFastHour)}:00`,
    end: `${pad2(x.eatingWindowEndHour)}:00`,
    durationHours: Math.max(0, x.eatingWindowEndHour - x.breakFastHour),
  };
}

export function getFastStart(now = new Date()): Date {
  const s = readProtocolSettings();
  const h = s.eveningFastStartHour;
  const start = new Date(now);
  start.setHours(h, 0, 0, 0);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const cutMin = h * 60;
  if (nowMin < cutMin) {
    start.setDate(start.getDate() - 1);
  }
  return start;
}

export function getFastBreak(fastStart: Date): Date {
  const s = readProtocolSettings();
  const end = new Date(fastStart);
  end.setDate(end.getDate() + 1);
  end.setHours(s.breakFastHour, 0, 0, 0);
  return end;
}

export function getFastDeadline(fastStart: Date): Date {
  const s = readProtocolSettings();
  return new Date(fastStart.getTime() + s.maxFastHours * 3600 * 1000);
}

export function getFastElapsed(now = new Date()): number {
  const fastStart = getFastStart(now);
  const ms = now.getTime() - fastStart.getTime();
  return Math.max(0, ms / (1000 * 60 * 60));
}

/**
 * UI fast hours: during the eating window the overnight timer should not keep climbing;
 * if the user marked "break fast" for today before the window ends, treat the fast as reset for display.
 */
export function getDisplayFastElapsed(
  now = new Date(),
  opts?: { brokeFastToday?: boolean },
): number {
  if (isEatingWindow(now)) return 0;
  const s = readProtocolSettings();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const endMin = s.eatingWindowEndHour * 60;
  if (opts?.brokeFastToday && nowMin < endMin) return 0;
  return getFastElapsed(now);
}

export function isEatingWindow(now = new Date()): boolean {
  const s = readProtocolSettings();
  const totalMinutes = now.getHours() * 60 + now.getMinutes();
  const startM = s.breakFastHour * 60;
  const endM = s.eatingWindowEndHour * 60;
  return totalMinutes >= startM && totalMinutes < endM;
}

export function getMinutesUntilFastDeadline(now = new Date()): number {
  const d = getFastDeadline(getFastStart(now));
  return Math.max(0, Math.round((d.getTime() - now.getTime()) / 60000));
}

export function getMinutesUntilEatingWindowCloses(now = new Date()): number | null {
  if (!isEatingWindow(now)) return null;
  const s = readProtocolSettings();
  const end = new Date(now);
  end.setHours(s.eatingWindowEndHour, 0, 0, 0);
  return Math.max(0, Math.round((end.getTime() - now.getTime()) / 60000));
}

export function getTodaySchedule() {
  const x = readProtocolSettings();
  const p = getProtocolSnapshot(x);
  const lunchWalkH = Math.min(16, x.breakFastHour + 2);
  const dinnerWalkH = Math.min(23, x.eatingWindowEndHour + 1);
  return [
    {
      time: p.levothyroxine.time,
      key: 'pill',
      label: `Levothyroxine ${LEVO_DOSE_LABEL}`,
      type: 'medication' as const,
    },
    { time: p.fastBreak.time, key: 'fastBreak', label: 'Break the fast', type: 'meal' as const },
    {
      time: `${pad2(lunchWalkH)}:00`,
      key: 'walkLunch',
      label: 'Light post-lunch walk (8–12 min)',
      type: 'activity' as const,
    },
    {
      time: p.lastMeal.time,
      key: 'lastMeal',
      label: 'Last meal',
      type: 'meal' as const,
    },
    {
      time: `${pad2(dinnerWalkH)}:00`,
      key: 'walkDinner',
      label: 'Gentle post-dinner walk (10 min)',
      type: 'activity' as const,
    },
  ];
}
