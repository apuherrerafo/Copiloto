// Julio's fixed metabolic protocol — source of truth for all logic

export const PROTOCOL = {
  levothyroxine: {
    time: '11:00',
    dose: '75mcg',
    label: 'Levotiroxina',
  },

  fastBreak: {
    time: '12:00', // 60 min post-levothyroxine
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
    startHour: 20,   // 8:00 PM
    endHour: 12,     // 12:00 PM next day
  },
};

export const EATING_WINDOW = {
  start: '12:00',
  end: '20:00',
  durationHours: 8,
};

/** Returns fast start time (today 20:00 or yesterday 20:00) given current Date */
export function getFastStart(now = new Date()) {
  const start = new Date(now);
  start.setHours(20, 0, 0, 0);
  if (now.getHours() < 20) {
    start.setDate(start.getDate() - 1);
  }
  return start;
}

/** Returns scheduled fast break time (next day 12:00 after fast start) */
export function getFastBreak(fastStart) {
  const end = new Date(fastStart);
  end.setDate(end.getDate() + 1);
  end.setHours(12, 0, 0, 0);
  return end;
}

/** Returns fast deadline (fast start + maxHours) */
export function getFastDeadline(fastStart) {
  const deadline = new Date(fastStart);
  deadline.setHours(deadline.getHours() + PROTOCOL.fast.maxHours);
  return deadline;
}

/** Returns elapsed fast hours from fastStart to now */
export function getFastElapsed(now = new Date()) {
  const fastStart = getFastStart(now);
  const ms = now - fastStart;
  return Math.max(0, ms / (1000 * 60 * 60));
}

/** Returns true if currently inside eating window */
export function isEatingWindow(now = new Date()) {
  const h = now.getHours();
  const m = now.getMinutes();
  const totalMinutes = h * 60 + m;
  return totalMinutes >= 12 * 60 && totalMinutes < 20 * 60;
}

/** Returns today's schedule as ordered event array */
export function getTodaySchedule() {
  return [
    { time: '11:00', key: 'pill',      label: 'Levotiroxina 75mcg', type: 'medication' },
    { time: '12:00', key: 'fastBreak', label: 'Rompe ayuno',        type: 'meal' },
    { time: '20:00', key: 'lastMeal',  label: 'Última comida',      type: 'meal' },
  ];
}
