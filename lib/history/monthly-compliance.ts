import { localDateISO } from '@/lib/dates';
import { loadProtocolChecks } from '@/lib/protocol-checks';

export type RingDatum = {
  id: string;
  label: string;
  value: number; // 0–1
  color: string;
  track: string;
};

/** Shared shape for week range or calendar month. */
export type ComplianceResult = {
  eligibleDays: number;
  periodTitle: string;
  rings: RingDatum[];
};

function buildRings(
  pill: number,
  walkSum: number,
  fastBreak: number,
  lastMeal: number,
  eligible: number,
): RingDatum[] {
  const n = Math.max(1, eligible);
  return [
    {
      id: 'pill',
      label: 'Medication',
      value: pill / n,
      color: '#5B7A65',
      track: 'rgba(91, 122, 101, 0.14)',
    },
    {
      id: 'walks',
      label: 'Walks',
      value: walkSum / n,
      color: '#0ea5e9',
      track: 'rgba(14, 165, 233, 0.12)',
    },
    {
      id: 'breakFast',
      label: 'Break fast',
      value: fastBreak / n,
      color: '#C09050',
      track: 'rgba(192, 144, 80, 0.15)',
    },
    {
      id: 'lastMeal',
      label: 'Last meal',
      value: lastMeal / n,
      color: '#C47663',
      track: 'rgba(196, 118, 99, 0.14)',
    },
  ];
}

/**
 * Walks = average of lunch + dinner walk checks per day, then averaged over the range.
 */
export function computeComplianceBetween(
  rangeStart: Date,
  rangeEnd: Date,
  periodTitle: string,
): ComplianceResult {
  if (typeof window === 'undefined') {
    return { eligibleDays: 0, periodTitle: '', rings: [] };
  }

  const todayISO = localDateISO(new Date());
  const start = new Date(rangeStart);
  start.setHours(0, 0, 0, 0);
  const end = new Date(rangeEnd);
  end.setHours(0, 0, 0, 0);

  let pill = 0;
  let fastBreak = 0;
  let lastMeal = 0;
  let walkSum = 0;
  let eligible = 0;

  const cur = new Date(start);
  while (cur <= end) {
    const iso = localDateISO(cur);
    if (iso > todayISO) break;

    eligible++;
    const c = loadProtocolChecks(cur);
    if (c.pill) pill++;
    if (c.fastBreak) fastBreak++;
    if (c.lastMeal) lastMeal++;
    const w1 = c.walkLunch ? 1 : 0;
    const w2 = c.walkDinner ? 1 : 0;
    walkSum += (w1 + w2) / 2;
    cur.setDate(cur.getDate() + 1);
  }

  return {
    eligibleDays: eligible,
    periodTitle,
    rings: buildRings(pill, walkSum, fastBreak, lastMeal, eligible),
  };
}

/** Rolling window ending today (local), last N calendar days including today. */
export function computeRollingCompliance(lastNDays: number): ComplianceResult {
  if (typeof window === 'undefined' || lastNDays < 1) {
    return { eligibleDays: 0, periodTitle: '', rings: [] };
  }
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - (lastNDays - 1));
  start.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setHours(0, 0, 0, 0);

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const periodTitle = `${fmt(start)} – ${fmt(end)}`;

  return computeComplianceBetween(start, end, periodTitle);
}

export function computeMonthlyCompliance(year: number, monthIndex: number): ComplianceResult {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const periodTitle = new Date(year, monthIndex, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  return computeComplianceBetween(first, last, periodTitle);
}
