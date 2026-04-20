'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  computeMonthlyCompliance,
  computeRollingCompliance,
  type ComplianceResult,
  type RingDatum,
} from '@/lib/history/monthly-compliance';

const CX = 84;
const CY = 84;
/** Radii from outer to inner — medication, walks, break fast, last meal */
const RADII = [62, 50, 38, 26];
const STROKE = 5.5;

function arcRing({ r, data }: { r: number; data: RingDatum }) {
  const c = 2 * Math.PI * r;
  const dash = Math.max(0.02, Math.min(1, data.value)) * c;
  return (
    <g key={data.id}>
      <circle cx={CX} cy={CY} r={r} fill="none" stroke={data.track} strokeWidth={STROKE} />
      <circle
        cx={CX}
        cy={CY}
        r={r}
        fill="none"
        stroke={data.color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        transform={`rotate(-90 ${CX} ${CY})`}
        className="transition-[stroke-dasharray] duration-700 ease-out"
      />
    </g>
  );
}

function MiniRingCard({ data }: { data: RingDatum }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0.02, Math.min(1, data.value)) * c;
  return (
    <div className="flex flex-col items-center rounded-2xl border border-sage/15 bg-white/80 px-3 py-3 shadow-sm backdrop-blur-sm">
      <svg viewBox="0 0 88 88" className="h-[4.75rem] w-[4.75rem] shrink-0" aria-hidden>
        <circle
          cx={44}
          cy={44}
          r={r}
          fill="none"
          stroke={data.track}
          strokeWidth={7}
        />
        <circle
          cx={44}
          cy={44}
          r={r}
          fill="none"
          stroke={data.color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 44 44)"
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
      </svg>
      <p className="mt-1.5 font-mono text-[1.1rem] font-bold tabular-nums text-ink">
        {Math.round(data.value * 100)}%
      </p>
      <p className="mt-0.5 line-clamp-2 text-center text-[11px] font-medium leading-tight text-muted">
        {data.label}
      </p>
    </div>
  );
}

type PeriodMode = 'week' | 'month';

export default function MonthlyComplianceRings() {
  const [mode, setMode] = useState<PeriodMode>('month');
  const [cursor, setCursor] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [data, setData] = useState<ComplianceResult | null>(null);

  const apply = useCallback(() => {
    if (mode === 'week') {
      setData(computeRollingCompliance(7));
    } else {
      setData(computeMonthlyCompliance(cursor.getFullYear(), cursor.getMonth()));
    }
  }, [mode, cursor]);

  useEffect(() => {
    apply();
  }, [apply]);

  useEffect(() => {
    const onRefresh = () => apply();
    window.addEventListener('copiloto-refresh', onRefresh);
    window.addEventListener('hypo-storage-sync', onRefresh);
    return () => {
      window.removeEventListener('copiloto-refresh', onRefresh);
      window.removeEventListener('hypo-storage-sync', onRefresh);
    };
  }, [apply]);

  function prevMonth() {
    setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    const t = new Date();
    const cap = new Date(t.getFullYear(), t.getMonth(), 1);
    setCursor((d) => {
      const n = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      return n.getTime() > cap.getTime() ? d : n;
    });
  }

  const today = new Date();
  const nextDisabled =
    cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth();

  return (
    <section
      className="mb-5 overflow-hidden rounded-[1.35rem] border border-white/80 bg-white/90 shadow-soft backdrop-blur-sm"
      aria-label="Protocol compliance stats"
    >
      <div className="border-b border-hairline/50 bg-gradient-to-r from-sage/[0.06] to-transparent px-4 py-3.5">
        <div className="mb-2.5 flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Stats</p>
            <p className="mt-0.5 font-serif text-[1.15rem] italic leading-tight text-ink">
              Plan compliance
            </p>
          </div>
          <div
            className="flex shrink-0 rounded-full border border-hairline/90 bg-background/70 p-0.5 shadow-inner"
            role="group"
            aria-label="Time range"
          >
            <button
              type="button"
              onClick={() => setMode('week')}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                mode === 'week'
                  ? 'bg-sage text-white shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              W
            </button>
            <button
              type="button"
              onClick={() => setMode('month')}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                mode === 'month'
                  ? 'bg-sage text-white shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              M
            </button>
          </div>
        </div>

        {mode === 'month' ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-semibold text-sage/95">{data?.periodTitle}</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-hairline/80 bg-white text-ink shadow-sm transition-transform active:scale-95"
                aria-label="Previous month"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={nextMonth}
                disabled={nextDisabled}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-hairline/80 bg-white text-ink shadow-sm transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Next month"
              >
                ›
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[12px] font-semibold text-sage/95">
            Last 7 days <span className="text-muted/90">({data?.periodTitle})</span>
          </p>
        )}
      </div>

      <div className="p-4">
        {!data || data.eligibleDays === 0 ? (
          <p className="rounded-xl border border-dashed border-hairline/80 bg-background/50 px-3 py-4 text-center text-[12px] leading-snug text-muted">
            No completed days in this range yet — check off items in your day plan as you go.
          </p>
        ) : (
          <>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
              By habit
            </p>
            <div className="mb-5 grid grid-cols-2 gap-2.5 sm:gap-3">
              {data.rings.map((r) => (
                <MiniRingCard key={r.id} data={r} />
              ))}
            </div>

            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
              Combined view
            </p>
            <div className="rounded-2xl border border-white/10 bg-[#12151c] p-4 text-white shadow-inner">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto shrink-0 sm:mx-0"
                >
                  <svg
                    viewBox="0 0 168 168"
                    className="h-[10.5rem] w-[10.5rem]"
                    role="img"
                    aria-label="Concentric compliance rings overview"
                  >
                    {RADII.map((r, i) =>
                      data.rings[i] ? arcRing({ r, data: data.rings[i]! }) : null,
                    )}
                  </svg>
                </motion.div>

                <ul className="min-w-0 flex-1 space-y-2">
                  {data.rings.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/30"
                          style={{ backgroundColor: r.color }}
                        />
                        <span className="truncate text-[13px] font-medium text-white/95">{r.label}</span>
                      </div>
                      <span className="shrink-0 font-mono text-[12px] font-semibold tabular-nums text-white/75">
                        {Math.round(r.value * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-3 text-center text-[10px] leading-snug text-muted/85">
              From day-plan checkmarks for {data.eligibleDays}{' '}
              {data.eligibleDays === 1 ? 'day' : 'days'}
              {mode === 'week' ? ' (rolling week)' : ' in this month'} — medication, walks, break fast,
              last meal.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
