import { localDateISO } from '@/lib/dates';
import { loadProtocolChecks } from '@/lib/protocol-checks';

export type RingDatum = {
  id: string;
  label: string;
  value: number; // 0–1
  color: string;
  track: string;
};

export type MonthlyComplianceResult = {
  eligibleDays: number;
  monthTitle: string;
  rings: RingDatum[];
};

/**
 * Protocol checkmarks for past days in a calendar month (local).
 * Walks = average of lunch + dinner walk checks per day, then averaged over the month.
 */
export function computeMonthlyCompliance(year: number, monthIndex: number): MonthlyComplianceResult {
  if (typeof window === 'undefined') {
    return {
      eligibleDays: 0,
      monthTitle: '',
      rings: [],
    };
  }

  const today = new Date();
  const todayISO = localDateISO(today);
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();

  let pill = 0;
  let fastBreak = 0;
  let lastMeal = 0;
  let walkSum = 0;
  let eligible = 0;

  for (let d = 1; d <= lastDay; d++) {
    const cur = new Date(year, monthIndex, d);
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
  }

  const n = Math.max(1, eligible);
  const monthTitle = new Date(year, monthIndex, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const rings: RingDatum[] = [
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

  return { eligibleDays: eligible, monthTitle, rings };
}
