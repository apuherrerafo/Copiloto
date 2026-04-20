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

export default function AbsorptionRing() {
  const today = localDateISO();
  const [now, setNow] = useState(() => new Date());
  const [levoAt, setLevoAt] = useState<number | null>(null);

  const load = useCallback(async () => {
    const logs = await getLogsByDate(today);
    setLevoAt(getLastLevothyroxineTimestampForDay(logs, today));
  }, [today]);

  useEffect(() => { void load(); }, [load]);

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
    <section
      className="rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-soft"
      aria-label="Levothyroxine absorption window"
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base leading-none">💊</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted truncate">
            Pill absorption
          </span>
          {inWindow && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber animate-pulse" />
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
          >
            {levoAt ? 'Update' : 'Log'}
          </Link>
        </div>
      </div>

      {/* Progress bar */}
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

      {/* Hint */}
      <p className="mt-1.5 text-[10px] leading-snug text-muted/80">
        {inWindow
          ? `Wait ${LEVO_ABSORPTION_MINUTES} min before coffee, food, or supplements.`
          : levoAt
            ? 'Absorption complete — coffee and meals OK per your protocol.'
            : `Log your dose to start the ${LEVO_ABSORPTION_MINUTES}-min absorption timer.`}
      </p>
    </section>
  );
}
