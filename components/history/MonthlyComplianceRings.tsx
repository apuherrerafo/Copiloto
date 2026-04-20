'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  computeMonthlyCompliance,
  type MonthlyComplianceResult,
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
      <circle
        cx={CX}
        cy={CY}
        r={r}
        fill="none"
        stroke={data.track}
        strokeWidth={STROKE}
      />
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

export default function MonthlyComplianceRings() {
  const [cursor, setCursor] = useState(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });
  const [data, setData] = useState<MonthlyComplianceResult | null>(null);

  const apply = useCallback(() => {
    setData(computeMonthlyCompliance(cursor.getFullYear(), cursor.getMonth()));
  }, [cursor]);

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
      className="mb-5 rounded-[1.35rem] border border-white/80 bg-white/90 p-4 shadow-soft backdrop-blur-sm"
      aria-label="Monthly protocol compliance"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            Month overview
          </p>
          <p className="mt-0.5 font-serif text-[1.15rem] italic leading-tight text-ink">
            How you stuck to the plan
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-hairline/80 bg-white text-ink shadow-sm transition-transform active:scale-95"
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={nextMonth}
            disabled={nextDisabled}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-hairline/80 bg-white text-ink shadow-sm transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      <p className="mb-3 text-center text-[12px] font-semibold text-sage/95">{data?.monthTitle}</p>

      {!data || data.eligibleDays === 0 ? (
        <p className="rounded-xl border border-dashed border-hairline/80 bg-background/50 px-3 py-4 text-center text-[12px] leading-snug text-muted">
          No completed days in this month yet — check off items in your day plan as you go.
        </p>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto shrink-0 sm:mx-0"
          >
            <svg
              viewBox="0 0 168 168"
              className="h-[11.25rem] w-[11.25rem]"
              role="img"
              aria-label="Concentric compliance rings"
            >
              {RADII.map((r, i) =>
                data.rings[i] ? arcRing({ r, data: data.rings[i]! }) : null,
              )}
            </svg>
          </motion.div>

          <ul className="min-w-0 flex-1 space-y-2.5">
            {data.rings.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-hairline/60 bg-white/70 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white shadow-sm"
                    style={{ backgroundColor: r.color }}
                  />
                  <span className="truncate text-[13px] font-medium text-ink">{r.label}</span>
                </div>
                <span className="shrink-0 font-mono text-[12px] font-semibold tabular-nums text-muted">
                  {Math.round(r.value * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data && data.eligibleDays > 0 && (
        <p className="mt-3 text-center text-[10px] leading-snug text-muted/85">
          Based on your day plan checkmarks for {data.eligibleDays}{' '}
          {data.eligibleDays === 1 ? 'day' : 'days'} this month (medication, walks, break fast, last
          meal).
        </p>
      )}
    </section>
  );
}
