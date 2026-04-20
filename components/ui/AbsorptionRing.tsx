'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getAbsorptionWindowEndMs,
  getLastLevothyroxineTimestampForDay,
  LEVO_ABSORPTION_MINUTES,
} from '@/lib/protocols/absorption';
import { getLogsByDate } from '@/lib/store/db';
import { localDateISO } from '@/lib/dates';

function formatCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return '0:00';
  const totalSec = Math.ceil(msRemaining / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function AbsorptionRing() {
  const today = localDateISO();
  const [now, setNow] = useState(() => new Date());
  const [levoAt, setLevoAt] = useState<number | null>(null);
  const [accordionOpen, setAccordionOpen] = useState(false);

  const load = useCallback(async () => {
    const logs = await getLogsByDate(today);
    setLevoAt(getLastLevothyroxineTimestampForDay(logs, today));
  }, [today]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    const onRefresh = () => void load();
    window.addEventListener('copiloto-refresh', onRefresh);
    return () => {
      clearInterval(id);
      window.removeEventListener('copiloto-refresh', onRefresh);
    };
  }, [load]);

  const endMs = levoAt != null ? getAbsorptionWindowEndMs(levoAt) : null;
  const remaining = endMs != null ? endMs - now.getTime() : 0;
  const inWindow = levoAt != null && remaining > 0;
  const progress =
    levoAt != null && endMs != null
      ? Math.min(1, Math.max(0, (now.getTime() - levoAt) / (endMs - levoAt)))
      : 0;

  return (
    <details
      className="rounded-2xl border border-white/70 bg-white/85 shadow-soft open:shadow-glass"
      open={accordionOpen}
      onToggle={(e) => setAccordionOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-3 [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-base leading-none">💊</span>
          <span className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
            Pill absorption
          </span>
          {inWindow && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber animate-pulse" />
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {inWindow ? (
            <span className="font-mono text-sm font-semibold tabular-nums text-ink">
              {formatCountdown(remaining)}
            </span>
          ) : levoAt ? (
            <span className="text-[11px] font-semibold text-sage">Clear ✓</span>
          ) : (
            <span className="text-[11px] text-muted/70">Not logged</span>
          )}
          <Link
            href="/registrar"
            className="rounded-xl border border-sage/30 bg-sage/10 px-2.5 py-1 text-[11px] font-semibold text-sage hover:bg-sage/15 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {levoAt ? 'Update' : 'Log'}
          </Link>
          <Chevron open={accordionOpen} />
        </div>
      </summary>

      <div className="border-t border-hairline/70 px-4 pb-3 pt-1">
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/6">
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-out"
            style={{
              width: `${progress * 100}%`,
              background: inWindow
                ? 'linear-gradient(90deg, #5B7A65, #C4A574)'
                : levoAt
                  ? '#5B7A65'
                  : 'transparent',
            }}
          />
        </div>

        <p className="mt-2 text-[10px] leading-snug text-muted/80">
          {inWindow
            ? `Wait ${LEVO_ABSORPTION_MINUTES} min before coffee, food, or supplements.`
            : levoAt
              ? 'Absorption complete — coffee and meals OK per your protocol.'
              : `Log your dose to start the ${LEVO_ABSORPTION_MINUTES}-min absorption timer.`}
        </p>
      </div>
    </details>
  );
}
